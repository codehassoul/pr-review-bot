type PRChange = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch: string | null;
};

/**
 * Mock AI review generator.
 * Day 3 (Step 2): No real AI call yet.
 */
export async function generateAIReview(
  changes: PRChange[],
): Promise<string> {
  // Build prompt (for now, only for visibility / future use)
  const promptParts: string[] = [];

  promptParts.push(
    "You are a senior software engineer reviewing a GitHub pull request.",
  );
  promptParts.push(
    "Provide concise, constructive code review suggestions based on the diffs.",
  );
  promptParts.push("Do not approve or reject the PR.\n");

  for (const change of changes) {
    promptParts.push(`File: ${change.filename}`);
    promptParts.push(`Status: ${change.status}`);
    promptParts.push(
      `Additions: ${change.additions}, Deletions: ${change.deletions}`,
    );

    if (change.patch) {
      promptParts.push("Diff:");
      promptParts.push(change.patch);
    }

    promptParts.push("\n");
  }

  const prompt = promptParts.join("\n");

  // 🔹 MOCK RESPONSE (replace with real AI later)
  const mockReview = `
- Consider whether the new logic needs additional null or error handling.
- Check if this change affects existing edge cases.
- Naming and structure look reasonable, but readability could be improved.
`.trim();

  // For Day 3, we return mock suggestions
  return mockReview;
}