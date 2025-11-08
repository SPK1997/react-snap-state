import { createContext, JSX, ReactNode, useRef } from "react";
import { KeyStore } from "./store";

export const StoreContext = createContext<KeyStore | null>(null);

export function StoreProvider({
  initial,
  children,
}: {
  initial?: Record<string, any>;
  children: React.ReactNode;
}): JSX.Element {
  const ref = useRef<KeyStore>(null);
  if (!ref.current) ref.current = new KeyStore(initial);
  return (
    <StoreContext.Provider value={ref.current}>
      {children}
    </StoreContext.Provider>
  );
}
