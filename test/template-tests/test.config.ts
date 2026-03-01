/**
 * Shared constants used by vitest.config.js and individual test suites.
 */

export const PARALLEL_CONFIG = {
    enabled: true,
    maxConcurrency: 4,
    maxWorkers: 4,
    minWorkers: 1,
};

export const TIMEOUT_CONFIG = {
    testTimeout: 10_000, // 10 seconds per test
};

export const REPORTER_CONFIG = {
    title: "HallGuardian Test Results",
    enableGithubActionsSummary: true,
};
