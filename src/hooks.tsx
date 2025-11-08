import { useContext, useMemo } from "react";
import { useSyncExternalStore } from "react";
import { StoreContext } from "./context";

function useStoreInstance() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Use inside <StoreProvider>");
  return store;
}

export function useGetValue (
  { key, reactive = true }: { key: string; reactive?: boolean }
): any | undefined {
  const store = useStoreInstance();
  if (!reactive) return store.get(key);

  const getSnap = useMemo(() => () => store.get(key), [store, key]);
  return useSyncExternalStore(
    (l) => store.subscribeKey(key, l),
    getSnap,
    getSnap
  );
}

export function useSetValue({key, value}: {key: string, value: any}) {
  const store = useStoreInstance();
  store.set(key, value);
}
