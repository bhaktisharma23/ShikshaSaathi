/**
 * Runs before every test file.
 * Native modules don't exist in Jest (it runs in Node.js, not on a phone), so we swap
 * them for test versions that behave the same way.
 */

// Key-value settings → simple in-memory map.
jest.mock('expo-sqlite/kv-store', () => {
  const memory = new Map<string, string>();
  const storage = {
    getItemSync: (key: string) => memory.get(key) ?? null,
    setItemSync: (key: string, value: string) => void memory.set(key, value),
    getItem: async (key: string) => memory.get(key) ?? null,
    setItem: async (key: string, value: string) => void memory.set(key, value),
    clear: async () => memory.clear(),
  };
  return { __esModule: true, default: storage, Storage: storage, AsyncStorage: storage };
});

// App database → a fresh, real in-memory SQLite database (Node's built-in engine) each time it is opened.
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => require('./test-utils/node-sqlite').createNodeDatabase()),
}));

// UUIDs → Node's crypto.
jest.mock('expo-crypto', () => ({
  randomUUID: () => require('node:crypto').randomUUID(),
}));
