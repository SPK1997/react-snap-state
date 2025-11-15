import { isObjectLiteral } from "./helper";
import { Reader } from "./reader";

type keyValue = {
  current: any;
  possible: any;
};

export class KeyStore {
  private state = new Map<string, keyValue>();
  private keyReaders = new Map<string, Set<Reader>>();

  constructor(initial?: Record<string, any>) {
    if (initial) {
      if (isObjectLiteral(initial)) {
        for (const [k, v] of Object.entries(initial)) {
          this.state.set(k, {
            current: v,
            possible: v,
          });
        }
      } else {
        throw new Error(
          "Initial state must be a plain object (e.g. {count: 0})"
        );
      }
    }
  }

  setCurrentValue(key: string, value: any) {
    if(this.state.has(key)) {
      (this.state.get(key) as keyValue).current = value;
    }
  }

  getCurrentValue(key: string) {
    return this.state.get(key)?.current;
  }

  getPossibleValue(key: string) {
    return this.state.get(key)?.possible;
  }

  set(key: string, val: any) {
    let stored = this.state.get(key);
    let toStore: keyValue;
    if (!stored) {
      toStore = {
        current: val,
        possible: val,
      };
    } else {
      toStore = {
        current: stored["current"],
        possible: val,
      };
    }
    this.state.set(key, toStore);
    this.emitKey(key);
  }

  subscribeKey(key: string, reader: Reader): () => void {
    let bucket = this.keyReaders.get(key);
    if (!bucket) this.keyReaders.set(key, (bucket = new Set()));
    bucket.add(reader);
    return () => {
      bucket!.delete(reader);
      if (!bucket!.size) this.keyReaders.delete(key);
    };
  }

  private emitKey(key: string) {
    const bucket = this.keyReaders.get(key);
    if (bucket)
      for (const reader of bucket) {
        reader.checkAndRerender();
      }
  }
}
