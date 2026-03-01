import type { TestSpecification } from "vitest/node";

/**
 * Sorts test files alphabetically so runs are deterministic regardless
 * of the filesystem order the OS returns them in.
 */
export default class AlphabeticalSequencer {
    async sort(files: TestSpecification[]): Promise<TestSpecification[]> {
        return [...files].sort((a, b) => {
            const aId = typeof a === "string" ? a : (a as any).moduleId ?? "";
            const bId = typeof b === "string" ? b : (b as any).moduleId ?? "";
            return aId.localeCompare(bId);
        });
    }

    async shard(files: TestSpecification[]): Promise<TestSpecification[]> {
        return files;
    }
}
