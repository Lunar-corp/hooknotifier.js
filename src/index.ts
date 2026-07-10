/**
 * hook.notifier — send yourself a real push notification with one HTTP request.
 *
 * The SDK is a thin typed wrapper around the Hook.Notifier hook URL:
 * https://hooknotifier.com/{identifier}/{key}
 *
 * Docs: https://hooknotifier.com/llm
 */

export type Priority = 'low' | 'normal' | 'high' | 'critical';

export interface Action {
  /** Button text shown on the notification. */
  label: string;
  /** http(s) or mailto link opened when the button is tapped. */
  url: string;
}

export interface NotificationInput {
  /** The notification title. Required. */
  object: string;
  /** The message text. Required. Rendered as markdown when `markdown` is true. */
  body: string;
  /** `critical` breaks through quiet hours. Default: `normal`. */
  priority?: Priority;
  /** Inbox tag folder(s), comma separated or as an array. Default: `general`. */
  tags?: string | string[];
  /** Hex accent color, e.g. `#EE6767`. */
  color?: string;
  /** Public image URL displayed inside the notification. */
  image?: string;
  /** Link opened when the notification is tapped (http/https/mailto). */
  redirectUrl?: string;
  /** Up to 3 action buttons. */
  actions?: Action[];
  /** Render the body as markdown. Default: false. */
  markdown?: boolean;
  /** Send later: `30s`, `10m`, `2h`, `1d` (up to 3 days). */
  delay?: string;
  /** Send at a date: ISO string, unix timestamp or Date (up to 3 days ahead). */
  at?: string | number | Date;
  /** false for a silent, inbox-only notification. Default: true. */
  sound?: boolean;
  /** Also notify every member of your team. Default: false. */
  sendToTeam?: boolean;
}

export type NotificationDefaults = Partial<Omit<NotificationInput, 'object' | 'body'>>;

export interface NotificationResult {
  status: 'ok';
  /** Pass it to update() to edit the notification in place. */
  id: number;
  /** Present when the notification is scheduled via `delay` or `at`. */
  scheduledFor?: string;
}

export interface HookNotifierOptions {
  /** Your numeric identifier, from your hook URL in the dashboard. */
  identifier: string | number;
  /** Your key (or a named hook key), from your hook URL in the dashboard. */
  key: string;
  /** Defaults merged into every notify() call; call-level values win. */
  defaults?: NotificationDefaults;
  /** Override the API origin. Default: `https://hooknotifier.com`. */
  endpoint?: string;
}

const DEFAULT_ENDPOINT = 'https://hooknotifier.com';

const serialize = (input: Partial<NotificationInput>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined || v === null) continue;
    out[k] = v;
  }
  if (Array.isArray(input.tags)) out.tags = input.tags.filter(Boolean).join(',');
  if (input.at instanceof Date) out.at = input.at.toISOString();
  return out;
};

const request = async (url: string, method: 'POST' | 'PUT', payload: Record<string, unknown>): Promise<NotificationResult> => {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = undefined;
  }

  if (!res.ok || (parsed && parsed.status && parsed.status !== 'ok')) {
    const message = parsed?.error?.message || parsed?.message || text || `HTTP ${res.status}`;
    throw new Error(`hook.notifier: ${message}`);
  }

  return parsed as NotificationResult;
};

export default class HookNotifier {
  private readonly base: string;
  private readonly defaults: NotificationDefaults;

  constructor(options: HookNotifierOptions) {
    const { identifier, key, defaults = {}, endpoint = DEFAULT_ENDPOINT } = options ?? ({} as HookNotifierOptions);
    if (!identifier) throw new Error('hook.notifier: identifier required');
    if (!key) throw new Error('hook.notifier: key required');
    this.base = `${endpoint.replace(/\/+$/, '')}/${identifier}/${key}`;
    this.defaults = defaults;
  }

  /** Send a push notification. Resolves with `{ status: 'ok', id }`. */
  notify(input: NotificationInput): Promise<NotificationResult> {
    const merged = { ...this.defaults, ...input };
    if (!merged.object) return Promise.reject(new Error('hook.notifier: object required'));
    if (!merged.body) return Promise.reject(new Error('hook.notifier: body required'));
    return request(this.base, 'POST', serialize(merged));
  }

  /**
   * Update a previously sent notification in place (progress counters, status
   * changes): the new push replaces the old one on the device, the inbox
   * updates live. Only the fields you pass are changed.
   */
  update(id: number | string, input: Partial<NotificationInput>): Promise<NotificationResult> {
    return request(`${this.base}/${id}`, 'PUT', serialize(input));
  }

  /** One-shot helper: `HookNotifier.notify({ identifier, key, object, body })`. */
  static notify(options: HookNotifierOptions & NotificationInput): Promise<NotificationResult> {
    const { identifier, key, defaults, endpoint, ...input } = options;
    return new HookNotifier({ identifier, key, defaults, endpoint }).notify(input as NotificationInput);
  }

  /** @deprecated 1.x name, kept as an alias. Use notify() — it returns the result. */
  sendNotification(input: NotificationInput): Promise<NotificationResult> {
    return this.notify(input);
  }
}
