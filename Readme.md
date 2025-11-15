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
- Here’s a full working React counter app using react-snap-state 👇

```tsx
import {
  StoreProvider,
  useGetValue,
  useSetValue,
  useDeriveValue,
} from "react-snap-state";

function Counter() {
  console.log("render successfully");
  // useGetValue with a comparator
  const count = useGetValue(
    "count",
    (oldValue: number, newValue: number) => oldValue === newValue
  );

  // useGetValue without a comparator
  const alignment = useGetValue("alignment");

  // useSetValue
  const setValue = useSetValue();

  // useDeriveValue (single key) — returns boolean whether count is even
  const isEven = useDeriveValue(
    ["count"],
    (c: number[]) => {
      let number = c[0];
      if (number % 2 === 0) {
        return true;
      }
      return false;
    },
    (prev: boolean, next: boolean) => prev === next // optional comparator (strict equality)
  );

  // useDeriveValue (multiple keys) — composes a display string from count + alignment
  const display = useDeriveValue(
    ["count", "alignment"],
    ([c, a]: [number | undefined, string | undefined]) => {
      const countStr = typeof c === "number" ? String(c) : "—";
      const alignStr = a ?? "center";
      return `${countStr} • ${alignStr}`;
    },
    (prev: string, next: string) => prev === next // skip re-render if composed string didn't change
  );

  const increment = () => setValue("count", (count ?? 0) + 1);
  const decrement = () => setValue("count", (count ?? 0) - 1);
  const reset = () => setValue("count", 0);

  const leftAlign = () => setValue("alignment", "left");
  const rightAlign = () => setValue("alignment", "right");
  const centerAlign = () => setValue("alignment", "center");

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
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider initial={{ count: 0, alignment: "center" }}>
      <Counter />
    </StoreProvider>
  );
}

```

- Result: Only the Counter component re-renders when count changes or the alignment changes.
- No context re-renders, no prop drilling, no boilerplate.
- Try it out: https://codesandbox.io/p/sandbox/dl2znt

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

```tsx
import {useGetValue} from 'react-snap-state';

// without custom comparator
const value1 = useGetValue("count");

// with custom comparator
const value2 = useGetValue("age", (before: number, after: number) => {return before === after});
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

```tsx
import {useDeriveValue} from 'react-snap-state';

// derive without comparator
const total = useDeriveValue(["price", "tax"], ([price, tax]) => {
  return price + tax;
});

// derive with a comparator
const ageStatus = useDeriveValue(
  ["age"],
  (age) => (age >= 18 ? "adult" : "minor"),
  (prev, next) => prev === next // comparator
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
---