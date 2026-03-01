/**
 * Enhanced Markdown Reporter for Vitest.
 * Used in CI (GITHUB_ACTIONS=true) to output a markdown test-results.md summary.
 * In local runs, the "default" reporter is used instead.
 */
export class EnhancedVitestMarkdownReporter {
    constructor(options = {}) {
        this.title = options.title ?? "Test Results";
        this.outputPath = options.outputPath ?? "test-results.md";
        this.enableGithubActionsSummary = options.enableGithubActionsSummary ?? true;
        this.results = [];
    }

    onFinished(files = [], errors = []) {
        const lines = [`# ${this.title}\n`];

        let passed = 0;
        let failed = 0;

        for (const file of files) {
            for (const task of file.tasks ?? []) {
                const icon = task.result?.state === "pass" ? "✅" : "❌";
                lines.push(`- ${icon} ${task.name}`);
                if (task.result?.state === "pass") passed++;
                else failed++;
            }
        }

        lines.push("");
        lines.push(`**${passed} passed · ${failed} failed**`);

        if (errors.length) {
            lines.push("\n## Errors\n");
            for (const err of errors) {
                lines.push(`- ${err.message ?? err}`);
            }
        }

        const { writeFileSync } = require("node:fs");
        try {
            writeFileSync(this.outputPath, lines.join("\n"), "utf-8");
        } catch {
            // Non-fatal — output path may not be writable in all environments
        }
    }
}
