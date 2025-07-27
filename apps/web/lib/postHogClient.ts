// src/lib/posthogClient.ts
import posthog from 'posthog-js';

export function initPosthog() {
  if (
    typeof window !== 'undefined' &&
    !posthog.__loaded // custom flag so we only init once
  ) {
    posthog.init(
      process.env.NEXT_PUBLIC_POSTHOG_API_KEY!,
      { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST! }
    );
    posthog.__loaded = true;
  }
  return posthog;
}
