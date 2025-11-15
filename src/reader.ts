import { KeyStore } from "./store";

export type readerOptions = {
    keys: string[],
    derive?: (...params:any[]) => any,
    comparator?: (a: any, b:any) => boolean,
    store: KeyStore
}

export class Reader {
    private keys;
    private derive;
    private comparator;
    private store;
    private reactListener: (() => void) | null;
    private unmountCbList: (() => void)[];
    constructor(options: readerOptions) {
        this.keys = options.keys;
        this.derive = options.derive;
        this.comparator = options.comparator;
        this.store = options.store;
        this.reactListener = null;
        this.unmountCbList = [];
    }

    subscribeKey(l: ()=> any) {
        this.reactListener = l;
        this.unmountCbList = this.keys.map(key => this.store.subscribeKey(key, this));
    }

    unsubScribeKey() {
        for(const cb of this.unmountCbList) {
            cb();
        }
        this.unmountCbList = [];
        this.reactListener = null;
    }

    getSnapshot() {
        const values = [];
        for(let key of this.keys) {
            values.push(this.store.getCurrentValue(key));
        }
        if(this.derive) {
            return this.derive(values);
        } else {
            return values[0];
        }
    }

    checkAndRerender() {
        let currentValues:any = [];
        let possibleValues:any = [];
        for(let key of this.keys) {
            currentValues.push(this.store.getCurrentValue(key));
            possibleValues.push(this.store.getPossibleValue(key));
        }
        if(this.derive) {
            currentValues = this.derive(currentValues);
            possibleValues = this.derive(possibleValues);
        } else {
            currentValues = currentValues[0];
            possibleValues = possibleValues[0];
        }
        let toRerender = false;
        if(this.comparator && this.comparator(currentValues, possibleValues) === false) {
            toRerender = true;
        } else if(Object.is(currentValues, possibleValues) === false) {
            toRerender = true;
        }
        if(toRerender && this.reactListener) {
            for(let key of this.keys) {
                this.store.setCurrentValue(key, this.store.getPossibleValue(key));
            }
            this.reactListener();
        }
    }
}