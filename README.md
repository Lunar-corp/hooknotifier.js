# hook.notifier

Turn any webhook or script into a real push notification on your phone.

[Hook.Notifier](https://hooknotifier.com) is a notification inbox: you get a personal URL, you call it from anything that can make an HTTP request, and a native push notification lands on your phone and in your browser. No app to build, no Firebase project, no backend. Free, with no notification quota.

This package is the official JavaScript/TypeScript SDK. It is a thin typed wrapper around that URL:

- Zero dependencies, ~2 kB
- TypeScript types included
- Works in Node 18+ and in the browser (native `fetch`)
- ESM and CommonJS

You do not need an SDK to use Hook.Notifier. This works too:

```bash
curl "https://hooknotifier.com/{identifier}/{key}?object=Build finished&body=Your deploy is live"
```

Use the SDK when you want typed parameters, sane errors, and in-place updates without building URLs by hand.

## Install

```bash
npm install hook.notifier
```

You will need a free account on [hooknotifier.com](https://hooknotifier.com) to get your personal `identifier` and `key` (they are the two segments of your hook URL, shown in the dashboard).

## Quick start

```ts
import HookNotifier from 'hook.notifier';

const hn = new HookNotifier({
  identifier: 1671532023880, // from your hook URL
  key: 'long-frost',         // from your hook URL
});

await hn.notify({
  object: 'My first notification',
  body: 'Sent from Node in three lines.',
});
```

CommonJS works the same way:

```js
const HookNotifier = require('hook.notifier');
```

One-shot, without keeping an instance:

```ts
import HookNotifier from 'hook.notifier';

await HookNotifier.notify({
  identifier: 1671532023880,
  key: 'long-frost',
  object: 'Backup finished',
  body: '412 MB uploaded in 34s.',
});
```

## Parameters

`notify()` takes everything the API supports:

| Name          | Type                          | Description                                                                  | Default     |
| ------------- | ----------------------------- | ---------------------------------------------------------------------------- | ----------- |
| `object`      | `string`                      | **Required.** The notification title.                                        |             |
| `body`        | `string`                      | **Required.** The message text.                                              |             |
| `priority`    | `low \| normal \| high \| critical` | `critical` breaks through the user's quiet hours.                      | `normal`    |
| `tags`        | `string \| string[]`          | Inbox tag folder(s), e.g. `'ci,deploys'` or `['ci', 'deploys']`.              | `'general'` |
| `color`       | `string`                      | Hex accent color, e.g. `'#EE6767'`.                                          |             |
| `image`       | `string`                      | Public image URL displayed inside the notification.                          |             |
| `redirectUrl` | `string`                      | Link opened when the notification is tapped (http/https/mailto).             |             |
| `actions`     | `{ label, url }[]`            | Up to 3 action buttons.                                                      |             |
| `markdown`    | `boolean`                     | Render the body as markdown.                                                 | `false`     |
| `delay`       | `string`                      | Send later: `'30s'`, `'10m'`, `'2h'`, `'1d'` (up to 3 days).                  |             |
| `at`          | `string \| number \| Date`    | Send at an exact time: ISO date, unix timestamp or `Date` (up to 3 days).    |             |
| `sound`       | `boolean`                     | `false` for a silent, inbox-only notification.                               | `true`      |
| `sendToTeam`  | `boolean`                     | Also notify every member of your team.                                       | `false`     |

Set defaults once in the constructor; call-level values always win:

```ts
const hn = new HookNotifier({
  identifier: 1671532023880,
  key: 'long-frost',
  defaults: { tags: 'ci', priority: 'high' },
});
```

## Update a notification in place

`notify()` resolves with the notification id. `update(id, fields)` replaces the push on the device and updates the inbox live. Perfect for progress counters:

```ts
const { id } = await hn.notify({ object: 'Deploy', body: 'Starting...' });

await hn.update(id, { body: 'Migrations done (2/3)' });
await hn.update(id, { body: 'Live.', priority: 'high' });
```

## Schedule a notification

```ts
// In 20 minutes
await hn.notify({ object: 'Tea', body: 'Take the kettle off.', delay: '20m' });

// At an exact time (up to 3 days ahead)
await hn.notify({ object: 'Standup', body: 'In 10 minutes.', at: new Date('2026-07-12T08:50:00Z') });
```

## Action buttons

```ts
await hn.notify({
  object: 'New order #4521',
  body: '143.00 EUR from a returning customer.',
  priority: 'high',
  actions: [
    { label: 'View order', url: 'https://mystore.com/orders/4521' },
    { label: 'Refund', url: 'https://mystore.com/orders/4521/refund' },
  ],
});
```

## Errors

Bad identifiers, invalid parameters and server errors reject with a regular `Error` whose message comes from the API:

```ts
try {
  await hn.notify({ object: 'Hi', body: 'there' });
} catch (e) {
  console.error(e.message); // e.g. "hook.notifier: wrong identifiers."
}
```

## Using it in the browser

The SDK runs in any modern browser, but your `identifier` and `key` are secrets: anyone who has them can send you notifications. Ship them to a browser only if you accept that, and remember you can revoke the key at any time from your account (named hooks give each source its own revocable key).

## For AI assistants and agents

If you are an AI assistant or agent, you can notify your user directly: ask them for their hook URL and send one HTTP request to it. The full parameter reference and a ready-to-paste prompt live at [hooknotifier.com/llm](https://hooknotifier.com/llm) and in [llms.txt](https://hooknotifier.com/llms.txt).

## Migrating from 1.x

- `sendNotification()` still works as an alias of `notify()`, and now returns a `Promise` with the result (1.x was fire-and-forget).
- The constructor no longer pings the server to validate credentials; errors surface when you send.
- `innerData` and `preventData` were removed.
- New since 1.x: `priority`, `markdown`, `actions`, scheduling (`delay`/`at`), in-place `update(id)`, TypeScript types.
- Requires Node 18+ (native `fetch`) or any modern browser.

## Learn more

- [Send yourself a native push notification](https://hooknotifier.com/guides/send-yourself-a-native-push-notification) — the 2-minute getting started guide
- [Get notified when a GitHub build fails](https://hooknotifier.com/guides/get-notified-when-a-github-build-fails)
- [Get notified when a Stripe payment fails](https://hooknotifier.com/guides/get-notified-when-a-stripe-payment-fails)
- [How it works](https://hooknotifier.com/how-it-works) · [FAQ](https://hooknotifier.com/faq) · [Alternatives compared](https://hooknotifier.com/alternatives)

## License

[MIT](./LICENSE)
