export type Listener = () => void;

export class KeyStore {
  private state = new Map<string, any>();
  private keyListeners = new Map<string, Set<Listener>>();

  constructor(initial?: Record<string, any>) {
    if (initial) for (const k of Object.keys(initial)) this.state.set(k, initial[k]);
  }

  get(key: string): any | undefined { return this.state.get(key); }

  set(key: string, val: any) {
    const prev = this.state.get(key);
    if (Object.is(prev, val)) return;
    this.state.set(key, val);
    this.emitKey(key);
  }

  subscribeKey(key: string, l: Listener): () => void {
    let bucket = this.keyListeners.get(key);
    if (!bucket) this.keyListeners.set(key, (bucket = new Set()));
    bucket.add(l);
    return () => {
      bucket!.delete(l);
      if (!bucket!.size) this.keyListeners.delete(key);
    };
  }

  private emitKey(key: string) {
    const bucket = this.keyListeners.get(key);
    if (bucket) for (const l of bucket) l();
  }
}
