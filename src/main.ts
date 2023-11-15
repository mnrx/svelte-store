const valueKey = Symbol('value');
const isDerivedKey = Symbol('isDerived');
const isSyncingKey = Symbol('isSyncing');
const subscribersKey = Symbol('subscribers');
const notifyKey = Symbol('notify');
const setKey = Symbol('set');
const updateKey = Symbol('update');

/** A function which sets a store's value. */
export type Setter<T> = (value: T) => void;

/** A function which returns a new value for a store derived from its current
 * value. */
export type Updater<T> = (value: T) => T;

/** An object with `set` and `update` methods that only work if the object's
 * `enabled` property is `true` */
type DisableableSetterUpdater<T> = {
  enabled: boolean,
  set: (value: T) => void,
  update: (fn: Updater<T>) => void,
}

/** A function which is called when a store's value changes. */
export type Subscriber<T> = (value: T) => void;

/** A tuple of a function which is called when a store's value changes and a
 * function which is called shortly before the first to enable proper order of
 * evaluation. */
type SubscriberInvalidator<T> = [
  (value: T, isChanged?: boolean) => void,
  () => void,
];

/** An `Array` of all subscribers to a store. */
type Subscribers<T> = Array<Subscriber<T> | SubscriberInvalidator<T>>;

/** A store not created by this module, e.g., an RxJS `Observable`. */
export type ExternalReadable<T = unknown> = {
  subscribe:
    (subscriber: Subscriber<T>) => (() => void) | { unsubscribe: () => void },
};

/** A store created by this module which can be subscribed to. */
export type Readable<T> = {
  [valueKey]: T,
  [isDerivedKey]?: boolean,
  [isSyncingKey]?: boolean,
  [subscribersKey]: Subscribers<T>,
  [notifyKey]: (isChanged: boolean) => void,
  [setKey]: Setter<T>,
  [updateKey]: (fn: Updater<T>) => void,
  subscribe:
    (subscriber: Subscriber<T> | SubscriberInvalidator<T>) => (() => void),
};

/** A store which can be subscribed to and has `set` and `update` methods. */
export type Writable<T> = Readable<T> & {
  set: Setter<T>,
  update: (fn: Updater<T>) => void,
};

/** One or more `Readable`s. Spread syntax is important for `StoresValues`. */
type Stores =
  | Readable<any>
  | ExternalReadable<any>
  | [
    Readable<any> | ExternalReadable<any>,
    ...Array<Readable<any> | ExternalReadable<any>>,
  ];

/** One or more values from `Readable` stores. */
type StoresValues<T> =
  T extends Readable<infer U> | ExternalReadable<infer U> ? U : {
    [K in keyof T]:
      T[K] extends Readable<infer U> | ExternalReadable<infer U> ? U : never
  };

/** A function which is called whenever a store receives its first subscriber,
 * and whose return value, if a function, is called when the same store loses
 * its last subscriber. */
export type OnStart<T> = (
  set: Setter<T>,
  update: (fn: Updater<T>) => void,
) => void | (() => void);

/** A special case of `OnStart` created by `derived` when subscribing to other
 * stores created by this module. */
type DerivedOnStart<T> = (store: Writable<T>) => (() => void);

/** A function which derives a value from the dependency stores' values and
 * optionally calls the passed `set` or `update` functions to change the store.
 * */
export type ComplexDeriveValue<S, T> = (
  values: S extends Stores ? StoresValues<S> : S,
  set: Setter<T>,
  update: (fn: Updater<T>) => void,
) => void | (() => void);

/** A function which derives a value from the dependency stores' values and
 * returns it. */
export type SimpleDeriveValue<S, T> =
  (values: S extends Stores ? StoresValues<S> : S) => T;

const noOp = () => {};

/**
 * Return `true` if `a` and `b` are unequal. Unlike usual, identical `Function`s
 * and non-`null` `Object`s are considered to be unequal to themselves.
 * Also unlike usual, `NaN` *is* considered to be equal to itself.
 */
const areUnequal = (a: any, b: any) => (
  a !== a
    ? b === b
    : (0
      || a !== b
      || (typeof a === 'object' && a !== null)
      || typeof a === 'function'
    )
);

/**
 * Create a `DisableableSetterUpdater<T>` for the given store.
 */
const createDisableableSetterUpdater = <T>(
  store: Readable<T>,
): DisableableSetterUpdater<T> => {
  const state = {
    enabled: true,
    set(value: T) { if (this.enabled) store[setKey](value) },
    update(fn: Updater<T>) { if (this.enabled) store[updateKey](fn) },
  } as DisableableSetterUpdater<T>
  state.set = state.set.bind(state);
  state.update = state.update.bind(state);
  return state;
};

/**
 * Create an internal store.
 */
const createStore = <T>(
  initialValue?: T,
  onStart: OnStart<T> | DerivedOnStart<T> = noOp,
): Readable<T> => {
  const subscribers = [] as Subscribers<T>;
  let onStop = noOp;

  const store: Readable<T> = {
    [valueKey]: initialValue as T,
    [subscribersKey]: subscribers,

    [notifyKey](isChanged) {
      for (const subscriber of subscribers) {
        if (Array.isArray(subscriber)) {
          if (isChanged || this[isDerivedKey]) {
            subscriber[0](this[valueKey], isChanged);
          }
        } else {
          if (isChanged) subscriber(this[valueKey]);
        }
      }
    },

    [setKey](value) {
      const isChanged = areUnequal(value, this[valueKey]);

      if (isChanged && !this[isSyncingKey]) {
        for (const subscriber of subscribers) {
          if (Array.isArray(subscriber)) subscriber[1]();
        }
      }

      if (isChanged) this[valueKey] = value;

      if (!this[isSyncingKey]) this[notifyKey](isChanged);
    },

    [updateKey](fn) {
      this[setKey](fn(this[valueKey]));
    },

    subscribe(subscriber) {
      let setterUpdater: DisableableSetterUpdater<T>;

      if (subscribers.length === 0) {
        if (this[isDerivedKey]) {
          onStop = (onStart as DerivedOnStart<T>)(this as Writable<T>)
            || noOp;
        } else {
          setterUpdater = createDisableableSetterUpdater(this);
          onStop = (onStart as OnStart<T>)(
            setterUpdater.set,
            setterUpdater.update,
          ) || noOp;
        }
      }

      subscribers.push(subscriber);
      (Array.isArray(subscriber) ? subscriber[0] : subscriber)(this[valueKey]);

      return function unsubscribe() {
        const subscriberIndex = subscribers.indexOf(subscriber);
        if (subscriberIndex !== -1) subscribers.splice(subscriberIndex, 1);

        if (subscribers.length === 0) {
          onStop();
          if (setterUpdater !== undefined) setterUpdater.enabled = false;
        }
      };
    },
  };

  // Allow consumers to pass around a store's `subscribe` method (e.g., to
  // another function) more liberally without breaking it.
  store.subscribe = store.subscribe.bind(store);

  return store;
};

/**
 * Create a `Writable` store that allows both updating and reading by
 * subscription.
 *
 * https://svelte.dev/docs/svelte-store#writable
 */
export const writable = <T>(
  initialValue: T | undefined,
  onStart: OnStart<T> | undefined = noOp,
) => {
  const store = createStore(initialValue, onStart) as Writable<T>;
  store.update = store[updateKey].bind(store);
  store.set = store[setKey].bind(store);
  return store;
};

/**
 * Creates a `Readable` store that allows reading by subscription.
 *
 * https://svelte.dev/docs/svelte-store#readable
 */
export const readable = createStore;

const wrappedStores = new Map<ExternalReadable<any>, Readable<any>>();
/**
 * Wrap an external (non-native) store as a `Readable`. Stores implementing
 * RxJS's `Observable` interface are accepted.
 */
const wrapStore: {
  <S extends Readable<any>>(store: S): S,
  <S extends ExternalReadable>(store: S):
    S extends ExternalReadable<infer T> ? Readable<T> : never,
  <T = unknown>(store: ExternalReadable): Readable<T>,
} = <T>(
  store: Readable<T> | ExternalReadable<T>,
): Readable<T> | Readable<T> => {
  if (Object.hasOwn(store, setKey)) return store as Readable<T>;
  // Explicitly narrow the type of `store` since TypeScript does not yet
  // automatically narrow types using `Object.hasOwn`.
  const ExternalReadable = store as ExternalReadable<T>;

  if (wrappedStores.has(ExternalReadable)) {
    return wrappedStores.get(ExternalReadable) as Readable<T>;
  }

  const wrappedStore = readable<T>(undefined, ((set) => {
    const unsubscribe = ExternalReadable.subscribe(set);
    return function onStop() {
      const isRxJS = typeof unsubscribe !== 'function';
      (isRxJS ? unsubscribe.unsubscribe : unsubscribe)();
    };
  }) as OnStart<T>);
  wrappedStores.set(ExternalReadable, wrappedStore);
  return wrappedStore;
};

// /** A function which derives a value from the dependency stores' values and
//  * optionally calls the passed `set` or `update` functions to change the store.
//  * */
//  export type ComplexDeriveValue<S, T> = (
//   values: S extends Stores ? StoresValues<S> : S,
//   set: Setter<T>,
//   update: (fn: Updater<T>) => void,
// ) => void | (() => void) | unknown;

// /** A function which derives a value from the dependency stores' values and
//  * returns it. */
// export type SimpleDeriveValue<S, T> =
//   (values: S extends Stores ? StoresValues<S> : S) => T;

/**
 * Create a new `Readable` store whose value is derived from the value(s) of one
 * or more other `Readable` stores and whose value is re-evaluated whenever one
 * or more dependency store updates.
 *
 * https://svelte.dev/docs/svelte-store#derived
 */
export const derived: {
  <S extends Stores, T = unknown>(
    dependencyOrDependencies: S,
    deriveValue: ComplexDeriveValue<S, T>,
    initialValue?: T,
  ): Readable<T>,
  <S extends Stores, T = unknown>(
    dependencyOrDependencies: S,
    deriveValue: SimpleDeriveValue<S, T>,
    initialValue?: T,
  ): Readable<T>,
  <Ts, T = unknown>(
    dependencyOrDependencies: Stores,
    deriveValue: ComplexDeriveValue<Ts, T>,
    initialValue?: T,
  ): Readable<T>,
  <Ts, T = unknown>(
    dependencyOrDependencies: Stores,
    deriveValue: SimpleDeriveValue<Ts, T>,
    initialValue?: T,
  ): Readable<T>,
} = <S extends Stores, T>(
  dependencyOrDependencies: S,
  deriveValue: ComplexDeriveValue<S, T> | SimpleDeriveValue<S, T>,
  initialValue?: T,
) => {
  const hasSingleDependency = !Array.isArray(dependencyOrDependencies);
  const dependencies: Stores = hasSingleDependency
    ? [dependencyOrDependencies]
    : dependencyOrDependencies;

  for (const [i, dependency] of dependencies.entries()) {
    if (!dependency) {
      throw new Error(`Dependency with index ${i} passed to \`derived()\` is falsy.`);
    }
  }

  const wrappedDependencies = dependencies.map(wrapStore);

  const store = createStore(initialValue, function onStart(store: Readable<T>) {
    const unsubscribers = [] as Array<() => void>;
    let pendingStoreCount = wrappedDependencies.length;
    let isInvalid = false;

    let cleanUp = noOp;
    for (const dependency of wrappedDependencies) {
      let setterUpdater: DisableableSetterUpdater<T>;

      const unsubscribe = dependency.subscribe([
        function onValueChange(_: any, isChanged = true) {
          if (isChanged) isInvalid = true;
          pendingStoreCount -= 1;

          if (pendingStoreCount === 0) {
            const oldValue = store[valueKey];

            if (isInvalid) {
              cleanUp();
              cleanUp = noOp;
              isInvalid = false;

              store[isSyncingKey] = true;
              const storeValues = (
                wrappedDependencies.map(dependency => dependency[valueKey])
              ) as StoresValues<S>;
              const storeValuesArg = hasSingleDependency
                ? storeValues[0]
                : storeValues;

              if (deriveValue.length === 1) {
                store[setKey](
                  (deriveValue as SimpleDeriveValue<S, T>)(storeValuesArg),
                );
              } else {
                setterUpdater = createDisableableSetterUpdater(store);
                const derivedValue = deriveValue(
                  storeValuesArg,
                  setterUpdater.set,
                  setterUpdater.update,
                );
                cleanUp = typeof derivedValue === 'function'
                  ? derivedValue as () => void
                  : noOp;
              }
              store[isSyncingKey] = false;
            }
            store[notifyKey](areUnequal(store[valueKey], oldValue));
          }
        },
        function invalidate() {
          if (pendingStoreCount === 0) {
            for (const subscriber of store[subscribersKey]) {
              if (Array.isArray(subscriber)) subscriber[1]();
            }
          }
          pendingStoreCount += 1;
        },
      ]);

      unsubscribers.push(() => {
        cleanUp();
        unsubscribe();
      });
    }

    return function onStop() {
      for (const unsubscribe of unsubscribers) unsubscribe();
    };
  });

  store[isDerivedKey] = true;

  return store;
};

/**
 * Return a `Readable` of an existing `Readable` or `Writable` store.
 *
 * https://svelte.dev/docs/svelte-store#readonly
 */
export const readonly = <T>(store: Readable<T>): Readable<T> => {
  return {
    get[valueKey]() { return store[valueKey]; },
    [subscribersKey]: store[subscribersKey],
    [notifyKey]: store[notifyKey].bind(store),
    [setKey]: store[setKey].bind(store),
    [updateKey]: store[updateKey].bind(store),
    subscribe: store.subscribe.bind(store),
  };
};

/**
 * Get the current value from a store by subscribing and immediately
 * unsubscribing. If `allowStale` is `true`, the current value is read directly
 * from compatible store objects. This is faster but potentially inaccurate.
 *
 * https://svelte.dev/docs/svelte-store#get
 */
export const get: {
  <T>(store: Readable<T>, allowStale: boolean): T,
  <T>(store: Readable<T> | ExternalReadable<T>): T,
} = <T>(
  store: Readable<T> | ExternalReadable<T>,
  allowStale = false,
): T => {
  if (allowStale && Object.hasOwn(store, setKey)) {
    return (store as Readable<T>)[valueKey];
  }

  let freshValue: T;
  const unsubscribe = store.subscribe(value => freshValue = value);
  const isRxJS = typeof unsubscribe !== 'function';
  (isRxJS ? unsubscribe.unsubscribe : unsubscribe)();

  // @ts-ignore
  return freshValue;
};
