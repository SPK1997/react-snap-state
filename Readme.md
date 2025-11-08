# ⚡ react-snap-state

A **tiny, fast, and reactive state management library for React 18+**, built on top of `useSyncExternalStore`.  
`react-snap-state` provides **key-based subscriptions**, **no context re-renders**, and a super simple API that feels like React itself.

---

## ✨ Features

- 🔑 **Key-based reactivity** – Components re-render only for the keys they care about.
- ⚛️ **Concurrent React safe** – Built on `useSyncExternalStore`, ensuring future-proof React compatibility.
- 💡 **No context re-renders** – The context never changes; only subscribed components update.
- 🧩 **Minimal API** – Just `StoreProvider`, `useGetValue`, and `useSetValue`.
- ⚙️ **TypeScript-first** – Fully typed, auto-completion friendly.
- ⚡ **Lightweight** – zero dependencies.

---

## 📦 Installation

Install using npm or yarn:

```bash
npm install react-snap-state
```
---

## 🧱 Quick Start Example
- Here’s a full working React counter app using react-snap-state 👇

```tsx
import React from "react";
import { StoreProvider, useGetValue, useSetValue } from "react-snap-state";

function Counter() {
  const count = useGetValue({ key: "count" });

  const increment = () => useSetValue({ key: "count", value: (count ?? 0) + 1 });
  const decrement = () => useSetValue({ key: "count", value: (count ?? 0) - 1 });
  const reset = () => useSetValue({ key: "count", value: 0 });

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Count: {count}</h2>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider initial={{ count: 0 }}>
      <Counter />
    </StoreProvider>
  );
}
```

- Result: Only the Counter component re-renders when count changes.
No context re-renders, no prop drilling, no boilerplate.

---

## ⚙️ Setup

- Wrap your app (or any subtree) with the StoreProvider:

```tsx
import { StoreProvider } from "react-snap-state";

function App() {
  return (
    <StoreProvider initial={{ theme: "light", count: 0 }}>
      <MyComponent />
    </StoreProvider>
  );
}
```
---

## 🔍 Reading State – useGetValue

- Read any key from the store. The hook automatically subscribes to changes on that key.

```tsx
import { useGetValue } from "react-snap-state";

function DisplayCount() {
  const count = useGetValue({ key: "count" });
  return <h2>Current count: {count}</h2>;
}
```

- Non-reactive read (snapshot only)

```tsx
const staticValue = useGetValue({ key: "count", reactive: false });
```

---

## ✏️ Updating State – useSetValue

- Write values to the store by key.

```tsx
import { useSetValue } from "react-snap-state";

function UpdateButton() {
  useSetValue({ key: "status", value: "active" });
  return null;
}
```

---
## 🧩 API Reference

### 🏗️ `<StoreProvider />`

- Wrap your app or any subtree. It creates one stable `KeyStore` instance and exposes it via context.

```tsx
<StoreProvider initial={{ count: 0 }}>
  {children}
</StoreProvider>
```

| Prop       | Type                  | Description                           |
| ---------- | --------------------- | ------------------------------------- |
| `initial`  | `Record<string, any>` | Optional initial state.               |
| `children` | `React.ReactNode`     | Components that can access the store. |

### 🔍 useGetValue({ key, reactive? })

- Reads the current value of a key and (optionally) subscribes to updates.

```tsx
const value = useGetValue({ key: "count" });
```

| Option     | Type      | Default | Description                       |
| ---------- | --------- | ------- | --------------------------------- |
| `key`      | `string`  | —       | Key to read from the store.       |
| `reactive` | `boolean` | `true`  | Subscribe to key updates if true. |

### ✏️ useSetValue({ key, value })

- Writes a value to the store.
- If the new value differs (by reference), subscribers of that key are notified.

```tsx
useSetValue({ key: "theme", value: "dark" });
```

| Option  | Type     | Description       |
| ------- | -------- | ----------------- |
| `key`   | `string` | Key to update.    |
| `value` | `any`    | New value to set. |
