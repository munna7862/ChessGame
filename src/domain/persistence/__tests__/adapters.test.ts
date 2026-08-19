import { describe, it, expect, vi } from "vitest";
import { InMemoryPersistenceAdapter } from "../adapters/InMemoryPersistenceAdapter";
import { LocalStoragePersistenceAdapter } from "../adapters/LocalStoragePersistenceAdapter";
import { isErr, isOk } from "../errors";

describe("Persistence Storage Adapters (TC-PERSIST-01 to TC-PERSIST-03)", () => {
  describe("InMemoryPersistenceAdapter (TC-PERSIST-01)", () => {
    it("stores, retrieves, removes, and clears key-value pairs cleanly", () => {
      const adapter = new InMemoryPersistenceAdapter();

      expect(adapter.getItem("non_existent")).toEqual({
        success: true,
        data: null,
      });
      expect(adapter.size()).toBe(0);

      const setResult = adapter.setItem("test_key", "test_value");
      expect(isOk(setResult)).toBe(true);
      expect(adapter.size()).toBe(1);

      const getResult = adapter.getItem("test_key");
      expect(getResult).toEqual({ success: true, data: "test_value" });

      const keysResult = adapter.keys();
      expect(keysResult).toEqual({ success: true, data: ["test_key"] });

      const removeResult = adapter.removeItem("test_key");
      expect(isOk(removeResult)).toBe(true);
      expect(adapter.getItem("test_key")).toEqual({
        success: true,
        data: null,
      });
      expect(adapter.size()).toBe(0);

      adapter.setItem("k1", "v1");
      adapter.setItem("k2", "v2");
      expect(adapter.size()).toBe(2);

      const clearResult = adapter.clear();
      expect(isOk(clearResult)).toBe(true);
      expect(adapter.size()).toBe(0);
      expect(adapter.keys()).toEqual({ success: true, data: [] });
    });
  });

  describe("LocalStoragePersistenceAdapter (TC-PERSIST-02 & TC-PERSIST-03)", () => {
    const createMockStorage = (): Storage => {
      const store = new Map<string, string>();
      return {
        getItem: vi.fn((key: string) => store.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
          store.set(key, value);
        }),
        removeItem: vi.fn((key: string) => {
          store.delete(key);
        }),
        clear: vi.fn(() => {
          store.clear();
        }),
        key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
        get length() {
          return store.size;
        },
      } as unknown as Storage;
    };

    it("successfully delegates to provided Storage implementation (TC-PERSIST-02)", () => {
      const mockStorage = createMockStorage();
      const adapter = new LocalStoragePersistenceAdapter(mockStorage);

      expect(adapter.getItem("missing")).toEqual({ success: true, data: null });

      const setRes = adapter.setItem("app_state", JSON.stringify({ a: 1 }));
      expect(isOk(setRes)).toBe(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "app_state",
        JSON.stringify({ a: 1 })
      );

      const getRes = adapter.getItem("app_state");
      expect(getRes).toEqual({ success: true, data: JSON.stringify({ a: 1 }) });

      const keysRes = adapter.keys();
      expect(keysRes).toEqual({ success: true, data: ["app_state"] });

      const removeRes = adapter.removeItem("app_state");
      expect(isOk(removeRes)).toBe(true);

      adapter.setItem("k1", "v1");
      const clearRes = adapter.clear();
      expect(isOk(clearRes)).toBe(true);
      expect(mockStorage.clear).toHaveBeenCalled();
    });

    it("handles Storage exceptions safely without throwing unhandled errors (TC-PERSIST-03)", () => {
      const failingStorage = {
        getItem: vi.fn(() => {
          throw new Error("SecurityError: Access is denied");
        }),
        setItem: vi.fn(() => {
          throw new Error("QuotaExceededError: Storage quota exceeded");
        }),
        removeItem: vi.fn(() => {
          throw new Error("Disk write error");
        }),
        clear: vi.fn(() => {
          throw new Error("Clear failed");
        }),
        key: vi.fn(() => {
          throw new Error("Key access denied");
        }),
        length: 1,
      } as unknown as Storage;

      const adapter = new LocalStoragePersistenceAdapter(failingStorage);

      const getRes = adapter.getItem("key");
      expect(isErr(getRes)).toBe(true);
      if (isErr(getRes)) {
        expect(getRes.error.code).toBe("READ_FAILED");
        expect(getRes.error.message).toContain("SecurityError");
      }

      const setRes = adapter.setItem("key", "value");
      expect(isErr(setRes)).toBe(true);
      if (isErr(setRes)) {
        expect(setRes.error.code).toBe("WRITE_FAILED");
        expect(setRes.error.message).toContain("QuotaExceededError");
      }

      const removeRes = adapter.removeItem("key");
      expect(isErr(removeRes)).toBe(true);
      if (isErr(removeRes)) {
        expect(removeRes.error.code).toBe("WRITE_FAILED");
      }

      const clearRes = adapter.clear();
      expect(isErr(clearRes)).toBe(true);
      if (isErr(clearRes)) {
        expect(clearRes.error.code).toBe("WRITE_FAILED");
      }

      const keysRes = adapter.keys();
      expect(isErr(keysRes)).toBe(true);
      if (isErr(keysRes)) {
        expect(keysRes.error.code).toBe("READ_FAILED");
      }
    });

    it("returns STORAGE_UNAVAILABLE if no Storage implementation is present (TC-PERSIST-03)", () => {
      // Simulate environment where neither window.localStorage nor custom storage exists
      const adapter = new LocalStoragePersistenceAdapter(
        null as unknown as Storage
      );

      const getRes = adapter.getItem("key");
      expect(isErr(getRes)).toBe(true);
      if (isErr(getRes)) {
        expect(getRes.error.code).toBe("STORAGE_UNAVAILABLE");
      }

      const setRes = adapter.setItem("key", "val");
      expect(isErr(setRes)).toBe(true);
      if (isErr(setRes)) {
        expect(setRes.error.code).toBe("STORAGE_UNAVAILABLE");
      }
    });
  });
});
