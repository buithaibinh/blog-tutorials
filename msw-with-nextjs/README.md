# Mock Service Worker Example

[Mock Service Worker](https://github.com/mswjs/msw) is an API mocking library for browser and Node. It provides seamless mocking by interception of actual requests on the network level using Service Worker API. This makes your application unaware of any mocking being at place.

In this example we integrate Mock Service Worker with Next by following the next steps:

1. Define a set of [request handlers](./mocks/handlers.js) shared between client and server.
1. Setup a [Service Worker instance](./mocks/browser.js) that would intercept all runtime client-side requests via `setupWorker` function.
1. Setup a ["server" instance](./mocks/server.js) to intercept any server/build time requests (e.g. the one happening in `getServerSideProps`) via `setupServer` function.

Mocking is enabled using the `NEXT_PUBLIC_API_MOCKING` environment variable. By default, mocking is enabled for both development and production. This allows you to have working preview deployments before implementing an actual API. To disable MSW for a specific environment, change the environment variable value in the file corresponding to the environment from `enabled` to `disabled`.
