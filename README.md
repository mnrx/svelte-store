# `@mnrx/svelte-store`

This is a re-implementation of `svelte/store` which offers more accurate
tracking of derived store validity, ensuring that re-evaluations do not happen
on invalid upstream state. It also includes expanded TypeScript support and a
small addition to the public API of `get()`.

For more information, see the [pull request to Svelte][pr].

[pr]: https://github.com/sveltejs/svelte/pull/9458

## Testing

To test this implementation against Svelte 5's test suite, run the following
commands, starting in this file's directory:

```sh
git clone --depth=1 https://github.com/sveltejs/svelte.git
cd svelte
pnpm install
npx playwright install
cp ../src/main.ts packages/svelte/src/store/
echo "export { writable, readable, derived, readonly, get, get_store_value } from './main.ts';" \
  > packages/svelte/src/store/index.js
pnpm run test
```

To test the TypeScript type definitions, see test/test.ts.

## Licence

Copyright © 2023 mnrx. Licensed under the [Open Software License version
3.0][osl].

[osl]: https://github.com/mnrx/svelte-store/blob/main/LICENSE.md

For an MIT-licensed version of this store implementation, see the JavaScript
version in my [Svelte fork][sf].

[sf]: https://github.com/mnrx/svelte/tree/main/packages/svelte/src/store
