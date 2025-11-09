import { useCallback, useContext } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import { StoreContext } from "./context";

function useStoreInstance() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Use inside <StoreProvider>");
  return store;
}

export function useGetValue({
  key,
  reactive = true,
}: {
  key: string;
  reactive?: boolean;
}): any | undefined {
  const store = useStoreInstance();
  if (!reactive) return store.get(key);

  const getSnap = useCallback(() => store.get(key), [store, key]);
  return useSyncExternalStore(
    (l) => store.subscribeKey(key, l),
    getSnap,
    getSnap
  );
}

export function useSetValue() {
  const store = useStoreInstance();
  return useCallback(({ key, value }: { key: string; value: any }) => {
    store.set(key, value);
  },[store]);
}
