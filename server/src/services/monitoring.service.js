import { config } from '../config.js';
import { logger } from '../logger.js';

// Rolling window of recent extraction outcomes (true = ok, false = failure).
// When the failure ratio crosses the threshold (with enough samples), we alert —
// this is how we learn yt-dlp broke *before* users start complaining.
const outcomes = [];
let lastAlertAt = -Infinity;

function failureRatio() {
  if (outcomes.length === 0) return 0;
  const failures = outcomes.filter((ok) => !ok).length;
  return failures / outcomes.length;
}

async function sendSlackAlert(text) {
  const url = config.alerts.slackWebhook;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch (err) {
    logger.warn({ err: err?.message }, 'Slack alert delivery failed');
  }
}

/**
 * Records a yt-dlp extraction outcome and fires an alert when the recent failure
 * rate is abnormally high. Alerts are rate-limited by a cooldown to avoid spam.
 * `nowMs`/`notify` are injectable for tests.
 */
export async function recordOutcome(ok, { nowMs = Date.now(), notify = sendSlackAlert } = {}) {
  outcomes.push(Boolean(ok));
  if (outcomes.length > config.alerts.windowSize) outcomes.shift();

  const { minSamples, errorRateThreshold, cooldownMs } = config.alerts;
  const ratio = failureRatio();

  if (outcomes.length >= minSamples && ratio >= errorRateThreshold && nowMs - lastAlertAt >= cooldownMs) {
    lastAlertAt = nowMs;
    const pct = Math.round(ratio * 100);
    const message = `⚠️ High extraction failure rate: ${pct}% of the last ${outcomes.length} requests failed. yt-dlp may be broken — check logs / run \`yt-dlp -U\`.`;
    logger.error({ ratio, samples: outcomes.length }, 'Extraction failure-rate alert triggered');
    await notify(message);
    return true;
  }
  return false;
}

/** Test/diagnostic helper. */
export function _resetMonitoring() {
  outcomes.length = 0;
  lastAlertAt = -Infinity;
}

export function getOutcomeStats() {
  return { samples: outcomes.length, failureRatio: failureRatio() };
}
