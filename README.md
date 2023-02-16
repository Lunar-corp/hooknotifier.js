Receive push notifications from your app to your phone.

- Lightweight ~8kB
- No dependencies
- Node & browser support

![divider hook notifier](https://cdn.hooknotifier.com/divider_hook_notifier_3b55ff9eb2.png)

# Installation

`npm install --save hook.notifier`

or

`yarn add hook.notifier`

# Before your continue

Hook.Notifier is an online service that allow you to receive push notifications on your phone and on your browser from any sources that can handle code or webhooks. You'll need an account to continue.

[Check Hook.Notifier official website](https://hooknotifier.com)

You can also check our [Getting start guide](https://hooknotifier.com/blog/get-started-with-hook-notifier) to learn everything about Hook.Notifier.

# Warning

**We have made this library work on a nodeJS server as well as on a browser. Using it on a browser can be interesting and convenient, but you have to keep in mind that your identifiers will not be safe anymore and that you expose them publicly. If ever your credentials are stolen, don't panic, your Hook.Notifier account remains safe, note that you can reset them in your Hook.Notifier account.**

# Simple start

```js
import HookNotifier from 'hook.notifier';

const hn = new HookNotifier({ 
  identifier: 1671532023880, // Replace with your identifier
  key: 'long-frost', // Replace with your key
});

hn.sendNotification({ 
  object: 'My first notification', 
  body: 'The body of my first notification.' 
});
```

![divider hook notifier](https://cdn.hooknotifier.com/divider_hook_notifier_3b55ff9eb2.png)

# Parameters

![divider hook notifier](https://cdn.hooknotifier.com/parameter_demonstration_c8571bb687.png?updated_at=2023-01-06T18:01:53.843Z)

| Name                   | Type              | Description                                                                                                                 | Default Value |
| ---------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------- |
| identifier             | String            | **Required** — This is your identifier you can find it in your Hook.Notifier account.                                       |               |
| key                    | String            | **Required** — This is your key you can find it in your Hook.Notifier account.                                              |               |
| object                 | String            | **Required** — The object of your notification.                                                                             |               |
| body                   | String            | **Required** — The content of your notification.                                                                            |               |
| tags                   | String (separated by ",")      | Separated by commas — Tags are splitted to be filtered and grouped in categories.                              | "general"     |
| color                  | String (#FFFFFF)  | The color of your notification.                                                                                             | "#FFC107"     |
| redirectUrl            | String (Url)      | Link to follow on click on the notification.                                                                                |               |
| image                  | String (Url)      | Image to display inside the notification.                                                                                   |               |
| sendToTeam             | Boolean           | The notification is sent to your team.                                                                                      | false         |
| sound                  | Boolean           | The notification have sound.                                                                                                | true          |
| innerData              | JSON              | Datas stored inside the notification.                                                                                       |               |
| preventData            | Boolean           | This can be use to prevent the save of all inner datas.                                                                     | false         |

# HookNotifier constructor

HookNotifier settings parameters can be passed to the constructor to use these in each of your requests.

```js
const hn = new HookNotifier({ 
  identifier: 1671532023880, // Replace with your identifier
  key: 'long-frost', // Replace with your key
  
  tags: 'newDefaultTag', 
  color: '#000000', 
  sendToTeam: true, 
  preventData: false, 
  sound: false,
});
```

# Full exemple

```js
hn.sendNotification({
  object: `You've sell something`,
  body: '143.00€ from ...@gmail.com',
  tags: 'ecommerce,online sell', 
  color: '#0097a7', 
  sendToTeam: false, 
  preventData: false,
  sound: true,
  redirectUrl: 'https://myonlineecommerce.com/order/123456789',
  innerData: {
    customer: '...@gmail.com',
    items: [
      { name: 'item-1', price: '143.00€' }
    ]
  },
});
```