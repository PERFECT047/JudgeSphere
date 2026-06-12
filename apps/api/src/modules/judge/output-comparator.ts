/**
 * Output Comparator
 *
 * Compares actual program output against expected output.
 * Handles edge cases like trailing whitespace, line endings, and blank lines
 * so that minor formatting differences don't cause false "Wrong Answer" results.
 */

export interface ComparisonResult {
  passed: boolean;
  expected: string;
  actual: string;
}

/**
 * Normalize output for comparison:
 * - Split into lines
 * - Trim trailing whitespace from each line
 * - Remove leading empty lines
 * - Remove trailing empty lines
 * - Join back with \n
 */
function normalizeOutput(output: string): string {
  const lines = output.split("\n");
  
  // Trim trailing whitespace from each line
  const trimmedLines = lines.map((line) => line.replace(/\s+$/, ""));
  
  // Remove leading empty lines
  let startIndex = 0;
  while (startIndex < trimmedLines.length && trimmedLines[startIndex] === "") {
    startIndex++;
  }
  
  // Remove trailing empty lines
  let endIndex = trimmedLines.length - 1;
  while (endIndex >= startIndex && trimmedLines[endIndex] === "") {
    endIndex--;
  }
  
  // Slice to the meaningful content
  const meaningfulLines = trimmedLines.slice(startIndex, endIndex + 1);
  
  return meaningfulLines.join("\n");
}

/**
 * Exact comparison with normalization.
 * This is the standard mode for online judges.
 * Both expected and actual outputs are normalized before comparison.
 */
export function compareOutput(
  expectedOutput: string,
  actualOutput: string
): ComparisonResult {
  const normalizedExpected = normalizeOutput(expectedOutput);
  const normalizedActual = normalizeOutput(actualOutput);

  const passed = normalizedExpected === normalizedActual;

  return {
    passed,
    expected: normalizedExpected,
    actual: normalizedActual,
  };
}

/**
 * Strict comparison (no normalization at all).
 * Use this for problem types where formatting matters precisely.
 */
export function compareOutputStrict(
  expectedOutput: string,
  expected: string,
  actual: string
): ComparisonResult {
  return {
    passed: expected === actual,
    expected,
    actual,
  };
}

/**
 * Token-based comparison (order-insensitive).
 * Useful for problems where the output is a set of values where order doesn't matter.
 */
export function compareOutputTokenized(
  expectedOutput: string,
  actualOutput: string
): ComparisonResult {
  const normalize = (s: string) =>
    s
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0)
      .sort()
      .join(" ");

  const normalizedExpected = normalize(expectedOutput);
  const normalizedActual = normalize(actualOutput);

  return {
    passed: normalizedExpected === normalizedActual,
    expected: expectedOutput.trim(),
    actual: actualOutput.trim(),
  };
}

export default compareOutput;