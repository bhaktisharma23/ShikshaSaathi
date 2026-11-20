/**
 * Runs before every test file.
 * expo-sqlite's key-value store needs native code, which doesn't exist in Jest (Node.js),
 * so we replace it with a simple in-memory version.
 */
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
