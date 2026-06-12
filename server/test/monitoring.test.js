import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { recordOutcome, getOutcomeStats, _resetMonitoring } from '../src/services/monitoring.service.js';
import { config } from '../src/config.js';

beforeEach(() => _resetMonitoring());

test('does not alert before reaching the minimum sample size', async () => {
  let alerts = 0;
  const notify = () => {
    alerts += 1;
  };
  for (let i = 0; i < config.alerts.minSamples - 1; i += 1) {
    await recordOutcome(false, { nowMs: i, notify });
  }
  assert.equal(alerts, 0);
});

test('alerts once the failure ratio crosses the threshold with enough samples', async () => {
  const messages = [];
  const notify = (msg) => messages.push(msg);
  let fired = false;
  for (let i = 0; i < config.alerts.minSamples; i += 1) {
    fired = await recordOutcome(false, { nowMs: i, notify });
  }
  assert.equal(fired, true);
  assert.equal(messages.length, 1);
  assert.match(messages[0], /failure rate/i);
});

test('stays silent when most requests succeed', async () => {
  let alerts = 0;
  const notify = () => {
    alerts += 1;
  };
  for (let i = 0; i < config.alerts.windowSize; i += 1) {
    // 80% success — below the 50% failure threshold.
    await recordOutcome(i % 5 !== 0, { nowMs: i, notify });
  }
  assert.equal(alerts, 0);
});

test('respects the cooldown between alerts', async () => {
  const messages = [];
  const notify = (msg) => messages.push(msg);
  for (let i = 0; i < config.alerts.minSamples; i += 1) {
    await recordOutcome(false, { nowMs: 0, notify });
  }
  // Another failure within the cooldown window must not re-alert.
  await recordOutcome(false, { nowMs: config.alerts.cooldownMs - 1, notify });
  assert.equal(messages.length, 1);
  // Past the cooldown, a new alert is allowed.
  await recordOutcome(false, { nowMs: config.alerts.cooldownMs + 1, notify });
  assert.equal(messages.length, 2);
});

test('getOutcomeStats reports the rolling window', async () => {
  await recordOutcome(true, { notify() {} });
  await recordOutcome(false, { notify() {} });
  const stats = getOutcomeStats();
  assert.equal(stats.samples, 2);
  assert.equal(stats.failureRatio, 0.5);
});
