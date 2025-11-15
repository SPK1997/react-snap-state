# ⚡ react-snap-state

A **tiny, fast, and reactive state management library for React 17+**, built on top of `useSyncExternalStore`
this provides **key-based subscriptions**, **no context re-renders**, and a super simple API that feels like React itself.

---

## ✨ Features

- **🔑 Key-based reactivity** – Components only re-render for the specific keys they subscribe to.
- **🧠 Smart reads, simple writes** – Writes update the store directly, while reads may use a custom comparator to control equality checks.
- **🌐 Scoped state** – Wrap parts of your app with StoreProvider to isolate independent store instances.
- **🧩 Tiny API surface** – Just StoreProvider, useGetValue, useSetValue, and useDeriveValue.
- **⚛️ Built for Concurrent React** – Powered by useSyncExternalStore for stable, future-proof behavior.
- **🚫 No context-driven re-renders** – The context value never changes; only components subscribed to specific keys update.
- **⚙️ TypeScript-first design** – End-to-end typing.

---

## 📦 Installation

Install using npm or yarn:

```bash
npm install react-snap-state
```
---

## 🧱 Quick Start Example
- Here’s a full working React app using react-snap-state full capabilities 👇

```tsx
import React, {useCallback, useMemo} from "react";
import {
  StoreProvider,
  useGetValue,
  useSetValue,
  useDeriveValue,
} from "react-snap-state";

function Counter() {
  console.log("render successfully");

  // useGetValue with a comparator
  const comparator1 = useCallback((oldValue: number, newValue: number) => oldValue === newValue, []);
  const count = useGetValue(
    "count",
    comparator1
  );

  // useGetValue without a comparator
  const alignment = useGetValue("alignment");

  // read user (will be set by async setter)
  const user = useGetValue("user");

  // useSetValue
  const setValue = useSetValue();

  // useDeriveValue (single key) — returns boolean whether count is even
  const keyList1 = useMemo(() => ["count"], []);
  const deriveCallback1 = useCallback((c: (number | undefined)[]) => {
    const number = c[0] ?? 0;
    return number % 2 === 0;
  }, []);
  const comparator2 = useCallback((prev: boolean, next: boolean) => prev === next, []);
  const isEven = useDeriveValue(
    keyList1,
    deriveCallback1,
    comparator2 // optional comparator
  );

  // useDeriveValue (multiple keys) — composes a display string from count + alignment
  const keyList2 = useMemo(() => ["count", "alignment"], []);
  const deriveCallback2 = useCallback(([c, a]: [number | undefined, string | undefined]) => {
    const countStr = typeof c === "number" ? String(c) : "—";
    const alignStr = a ?? "center";
    return `${countStr} • ${alignStr}`;
  }, []);
  const comparator3 = useCallback((prev: string, next: string) => prev === next, []);
  const display = useDeriveValue(
    keyList2,
    deriveCallback2,
    comparator3 // comparator
  );

  const increment = () => setValue("count", (count ?? 0) + 1);
  const decrement = () => setValue("count", (count ?? 0) - 1);
  const reset = () => setValue("count", 0);

  const leftAlign = () => setValue("alignment", "left");
  const rightAlign = () => setValue("alignment", "right");
  const centerAlign = () => setValue("alignment", "center");

  // Async setter example using fake JSON placeholder
  // Uses setter.async(key, asyncCallback, placeholder?)
  // placeholder is written immediately; final value is written after the promise resolves.
  const loadUser = async () => {
    // optional: await if you want to wait for completion
    await setValue.async(
      "user",
      async () => {
        // fetch fake user data
        const res = await fetch("https://jsonplaceholder.typicode.com/users/1");
        if (!res.ok) throw new Error("Failed to fetch user");
        return await res.json();
      },
      { id: 0, name: "Loading user…" } // placeholder shown synchronously
    );
  };

  return (
    <div style={{ textAlign: alignment }}>
      <h2>Count: {count}</h2>
      <p>Derived display: {display}</p>
      <p>Status: {isEven ? "Even" : "Odd"}</p>

      <div style={{ marginTop: 12 }}>
        <button onClick={increment}>Increment</button>
        <button onClick={reset}>Reset</button>
        <button onClick={decrement}>Decrement</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={leftAlign}>Click to left align</button>
        <button onClick={centerAlign}>Click to center align</button>
        <button onClick={rightAlign}>Click to right align</button>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div>
        <h3>User</h3>
        {user ? (
          // if placeholder or fetched user object
          <div>
            <p>
              <strong>ID:</strong> {user.id ?? "—"}
            </p>
            <p>
              <strong>Name:</strong> {user.name ?? "—"}
            </p>
            <p>
              <strong>Email:</strong> {user.email ?? "—"}
            </p>
          </div>
        ) : (
          <p>No user loaded</p>
        )}

        <div style={{ marginTop: 8 }}>
          <button onClick={loadUser}>Load User (async)</button>
          <button
            onClick={() =>
              setValue("user", { id: 0, name: "Cleared", email: "—" })
            }
            style={{ marginLeft: 8 }}
          >
            Clear User
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider initial={{ count: 0, alignment: "center", user: null }}>
      <Counter />
    </StoreProvider>
  );
}

```

- Try it out: https://codesandbox.io/p/sandbox/dl2znt
- Please check the below API reference to understand the code.

---
## ⚙️ Setup

- Check the StoreProvider API in API reference section.
---
## 🔍 Reading State 

- This is possible using 2 hooks: useGetValue and useDeriveValue
- Check their respective APIs in API reference section
---
## ✏️ Updating State

- This is possible using useSetValue hook.
- Check its API in API reference section.
---
## ⏳ Updating State asynchronously

- This is possible using async setters.
- Check its API in API reference section.
---

## 🧩 API Reference

### 🏗️ `<StoreProvider />`

- Wrap your app or any subtree. It creates one stable `KeyStore` instance and exposes it via context.

```tsx
import {StoreProvider} from 'react-snap-state';

<StoreProvider initial={{ count: 0 }}>
  {children}
</StoreProvider>
```

| Prop       | Type                  | Description                           |
| ---------- | --------------------- | ------------------------------------- |
| `initial`  | `Record<string, any>` | Optional initial state.               |
| `children` | `React.ReactNode`     | Components that can access the store. |

### 🔍 useGetValue(key, comparator?)
- useGetValue lets your component read a value from the store and automatically subscribe to updates for that specific key.

- Whenever the key's value changes, the hook will trigger a component re-render, unless a custom comparator determines that the new value is equal to the previous one.

- ✔ What it does
  - Reads the current value of a given key from the store.
  - Subscribes the component to updates for that key.
  - Re-renders the component when the key's value changes.
  - Accepts an optional comparator to control equality checks.
  - If no comparator is provided, the default Object.is() equality logic is used.

- ✔ Comparator behavior
  - If a custom comparator is passed, it receives (oldValue, newValue).
  - If it returns true, values are treated as equal then no re-render is triggered.
  - If it returns false, the hook updates its value then component re-renders.
  - If no comparator is provided then default Object.is() is used.

- On calling useGetValue a reader instance is created. The reader is created once and captures the keys and comparator (optional) from the first render. If any of these values change later, the reader will not update so they must be passed as stable (memoized) references.

```tsx
import {useGetValue} from 'react-snap-state';
import {useCallback} from 'react';

// without custom comparator
const value1 = useGetValue("count");

// with custom comparator
// referentially stable callback is needed
let comparator = useCallback((before: number, after: number) => {return before === after}, []);
const value2 = useGetValue("age", comparator);
```

| Arguments     | Type      | Description                       |
| --------------| --------- | ---------------------------------------- |
| `key`         | `string`  | Key to read from the store.       |
| `comparator`  | `(oldValue: any, newValue: any) => boolean` | (Optional) Custom comparator to determine equality. Return true if values are considered equal (no update), or false to trigger an update. |

### 🛠️ useDeriveValue(keys, derive, comparator?)
- useDeriveValue lets your component compute a derived value from one or more store keys and automatically subscribe to updates for all of them.

- Whenever any of the source key values change, the hook will trigger a component re-render, unless a custom comparator determines that the derived output is equal to the previous one.

- ✔ What it does?
  - Accepts an array of keys.
  - Reads the current values of the keys from the store.
  - Passes those values into your derive callback function.
  - Returns whatever the derive callback returns.
  - Automatically subscribes to updates of all referenced keys.
  - Re-renders the component only when:
      - Any key's value changes, AND
      - The comparator (if provided) determines the derived output has changed.

- ✔ Comparator behavior
  - If you pass a comparator, it will be used to compare previous derived value vs new derived value.
  - If comparator returns true then values are considered equal then no re-render.
  - If comparator returns false then derived value is updated then component re-renders.
  - If no comparator is provided then default Object.is() is used.

- On calling useDeriveValue a reader instance is created. The reader is created once and captures the keys, derive function, and comparator (optional) from the first render. If any of these values change later, the reader will not update so they must be passed as stable (memoized) references.

```tsx
import {useDeriveValue} from 'react-snap-state';
import {useMemo, useCallback} from 'react';

// derive without comparator
let keyList1 = useMemo(() => ["price", "tax"], []); // stable key list
let deriveCallback1 = useCallback(([price, tax]) => {
  return price + tax;
}, []); // stable derive callback
const total = useDeriveValue(keyList1, deriveCallback1);

// derive with a comparator
let keyList2 = useMemo(() => ["age"], []); // stable key list
let deriveCallback2 = useCallback((age) => (age >= 18 ? "adult" : "minor"), []); // stable derive callback
let comparator = useCallback((prev, next) => prev === next, []); // stable comparator
const ageStatus = useDeriveValue(
  keyList2,
  deriveCallback2,
  comparator
);
```
| Arguments       | Type                                                     | Description                                                                                                                        |
| -------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `keys` | `string[]`                                    | An array of keys to read from the store. Their values will be passed to the derive callback.                       |
| `derive`       | `(value: any \| any[]) => any`                           | A function that receives the value(s) of the key(s) and returns the derived value.                                                 |
| `comparator`   | `(oldValue: any, newValue: any) => boolean`| (Optional) Custom equality check for the **derived value**. Return `true` if values are equal (skip update), or `false` to trigger an update. |


### ✏️ useSetValue()

- useSetValue lets your component update a value in the store by returning a setter function.

- When this setter is called, the store updates the key’s value and triggers re-renders in all components subscribed to that key.

```tsx
import {useSetValue} from 'react-snap-state';
const setValue = useSetValue();
setValue("age", 45); 
```

| Arguments       | Type                                        | Description                                                                                                                                      |
| ------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `key`        | `string`                                    | The key in the store to update.                                                                                                                  |
| `value`      | `any`                                       | The new value to assign.                                                                                                                 

### ⏳ Async setter (setter.async)

- useSetValue hook returns a stable setter function and an async helper (setter.async) for async updates.

- Use the async helper to optionally set a temporary placeholder value, run an async operation, and write the final result back into the store.

- When the async helper is used, the store is updated with the placeholder (if provided) immediately, then updated with the async result when the call resolves; subscribed components re-render on each effective value change. Errors are caught and logged — the async helper does not re-throw.

- *Handling Race Condition:* If multiple async setters are called for the same key, the most recent call wins. When an async setter is called it receives an internal process id. Only the call whose id matches the store's current id for that key is allowed to write the final value. Older (stale) resolutions are ignored. This guarantees that the latest user intent is preserved even if earlier requests resolve later.

```tsx
import {useSetValue} from 'react-snap-state';

const setValue = useSetValue();

// async write with placeholder
setValue.async(
  "user",
  async () => {
    const res = await fetch("/api/me");
    return await res.json();
  },
  { id: 0, name: "Loading…" } // optional placeholder shown while awaiting
);
```

| Arguments           |                 Type | Description                                                    |
| ------------------ | -------------------: | -------------------------------------------------------------- |
| `key`              |             `string` | The store key to update.                                       |
| `callback`         | `() => Promise<any>` | Async producer that resolves to the value to store.            |
| `placeholderValue` |     `any`  | (optional) Temporary value written immediately while awaiting `callback`. |

---