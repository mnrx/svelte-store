/**
 * Tested with TypeScript 5.1.6 and 5.2.2.
 *
 * The following is a long set of examples of using store functions, intended to
 * help test their TypeScript type definitions. Most lines should show type
 * errors, but not all. A minority of lines are examples of the best or most
 * concise way to use these functions, but are rather an attempt to cover almost
 * all possible permutations of their use.
 *
 * Lines are marked with flags, contained in a comment at the start of the line.
 * The flags are not necessarily exhaustive. The flags are defined before each
 * section.
 *
 * To test:
 *
 * - Run `npm install` in this directory (test/).
 *
 * - Open this directory as a workspace in Visual Studio Code, VSCodium, or
 *   another editor with TypeScript language server support. TypeScript will not
 *   work correctly if the parent directory is opened as the workspace instead.
 *
 * - Open this file (test.ts).
 *
 * - In Visual Studio Code or VSCodium, find "TypeScript: Select TypeScript
 *   version..." in the Command Palette and ensure that the version in
 *   node_modules/ is selected, not "Use VS Code's version".
 *
 * - Manually check the examples below. Importantly, ensure that no type errors
 *   are shown on lines with a flag beginning with " " or "R". Alternatively,
 *   remove all lines that contain matches of the regular expression
 *   "`\/\*[^R ].\*\/`" and then ensure there are no type errors in the module.
 *
 * To test the type definitions of the version of Svelte installed in
 * node_modules/, uncomment or comment out every line ending "Toggle".
 *
 * If the version of Svelte in node_modules/ already has an
 * `ExternalReadable<T>` type, do not toggle the two lines which reference that
 * type.
 *
 * To test a local development version of Svelte, install it as a dependency of
 * this module to make it the version in node_modules/, e.g.:
 *
 *     npm install file:../../svelte/packages/svelte
*/

import {
  readable,
  writable,
  derived,
  readonly,
  get,
  type ExternalReadable, // Toggle
  type Readable,
  type Writable,
// } from 'svelte/store'; // Toggle
} from '../src/main.ts'; // Toggle

// type ExternalReadable<T> = Readable<T>; // Toggle

// Stores created by the library.
const storeA = writable(1);
const storeB = writable(true);

// Objects which implement the store contract (including RxJS `Observable`).
const eStoreA = {
  subscribe(fn: any) {
    fn(1);
    return () => {};
  },
} as any;
const eStoreB = {
  subscribe(fn: any) {
    fn(true);
    return { unsubscribe: () => {} };
  },
};

/**
 * `derived()`
 *
 * FLAGS:
 * - " ":  The line should show no type errors.
 * - "R":  The line should show no type errors, but type information is still
 *         incomplete.
 * - "P":  The line should show partial type errors.
 * - "E":  The entire line should be highlighted as a type error.
 * - "I":  The third argument (`initialValue`) is of a different type to that
 *         specified in the generic type arguments. The latter should take
 *         precedence over automatic type inference, so the `initialValue` value
 *         is highlighted as incompatible.
 * - "S":  The value returned by a `SimpleDeriveValue` or passed to the `set()`
 *         function provided to a `ComplexDeriveValue` does not match the type
 *         specified in the generic type arguments passed to `derived()`.
 * - "D":  TypeScript is unable to correctly infer whether the passed function
 *         is a `SimpleDeriveValue` or a `ComplexDeriveValue` because its return
 *         type does not match the type specified in the generic type arguments
 *         passed to `derived()`.
 * - "U":  Data of type `unknown` is being used in an expression. The type is
 *         `unknown` because a dependency store is external and has not been
 *         explicitly typed with `ExternalStore` or generic type arguments
 *         passed to `derived()`.
 * - "N":  Type inference for the second type parameter `T` is abandoned because
 *         the first parameter `S` is provided explicitly. This results in the
 *         returned store being of type `Readable<unknown>`, despite This will
 *         improve with support for partial type parameter inference:
 *         https://github.com/microsoft/TypeScript/issues/26242
 */

// `derived()`, single dependency, simple derive function, without default value
/*  */ const storeAA = derived(storeA, $storeA => 1);
/*RN*/ const storeAB = derived<number>(storeA, $storeA => 1);
/*PS*/ const storeAC = derived<number, string>(storeA, $storeA => 1);
/*RN*/ const storeAD = derived<Writable<number>>(storeA, $storeA => 1);
/*PS*/ const storeAE = derived<Writable<number>, string>(storeA, $storeA => 1);

// `derived()`, single dependency, simple derive function, with default value (mismatched)
/*  */ const storeBA = derived(storeA, $storeA => 1, 1);
/*RN*/ const storeBB = derived<number>(storeA, $storeA => 1, 1);
/*PS*/ const storeBC = derived<number, string>(storeA, $storeA => 1, 1);
/*RN*/ const storeBD = derived<Writable<number>>(storeA, $storeA => 1, 1);
/*PS*/ const storeBE = derived<Writable<number>, string>(storeA, $storeA => 1, 1);

// `derived()`, single dependency, complex derive function, without default value
/*  */ const storeCA = derived(storeA, ($storeA, set, update) => set(1));
/*RN*/ const storeCB = derived<number>(storeA, ($storeA, set, update) => set(1));
/*PS*/ const storeCC = derived<number, string>(storeA, ($storeA, set, update) => set(1));
/*RN*/ const storeCD = derived<Writable<number>>(storeA, ($storeA, set, update) => set(1));
/*PS*/ const storeCE = derived<Writable<number>, string>(storeA, ($storeA, set, update) => set(1));

// `derived()`, single dependency, complex derive function, with default value (mismatched)
/*  */ const storeDA = derived(storeA, ($storeA, set, update) => update(n => n + 1), 1);
/*RN*/ const storeDB = derived<number>(storeA, ($storeA, set, update) => update(n => n + 1), 1);
/*EI*/ const storeDC = derived<number, string>(storeA, ($storeA, set, update) => update(n => n + 1), 1);
/*RN*/ const storeDD = derived<Writable<number>>(storeA, ($storeA, set, update) => update(n => n + 1), 1);
/*EI*/ const storeDE = derived<Writable<number>, string>(storeA, ($storeA, set, update) => update(n => n + 1), 1);

// `derived()`, two dependencies, simple derive function, without default value
/*  */ const storeEA = derived([storeA, storeB], ([$storeA, $storeB]) => $storeB ? $storeA.toString() : '1');
/*RN*/ const storeEB = derived<[number, boolean]>([storeA, storeB], ([$storeA, $storeB]) => $storeB ? $storeA.toString() : '1');
/*PS*/ const storeEC = derived<[number, boolean], object>([storeA, storeB], ([$storeA, $storeB]) => $storeB ? $storeA.toString() : '1');
/*RN*/ const storeED = derived<[Writable<number>, Writable<boolean>]>([storeA, storeB], ([$storeA, $storeB]) => $storeB ? $storeA.toString() : '1');
/*PS*/ const storeEE = derived<[Writable<number>, Writable<boolean>], object>([storeA, storeB], ([$storeA, $storeB]) => $storeB ? $storeA.toString() : '1');

// `derived()`, two dependencies, simple derive function, with default value (mismatched)
/*  */ const storeFA = derived([storeA, storeB], ([$storeA, $storeB]) => $storeB ? $storeA.toString() : '1', 'initial');
/*RN*/ const storeFB = derived<[number, boolean]>([storeA, storeB], ([$storeA, $storeB]) => $storeB ? $storeA.toString() : '1', 'initial');
/*PS*/ const storeFC = derived<[number, boolean], object>([storeA, storeB], ([$storeA, $storeB]) => $storeB ? $storeA.toString() : '1', 'initial');
/*RN*/ const storeFD = derived<[Writable<number>, Writable<boolean>]>([storeA, storeB], ([$storeA, $storeB]) => $storeB ? $storeA.toString() : '1', 'initial');
/*PS*/ const storeFE = derived<[Writable<number>, Writable<boolean>], object>([storeA, storeB], ([$storeA, $storeB]) => $storeB ? $storeA.toString() : '1', 'initial');

// `derived()`, two dependencies, complex derive function, without default value
/*  */ const storeGA = derived([storeA, storeB], ([$storeA, $storeB], set, update) => set($storeB ? $storeA.toString() : '1'));
/*RN*/ const storeGB = derived<[number, boolean]>([storeA, storeB], ([$storeA, $storeB], set, update) => set($storeB ? $storeA.toString() : '1'));
/*PS*/ const storeGC = derived<[number, boolean], object>([storeA, storeB], ([$storeA, $storeB], set, update) => set($storeB ? $storeA.toString() : '1'));
/*RN*/ const storeGD = derived<[Writable<number>, Writable<boolean>]>([storeA, storeB], ([$storeA, $storeB], set, update) => set($storeB ? $storeA.toString() : '1'));
/*PS*/ const storeGE = derived<[Writable<number>, Writable<boolean>], object>([storeA, storeB], ([$storeA, $storeB], set, update) => set($storeB ? $storeA.toString() : '1'));

// `derived()`, two dependencies, complex derive function, with default value (mismatched)
/*  */ const storeHA = derived([storeA, storeB], ([$storeA, $storeB], set, update) => set($storeB ? $storeA.toString() : '1'), 'initial');
/*RN*/ const storeHB = derived<[number, boolean]>([storeA, storeB], ([$storeA, $storeB], set, update) => set($storeB ? $storeA.toString() : '1'), 'initial');
/*EI*/ const storeHC = derived<[number, boolean], object>([storeA, storeB], ([$storeA, $storeB], set, update) => set($storeB ? $storeA.toString() : '1'), 'initial');
/*RN*/ const storeHD = derived<[Writable<number>, Writable<boolean>]>([storeA, storeB], ([$storeA, $storeB], set, update) => set($storeB ? $storeA.toString() : '1'), 'initial');
/*EI*/ const storeHE = derived<[Writable<number>, Writable<boolean>], object>([storeA, storeB], ([$storeA, $storeB], set, update) => set($storeB ? $storeA.toString() : '1'), 'initial');

// `derived()`, single external dependency (A), simple derive function, without default value
/*  */ const storeIA = derived(eStoreA, $eStoreA => $eStoreA + 1);
/*  */ const storeIB = derived(eStoreA as ExternalReadable<number>, $eStoreA => $eStoreA + 1);
/*  */ const storeIC = derived(eStoreA as unknown as Readable<number>, $eStoreA => $eStoreA + 1);
/*RN*/ const storeID = derived<number>(eStoreA, $eStoreA => $eStoreA + 1);
/*RN*/ const storeIE = derived<number>(eStoreA as ExternalReadable<number>, $eStoreA => $eStoreA + 1);
/*RN*/ const storeIF = derived<number>(eStoreA as unknown as Readable<number>, $eStoreA => $eStoreA + 1);
/*PS*/ const storeIG = derived<number, string>(eStoreA, $eStoreA => $eStoreA + 1);
/*PS*/ const storeIH = derived<number, string>(eStoreA as ExternalReadable<number>, $eStoreA => $eStoreA + 1);
/*PS*/ const storeII = derived<number, string>(eStoreA as unknown as Readable<number>, $eStoreA => $eStoreA + 1);
/*RN*/ const storeIJ = derived<Readable<number>>(eStoreA, $eStoreA => $eStoreA + 1);
/*RN*/ const storeIK = derived<Readable<number>>(eStoreA as ExternalReadable<number>, $eStoreA => $eStoreA + 1);
/*RN*/ const storeIL = derived<Readable<number>>(eStoreA as unknown as Readable<number>, $eStoreA => $eStoreA + 1);
/*PS*/ const storeIM = derived<Readable<number>, string>(eStoreA, $eStoreA => $eStoreA + 1);
/*PS*/ const storeIN = derived<Readable<number>, string>(eStoreA as ExternalReadable<number>, $eStoreA => $eStoreA + 1);
/*PS*/ const storeIO = derived<Readable<number>, string>(eStoreA as unknown as Readable<number>, $eStoreA => $eStoreA + 1);

// `derived()`, single external dependency (A), simple derive function, with default value (mismatched)
/*  */ const storeJA = derived(eStoreA, $eStoreA => $eStoreA + 1, 1);
/*  */ const storeJB = derived(eStoreA as ExternalReadable<number>, $eStoreA => $eStoreA + 1, 1);
/*  */ const storeJC = derived(eStoreA as unknown as Readable<number>, $eStoreA => $eStoreA + 1, 1);
/*RN*/ const storeJD = derived<number>(eStoreA, $eStoreA => $eStoreA + 1, 1);
/*RN*/ const storeJE = derived<number>(eStoreA as ExternalReadable<number>, $eStoreA => $eStoreA + 1, 1);
/*RN*/ const storeJF = derived<number>(eStoreA as unknown as Readable<number>, $eStoreA => $eStoreA + 1, 1);
/*PS*/ const storeJG = derived<number, string>(eStoreA, $eStoreA => $eStoreA + 1, 1);
/*PS*/ const storeJH = derived<number, string>(eStoreA as ExternalReadable<number>, $eStoreA => $eStoreA + 1, 1);
/*PS*/ const storeJI = derived<number, string>(eStoreA as unknown as Readable<number>, $eStoreA => $eStoreA + 1, 1);
/*RN*/ const storeJJ = derived<Readable<number>>(eStoreA, $eStoreA => $eStoreA + 1, 1);
/*RN*/ const storeJK = derived<Readable<number>>(eStoreA as ExternalReadable<number>, $eStoreA => $eStoreA + 1, 1);
/*RN*/ const storeJL = derived<Readable<number>>(eStoreA as unknown as Readable<number>, $eStoreA => $eStoreA + 1, 1);
/*PS*/ const storeJM = derived<Readable<number>, string>(eStoreA, $eStoreA => $eStoreA + 1, 1);
/*PS*/ const storeJN = derived<Readable<number>, string>(eStoreA as ExternalReadable<number>, $eStoreA => $eStoreA + 1, 1);
/*PS*/ const storeJO = derived<Readable<number>, string>(eStoreA as unknown as Readable<number>, $eStoreA => $eStoreA + 1, 1);

// `derived()`, single external dependency (B), simple derive function, without default value
/*PU*/ const storeKA = derived(eStoreB, $eStoreB => $eStoreB + 1);
/*  */ const storeKB = derived(eStoreB as ExternalReadable<number>, $eStoreB => $eStoreB + 1);
/*  */ const storeKC = derived(eStoreB as unknown as Readable<number>, $eStoreB => $eStoreB + 1);
/*RN*/ const storeKD = derived<number>(eStoreB, $eStoreB => $eStoreB + 1);
/*RN*/ const storeKE = derived<number>(eStoreB as ExternalReadable<number>, $eStoreB => $eStoreB + 1);
/*RN*/ const storeKF = derived<number>(eStoreB as unknown as Readable<number>, $eStoreB => $eStoreB + 1);
/*PS*/ const storeKG = derived<number, string>(eStoreB, $eStoreB => $eStoreB + 1);
/*PS*/ const storeKH = derived<number, string>(eStoreB as ExternalReadable<number>, $eStoreB => $eStoreB + 1);
/*PS*/ const storeKI = derived<number, string>(eStoreB as unknown as Readable<number>, $eStoreB => $eStoreB + 1);
/*RN*/ const storeKJ = derived<Readable<number>>(eStoreB, $eStoreB => $eStoreB + 1);
/*RN*/ const storeKK = derived<Readable<number>>(eStoreB as ExternalReadable<number>, $eStoreB => $eStoreB + 1);
/*RN*/ const storeKL = derived<Readable<number>>(eStoreB as unknown as Readable<number>, $eStoreB => $eStoreB + 1);
/*PS*/ const storeKM = derived<Readable<number>, string>(eStoreB, $eStoreB => $eStoreB + 1);
/*PS*/ const storeKN = derived<Readable<number>, string>(eStoreB as ExternalReadable<number>, $eStoreB => $eStoreB + 1);
/*PS*/ const storeKO = derived<Readable<number>, string>(eStoreB as unknown as Readable<number>, $eStoreB => $eStoreB + 1);

// `derived()`, single external dependency (B), simple derive function, with default value (mismatched)
/*PU*/ const storeLA = derived(eStoreB, $eStoreB => $eStoreB + 1, 1);
/*  */ const storeLB = derived(eStoreB as ExternalReadable<number>, $eStoreB => $eStoreB + 1, 1);
/*  */ const storeLC = derived(eStoreB as unknown as Readable<number>, $eStoreB => $eStoreB + 1, 1);
/*RN*/ const storeLD = derived<number>(eStoreB, $eStoreB => $eStoreB + 1, 1);
/*RN*/ const storeLE = derived<number>(eStoreB as ExternalReadable<number>, $eStoreB => $eStoreB + 1, 1);
/*RN*/ const storeLF = derived<number>(eStoreB as unknown as Readable<number>, $eStoreB => $eStoreB + 1, 1);
/*PS*/ const storeLG = derived<number, string>(eStoreB, $eStoreB => $eStoreB + 1, 1);
/*PS*/ const storeLH = derived<number, string>(eStoreB as ExternalReadable<number>, $eStoreB => $eStoreB + 1, 1);
/*PS*/ const storeLI = derived<number, string>(eStoreB as unknown as Readable<number>, $eStoreB => $eStoreB + 1, 1);
/*RN*/ const storeLJ = derived<Readable<number>>(eStoreB, $eStoreB => $eStoreB + 1, 1);
/*RN*/ const storeLK = derived<Readable<number>>(eStoreB as ExternalReadable<number>, $eStoreB => $eStoreB + 1, 1);
/*RN*/ const storeLL = derived<Readable<number>>(eStoreB as unknown as Readable<number>, $eStoreB => $eStoreB + 1, 1);
/*PS*/ const storeLM = derived<Readable<number>, string>(eStoreB, $eStoreB => $eStoreB + 1, 1);
/*PS*/ const storeLN = derived<Readable<number>, string>(eStoreB as ExternalReadable<number>, $eStoreB => $eStoreB + 1, 1);
/*PS*/ const storeLO = derived<Readable<number>, string>(eStoreB as unknown as Readable<number>, $eStoreB => $eStoreB + 1, 1);

// `derived()`, two external dependencies, simple derive function, without default value
/*PU*/ const storeMA = derived([eStoreA, eStoreB], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*  */ const storeMB = derived([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*  */ const storeMC = derived([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*RN*/ const storeMD = derived<[number, boolean]>([eStoreA, eStoreB], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*RN*/ const storeME = derived<[number, boolean]>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*RN*/ const storeMF = derived<[number, boolean]>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*  */ const storeMG = derived<[number, boolean], string>([eStoreA, eStoreB], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*  */ const storeMH = derived<[number, boolean], string>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*  */ const storeMI = derived<[number, boolean], string>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*RN*/ const storeMJ = derived<[Readable<number>, Readable<boolean>]>([eStoreA, eStoreB], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*RN*/ const storeMK = derived<[Readable<number>, Readable<boolean>]>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*RN*/ const storeML = derived<[Readable<number>, Readable<boolean>]>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*  */ const storeMM = derived<[Readable<number>, Readable<boolean>], string>([eStoreA, eStoreB], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*  */ const storeMN = derived<[Readable<number>, Readable<boolean>], string>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');
/*  */ const storeMO = derived<[Readable<number>, Readable<boolean>], string>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1');

// `derived()`, two external dependencies, simple derive function, with default value (mismatched)
/*PU*/ const storeNA = derived([eStoreA, eStoreB], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*  */ const storeNB = derived([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*  */ const storeNC = derived([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*RN*/ const storeND = derived<[number, boolean]>([eStoreA, eStoreB], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*RN*/ const storeNE = derived<[number, boolean]>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*RN*/ const storeNF = derived<[number, boolean]>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*  */ const storeNG = derived<[number, boolean], string>([eStoreA, eStoreB], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*  */ const storeNH = derived<[number, boolean], string>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*  */ const storeNI = derived<[number, boolean], string>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*RN*/ const storeNJ = derived<[Readable<number>, Readable<boolean>]>([eStoreA, eStoreB], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*RN*/ const storeNK = derived<[Readable<number>, Readable<boolean>]>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*RN*/ const storeNL = derived<[Readable<number>, Readable<boolean>]>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*  */ const storeNM = derived<[Readable<number>, Readable<boolean>], string>([eStoreA, eStoreB], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*  */ const storeNN = derived<[Readable<number>, Readable<boolean>], string>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');
/*  */ const storeNO = derived<[Readable<number>, Readable<boolean>], string>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB]) => $eStoreB ? $eStoreA.toString() : '1', 'initial');

// `derived()`, single external dependency (A), complex derive function, without default value
/*  */ const storeOA = derived(eStoreA, ($eStoreA, set) => set($eStoreA + 1));
/*  */ const storeOB = derived(eStoreA as ExternalReadable<number>, ($eStoreA, set) => set($eStoreA + 1));
/*  */ const storeOC = derived(eStoreA as unknown as Readable<number>, ($eStoreA, set) => set($eStoreA + 1));
/*RN*/ const storeOD = derived<number>(eStoreA, ($eStoreA, set) => set($eStoreA + 1));
/*RN*/ const storeOE = derived<number>(eStoreA as ExternalReadable<number>, ($eStoreA, set) => set($eStoreA + 1));
/*RN*/ const storeOF = derived<number>(eStoreA as unknown as Readable<number>, ($eStoreA, set) => set($eStoreA + 1));
/*PS*/ const storeOG = derived<number, string>(eStoreA, ($eStoreA, set) => set($eStoreA + 1));
/*PS*/ const storeOH = derived<number, string>(eStoreA as ExternalReadable<number>, ($eStoreA, set) => set($eStoreA + 1));
/*PS*/ const storeOI = derived<number, string>(eStoreA as unknown as Readable<number>, ($eStoreA, set) => set($eStoreA + 1));
/*RN*/ const storeOJ = derived<Readable<number>>(eStoreA, ($eStoreA, set) => set($eStoreA + 1));
/*RN*/ const storeOK = derived<Readable<number>>(eStoreA as ExternalReadable<number>, ($eStoreA, set) => set($eStoreA + 1));
/*RN*/ const storeOL = derived<Readable<number>>(eStoreA as unknown as Readable<number>, ($eStoreA, set) => set($eStoreA + 1));
/*PS*/ const storeOM = derived<Readable<number>, string>(eStoreA, ($eStoreA, set) => set($eStoreA + 1));
/*PS*/ const storeON = derived<Readable<number>, string>(eStoreA as ExternalReadable<number>, ($eStoreA, set) => set($eStoreA + 1));
/*PS*/ const storeOO = derived<Readable<number>, string>(eStoreA as unknown as Readable<number>, ($eStoreA, set) => set($eStoreA + 1));

// `derived()`, single external dependency (A), complex derive function, with default value (mismatched)
/*  */ const storePA = derived(eStoreA, ($eStoreA, set) => set($eStoreA + 1), 1);
/*  */ const storePB = derived(eStoreA as ExternalReadable<number>, ($eStoreA, set) => set($eStoreA + 1), 1);
/*  */ const storePC = derived(eStoreA as unknown as Readable<number>, ($eStoreA, set) => set($eStoreA + 1), 1);
/*RN*/ const storePD = derived<number>(eStoreA, ($eStoreA, set) => set($eStoreA + 1), 1);
/*RN*/ const storePE = derived<number>(eStoreA as ExternalReadable<number>, ($eStoreA, set) => set($eStoreA + 1), 1);
/*RN*/ const storePF = derived<number>(eStoreA as unknown as Readable<number>, ($eStoreA, set) => set($eStoreA + 1), 1);
/*EI*/ const storePG = derived<number, string>(eStoreA, ($eStoreA, set) => set($eStoreA + 1), 1);
/*EI*/ const storePH = derived<number, string>(eStoreA as ExternalReadable<number>, ($eStoreA, set) => set($eStoreA + 1), 1);
/*EI*/ const storePI = derived<number, string>(eStoreA as unknown as Readable<number>, ($eStoreA, set) => set($eStoreA + 1), 1);
/*RN*/ const storePJ = derived<Readable<number>>(eStoreA, ($eStoreA, set) => set($eStoreA + 1), 1);
/*RN*/ const storePK = derived<Readable<number>>(eStoreA as ExternalReadable<number>, ($eStoreA, set) => set($eStoreA + 1), 1);
/*RN*/ const storePL = derived<Readable<number>>(eStoreA as unknown as Readable<number>, ($eStoreA, set) => set($eStoreA + 1), 1);
/*EI*/ const storePM = derived<Readable<number>, string>(eStoreA, ($eStoreA, set) => set($eStoreA + 1), 1);
/*EI*/ const storePN = derived<Readable<number>, string>(eStoreA as ExternalReadable<number>, ($eStoreA, set) => set($eStoreA + 1), 1);
/*EI*/ const storePO = derived<Readable<number>, string>(eStoreA as unknown as Readable<number>, ($eStoreA, set) => set($eStoreA + 1), 1);

// `derived()`, single external dependency (B), complex derive function, without default value
/*PU*/ const storeQA = derived(eStoreB, ($eStoreB, set) => set($eStoreB + 1));
/*  */ const storeQB = derived(eStoreB as ExternalReadable<number>, ($eStoreB, set) => set($eStoreB + 1));
/*  */ const storeQC = derived(eStoreB as unknown as Readable<number>, ($eStoreB, set) => set($eStoreB + 1));
/*RN*/ const storeQD = derived<number>(eStoreB, ($eStoreB, set) => set($eStoreB + 1));
/*RN*/ const storeQE = derived<number>(eStoreB as ExternalReadable<number>, ($eStoreB, set) => set($eStoreB + 1));
/*RN*/ const storeQF = derived<number>(eStoreB as unknown as Readable<number>, ($eStoreB, set) => set($eStoreB + 1));
/*PS*/ const storeQG = derived<number, string>(eStoreB, ($eStoreB, set) => set($eStoreB + 1));
/*PS*/ const storeQH = derived<number, string>(eStoreB as ExternalReadable<number>, ($eStoreB, set) => set($eStoreB + 1));
/*PS*/ const storeQI = derived<number, string>(eStoreB as unknown as Readable<number>, ($eStoreB, set) => set($eStoreB + 1));
/*RN*/ const storeQJ = derived<Readable<number>>(eStoreB, ($eStoreB, set) => set($eStoreB + 1));
/*RN*/ const storeQK = derived<Readable<number>>(eStoreB as ExternalReadable<number>, ($eStoreB, set) => set($eStoreB + 1));
/*RN*/ const storeQL = derived<Readable<number>>(eStoreB as unknown as Readable<number>, ($eStoreB, set) => set($eStoreB + 1));
/*PS*/ const storeQM = derived<Readable<number>, string>(eStoreB, ($eStoreB, set) => set($eStoreB + 1));
/*PS*/ const storeQN = derived<Readable<number>, string>(eStoreB as ExternalReadable<number>, ($eStoreB, set) => set($eStoreB + 1));
/*PS*/ const storeQO = derived<Readable<number>, string>(eStoreB as unknown as Readable<number>, ($eStoreB, set) => set($eStoreB + 1));

// `derived()`, single external dependency (B), complex derive function, with default value (mismatched)
/*PU*/ const storeRA = derived(eStoreB, ($eStoreB, set) => set($eStoreB + 1), 1);
/*  */ const storeRB = derived(eStoreB as ExternalReadable<number>, ($eStoreB, set) => set($eStoreB + 1), 1);
/*  */ const storeRC = derived(eStoreB as unknown as Readable<number>, ($eStoreB, set) => set($eStoreB + 1), 1);
/*RN*/ const storeRD = derived<number>(eStoreB, ($eStoreB, set) => set($eStoreB + 1), 1);
/*RN*/ const storeRE = derived<number>(eStoreB as ExternalReadable<number>, ($eStoreB, set) => set($eStoreB + 1), 1);
/*RN*/ const storeRF = derived<number>(eStoreB as unknown as Readable<number>, ($eStoreB, set) => set($eStoreB + 1), 1);
/*EI*/ const storeRG = derived<number, string>(eStoreB, ($eStoreB, set) => set($eStoreB + 1), 1);
/*EI*/ const storeRH = derived<number, string>(eStoreB as ExternalReadable<number>, ($eStoreB, set) => set($eStoreB + 1), 1);
/*EI*/ const storeRI = derived<number, string>(eStoreB as unknown as Readable<number>, ($eStoreB, set) => set($eStoreB + 1), 1);
/*RN*/ const storeRJ = derived<Readable<number>>(eStoreB, ($eStoreB, set) => set($eStoreB + 1), 1);
/*RN*/ const storeRK = derived<Readable<number>>(eStoreB as ExternalReadable<number>, ($eStoreB, set) => set($eStoreB + 1), 1);
/*RN*/ const storeRL = derived<Readable<number>>(eStoreB as unknown as Readable<number>, ($eStoreB, set) => set($eStoreB + 1), 1);
/*EI*/ const storeRM = derived<Readable<number>, string>(eStoreB, ($eStoreB, set) => set($eStoreB + 1), 1);
/*EI*/ const storeRN = derived<Readable<number>, string>(eStoreB as ExternalReadable<number>, ($eStoreB, set) => set($eStoreB + 1), 1);
/*EI*/ const storeRO = derived<Readable<number>, string>(eStoreB as unknown as Readable<number>, ($eStoreB, set) => set($eStoreB + 1), 1);

// `derived()`, two external dependencies, complex derive function, without default value
/*PU*/ const storeSA = derived([eStoreA, eStoreB], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*  */ const storeSB = derived([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*  */ const storeSC = derived([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*RN*/ const storeSD = derived<[number, boolean]>([eStoreA, eStoreB], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*RN*/ const storeSE = derived<[number, boolean]>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*RN*/ const storeSF = derived<[number, boolean]>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*  */ const storeSG = derived<[number, boolean], string>([eStoreA, eStoreB], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*  */ const storeSH = derived<[number, boolean], string>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*  */ const storeSI = derived<[number, boolean], string>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*RN*/ const storeSJ = derived<[Readable<number>, Readable<boolean>]>([eStoreA, eStoreB], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*RN*/ const storeSK = derived<[Readable<number>, Readable<boolean>]>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*RN*/ const storeSL = derived<[Readable<number>, Readable<boolean>]>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*  */ const storeSM = derived<[Readable<number>, Readable<boolean>], string>([eStoreA, eStoreB], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*  */ const storeSN = derived<[Readable<number>, Readable<boolean>], string>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));
/*  */ const storeSO = derived<[Readable<number>, Readable<boolean>], string>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'));

// `derived()`, two external dependencies, complex derive function, with default value (mismatched)
/*PU*/ const storeTA = derived([eStoreA, eStoreB], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*  */ const storeTB = derived([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*  */ const storeTC = derived([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*RN*/ const storeTD = derived<[number, boolean]>([eStoreA, eStoreB], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*RN*/ const storeTE = derived<[number, boolean]>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*RN*/ const storeTF = derived<[number, boolean]>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*  */ const storeTG = derived<[number, boolean], string>([eStoreA, eStoreB], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*  */ const storeTH = derived<[number, boolean], string>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*  */ const storeTI = derived<[number, boolean], string>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*RN*/ const storeTJ = derived<[Readable<number>, Readable<boolean>]>([eStoreA, eStoreB], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*RN*/ const storeTK = derived<[Readable<number>, Readable<boolean>]>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*RN*/ const storeTL = derived<[Readable<number>, Readable<boolean>]>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*  */ const storeTM = derived<[Readable<number>, Readable<boolean>], string>([eStoreA, eStoreB], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*  */ const storeTN = derived<[Readable<number>, Readable<boolean>], string>([eStoreA as ExternalReadable<number>, eStoreB as ExternalReadable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');
/*  */ const storeTO = derived<[Readable<number>, Readable<boolean>], string>([eStoreA as unknown as Readable<number>, eStoreB as unknown as Readable<boolean>], ([$eStoreA, $eStoreB], set) => set($eStoreB ? $eStoreA.toString() : '1'), 'initial');

/**
 * `readable()`
 *
 * FLAGS:
 * - " ":  The line should show no type errors.
 * - "P":  The line should show partial type errors.
 * - "E":  The entire line should be highlighted as a type error.
 * - "I":  The third argument (`initialValue`) is of a different type to that
 *         specified in the generic type arguments. The latter should take
 *         precedence over automatic type inference, so the `initialValue` value
 *         is highlighted as incompatible.
 * - "S":  The value passed to the `set()` function or returned from the
 *         function passed to the `update()` function does not match the type
 *         specified in the generic type arguments passed to `readable()`.
 */

// `readable()`
/*  */ const stateUA = readable(1);
/*PI*/ const stateUB = readable<boolean>(1);
/*PS*/ const stateUC = readable(1, (set, update) => { set(true) });
/*PI*/ const stateUD = readable<boolean>(1, (set, update) => { set(true) });
/*PS*/ const stateUE = readable(1, (set, update) => { update(value => true) });
/*PI*/ const stateUF = readable<boolean>(1, (set, update) => { update(value => true) });

/**
 * `writable()`
 *
 * FLAGS:
 * - " ":  The line should show no type errors.
 * - "P":  The line should show partial type errors.
 * - "I":  The first argument (`initialValue`) is of a different type to that
 *         specified in the generic type arguments. The latter should take
 *         precedence over automatic type inference, so the `initialValue` value
 *         is highlighted as incompatible.
 * - "S":  The value passed to the `set()` function or returned from the
 *         function passed to the `update()` function does not match the type
 *         specified in the generic type arguments passed to `writable()`.
 * - "M":  The value passed to the `set()` method or returned from the
 *         function passed to the `update()` method does not match the type
 *         specified in the generic type arguments passed to `writable()`.
 */

// `writable()`
/*  */ const stateVA = writable(1);
/*PI*/ const stateVB = writable<boolean>(1);
/*PS*/ const stateVC = writable(1, (set, update) => { set(true) });
/*PI*/ const stateVD = writable<boolean>(1, (set, update) => { set(true) });
/*PS*/ const stateVE = writable(1, (set, update) => { update(value => true) });
/*PI*/ const stateVF = writable<boolean>(1, (set, update) => { update(value => true) });

// `writable()`, `set()` and `update()` methods
/*PM*/ const voidWA = writable(1).set(true);
/*PI*/ const voidWB = writable<boolean>(1).set(true);
/*PM*/ const voidWC = writable(1).update(value => true);
/*PI*/ const voidWD = writable<boolean>(1).update(value => true);

/**
 * `readonly()`
 *
 * FLAGS:
 * - " ":  The line should show no type errors.
 * - "P":  The line should show partial type errors.
 * - "S":  The store holds a value of a different type to that specified in the
 *         generic type arguments. The latter should take precedence over
 *         automatic type inference, so the `store` value is highlighted as
 *         incompatible.
 */

// `readonly()`
/*  */ const storeXA = readonly(storeA);
/*PS*/ const storeXB = readonly<boolean>(storeA);

/**
 * `get()`
 *
 * FLAGS:
 * - " ":  The line should show no type errors.
 * - "P":  The line should show partial type errors.
 * - "S":  The store holds a value of a different type to that specified in the
 *         generic type arguments. The latter should take precedence over
 *         automatic type inference, so the `store` value is highlighted as
 *         incompatible.
 * - "A":  If executed, `get()` would briefly subscribe to the store, even
 *         though `allowStale` is set.
 * - "E":  The store is external and is typed as such, so this overload (with
 *         `allowStale`) is not available.
 */

// `get()`
/*  */ const valueYA = get(storeA);
/*PS*/ const valueYB = get<boolean>(storeA);
/*  */ const valueYC = get(eStoreA);
/*  */ const valueYD = get<boolean>(eStoreA);
/*PS*/ const valueYE = get<boolean>(eStoreA as ExternalReadable<number>);
/*  */ const valueYF = get(eStoreB);
/*  */ const valueYG = get<string>(eStoreB);
/*PS*/ const valueYH = get<string>(eStoreB as ExternalReadable<boolean>);

// `get()`, `allowStale`
/*  */ const valueZA = get(storeA, true);
/*PS*/ const valueZB = get<boolean>(storeA, true);
/* A*/ const valueZC = get(eStoreA, true);
/* A*/ const valueZD = get<boolean>(eStoreA, true);
/*PS*/ const valueZE = get<boolean>(eStoreA as ExternalReadable<number>, true);
/*PE*/ const valueZF = get(eStoreB, true);
/*PE*/ const valueZG = get<string>(eStoreB, true);
/*PS*/ const valueZH = get<string>(eStoreB as ExternalReadable<boolean>, true);
