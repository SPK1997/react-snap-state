import { useCallback, useContext, useMemo } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import { StoreContext } from "./context";
import { Reader, readerOptions } from "./reader";

type comparator = ((a: any, b:any) => boolean) | undefined;
type derive = (params:any[] | any) => any;


function useStoreInstance() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Use inside <StoreProvider>");
  return store;
}

function createReader(iOptions:readerOptions) {
  return new Reader(iOptions);
}

export function useGetValue(key: string, comparator: comparator = undefined): any | undefined {
  const store = useStoreInstance();
  const reader = useMemo(() => createReader({store: store, keys: [key], comparator: comparator}), [store, key, comparator]);
  const getSnap = useCallback(() => reader.getSnapshot(), [reader]);

  return useSyncExternalStore(
    (l) => {
      reader.subscribeKey(l);
      return () =>{
        reader.unsubScribeKey();
      }
    },
    getSnap,
    getSnap
  );
}

export function useDeriveValue(keys: string[] | string, derive:derive, comparator: comparator = undefined): any | undefined {
  const store = useStoreInstance();
  const keyList = Array.isArray(keys) ? keys : [keys];
  const reader = useMemo(() => createReader({store: store, keys: keyList, comparator: comparator, derive: derive}), [store, keyList, comparator, derive]);
  const getSnap = useCallback(() => reader.getSnapshot(), [reader]);
  return useSyncExternalStore(
    (listener) => {
      reader.subscribeKey(listener);
      return () =>{
        reader.unsubScribeKey();
      }
    },
    getSnap,
    getSnap
  );
}


export function useSetValue() {
  const store = useStoreInstance();
  const setter = ( key: string, value: any) => {
    store.set(key, value);
  };
  setter.async = async (...params: any[]) => {
    let [key, callback, placeholderValue] = params;
    if(placeholderValue) {
      store.set(key, placeholderValue);
    }
    const id = store.updateAsyncProcessId(key)
    try {
      let value = await callback();
      if(id === store.getAsyncProcessId(key)) {
        store.removeAsyncProcessId(key);
        store.set(key, value);
      }
    } catch(err) {
      console.log(new Error(`async setter failed for key ${key}, ${err}`));
    }
  };
  return useCallback(setter,[store]);
}
