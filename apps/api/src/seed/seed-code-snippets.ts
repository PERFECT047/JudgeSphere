import { db } from "../config/database/mongodb";
import type { ICodeTemplate, ICodeSnippet } from "../modules/code-snippets/codeSnippet.interface";

/**
 * Seed script for populating built-in code snippets and default templates.
 * Run with: npx tsx src/seed/seed-code-snippets.ts
 */

const templates = db.collection<ICodeTemplate>("code_templates");
const snippets = db.collection<ICodeSnippet>("code_snippets");

const now = new Date();

// ========== DEFAULT TEMPLATES ==========

const defaultTemplates: Omit<ICodeTemplate, "_id">[] = [
  {
    language: "javascript",
    code: `// Write your solution here\n// Input is read from stdin, output to stdout\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nrl.on('line', (line) => {\n  // Process input and print output\n  console.log(line);\n  rl.close();\n});`,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    language: "typescript",
    code: `// Write your solution here\n// Input is read from stdin, output to stdout\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nrl.on('line', (line: string) => {\n  // Process input and print output\n  console.log(line);\n  rl.close();\n});`,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    language: "python",
    code: `# Write your solution here\n# Input is read from stdin, output to stdout\n\ndef solve():\n    data = input().strip()\n    # Process input here\n    print(data)\n\nif __name__ == "__main__":\n    solve()`,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    language: "java",
    code: `// Write your solution here\n// Input is read from stdin, output to stdout\n\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Read input and process here\n        while (scanner.hasNext()) {\n            String input = scanner.nextLine();\n            // Process and print result\n            System.out.println(input);\n        }\n        scanner.close();\n    }\n}`,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    language: "cpp",
    code: `// Write your solution here\n// Input is read from stdin, output to stdout\n\n#include <iostream>\n#include <string>\n#include <vector>\n#include <sstream>\nusing namespace std;\n\nint main() {\n    string line;\n    while (getline(cin, line)) {\n        // Process input and print output\n        cout << line << endl;\n    }\n    return 0;\n}`,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    language: "c",
    code: `// Write your solution here\n// Input is read from stdin, output to stdout\n\n#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char line[1000];\n    while (fgets(line, sizeof(line), stdin)) {\n        // Remove trailing newline\n        line[strcspn(line, "\\n")] = 0;\n        // Process input and print output\n        printf("%s\\n", line);\n    }\n    return 0;\n}`,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    language: "go",
    code: `// Write your solution here\n// Input is read from stdin, output to stdout\n\npackage main\n\nimport (\n    "bufio"\n    "fmt"\n    "os"\n)\n\nfunc main() {\n    scanner := bufio.NewScanner(os.Stdin)\n    for scanner.Scan() {\n        line := scanner.Text()\n        // Process input and print output\n        fmt.Println(line)\n    }\n}`,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    language: "rust",
    code: `// Write your solution here\n// Input is read from stdin, output to stdout\n\nuse std::io::{self, BufRead};\n\nfn main() {\n    let stdin = io::stdin();\n    for line in stdin.lock().lines() {\n        let line = line.unwrap();\n        // Process input and print output\n        println!("{}", line);\n    }\n}`,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  },
];

// ========== BUILT-IN SNIPPETS ==========

interface SnippetDef {
  language: string;
  prefix: string;
  body: string;
  description: string;
}

const builtInSnippets: SnippetDef[] = [
  // Java snippets
  { language: "java", prefix: "psvm", body: 'public static void main(String[] args) {\n    $1\n}', description: "Public static void main method" },
  { language: "java", prefix: "mainclass", body: 'public class Main {\n    public static void main(String[] args) {\n        $1\n    }\n}', description: "Main class with main method" },
  { language: "java", prefix: "sout", body: 'System.out.println($1);', description: "Print to stdout" },
  { language: "java", prefix: "soutf", body: 'System.out.printf("$1", $2);', description: "Formatted print" },
  { language: "java", prefix: "fori", body: 'for (int $1 = 0; $1 < $2; $1$3++) {\n    $4\n}', description: "For loop with index" },
  { language: "java", prefix: "foreach", body: 'for ($1 $2 : $3) {\n    $4\n}', description: "Enhanced for-each loop" },
  { language: "java", prefix: "while", body: 'while ($1) {\n    $2\n}', description: "While loop" },
  { language: "java", prefix: "if", body: 'if ($1) {\n    $2\n}', description: "If statement" },
  { language: "java", prefix: "ife", body: 'if ($1) {\n    $2\n} else {\n    $3\n}', description: "If-else statement" },
  { language: "java", prefix: "trycatch", body: 'try {\n    $1\n} catch ($2 $3) {\n    $4\n}', description: "Try-catch block" },
  { language: "java", prefix: "scanner", body: 'Scanner $1 = new Scanner(System.in);', description: "Create Scanner for stdin" },
  { language: "java", prefix: "array", body: '$1[] $2 = new $1[$3];', description: "Array declaration" },
  { language: "java", prefix: "arraylist", body: 'ArrayList<$1> $2 = new ArrayList<>();', description: "ArrayList declaration" },
  { language: "java", prefix: "hashmap", body: 'HashMap<$1, $2> $3 = new HashMap<>();', description: "HashMap declaration" },
  { language: "java", prefix: "hashset", body: 'HashSet<$1> $2 = new HashSet<>();', description: "HashSet declaration" },

  // Python snippets
  { language: "python", prefix: "main", body: 'if __name__ == "__main__":\n    $1', description: "Main guard" },
  { language: "python", prefix: "pr", body: 'print($1)', description: "Print to stdout" },
  { language: "python", prefix: "fori", body: 'for $1 in range($2):\n    $3', description: "For loop with range" },
  { language: "python", prefix: "fore", body: 'for $1 in $2:\n    $3', description: "For-each loop" },
  { language: "python", prefix: "while", body: 'while $1:\n    $2', description: "While loop" },
  { language: "python", prefix: "if", body: 'if $1:\n    $2', description: "If statement" },
  { language: "python", prefix: "elif", body: 'if $1:\n    $2\nelif $3:\n    $4', description: "If-elif statement" },
  { language: "python", prefix: "def", body: 'def $1($2):\n    $3\n    return $4', description: "Function definition" },
  { language: "python", prefix: "class", body: 'class $1:\n    def __init__(self, $2):\n        $3', description: "Class definition" },
  { language: "python", prefix: "try", body: 'try:\n    $1\nexcept $2 as $3:\n    $4', description: "Try-except block" },
  { language: "python", prefix: "arr", body: '[$1 for $2 in $3]', description: "List comprehension" },
  { language: "python", prefix: "inp", body: 'input().strip()', description: "Read input from stdin" },
  { language: "python", prefix: "split", body: 'input().strip().split()', description: "Read and split input" },
  { language: "python", prefix: "mapint", body: 'map(int, input().strip().split())', description: "Map to integers" },

  // JavaScript snippets
  { language: "javascript", prefix: "clg", body: 'console.log($1);', description: "Console log" },
  { language: "javascript", prefix: "fori", body: 'for (let $1 = 0; $1 < $2; $1++) {\n    $3\n}', description: "For loop" },
  { language: "javascript", prefix: "foreach", body: '$1.forEach(($2) => {\n    $3\n});', description: "Array forEach" },
  { language: "javascript", prefix: "map", body: '$1.map(($2) => $3);', description: "Array map" },
  { language: "javascript", prefix: "filter", body: '$1.filter(($2) => $3);', description: "Array filter" },
  { language: "javascript", prefix: "reduce", body: '$1.reduce(($2, $3) => $4, $5);', description: "Array reduce" },
  { language: "javascript", prefix: "arrf", body: 'const $1 = ($2) => $3;', description: "Arrow function" },
  { language: "javascript", prefix: "iff", body: 'if ($1) {\n    $2\n}', description: "If statement" },
  { language: "javascript", prefix: "ife", body: 'if ($1) {\n    $2\n} else {\n    $3\n}', description: "If-else" },
  { language: "javascript", prefix: "while", body: 'while ($1) {\n    $2\n}', description: "While loop" },
  { language: "javascript", prefix: "rl", body: 'const readline = require("readline");\nconst rl = readline.createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nrl.on("line", (line) => {\n  $1\n});', description: "Readline interface" },

  // TypeScript snippets
  { language: "typescript", prefix: "clg", body: 'console.log($1);', description: "Console log" },
  { language: "typescript", prefix: "fori", body: 'for (let $1 = 0; $1 < $2; $1++) {\n    $3\n}', description: "For loop" },
  { language: "typescript", prefix: "foreach", body: '$1.forEach(($2: $3) => {\n    $4\n});', description: "Array forEach" },
  { language: "typescript", prefix: "map", body: '$1.map(($2: $3) => $4);', description: "Array map" },
  { language: "typescript", prefix: "arrf", body: 'const $1 = ($2: $3): $4 => $5;', description: "Arrow function" },
  { language: "typescript", prefix: "iff", body: 'if ($1) {\n    $2\n}', description: "If statement" },
  { language: "typescript", prefix: "ife", body: 'if ($1) {\n    $2\n} else {\n    $3\n}', description: "If-else" },

  // C++ snippets
  { language: "cpp", prefix: "mainfn", body: 'int main() {\n    $1\n    return 0;\n}', description: "Main function" },
  { language: "cpp", prefix: "cout", body: 'std::cout << $1 << std::endl;', description: "Print to stdout" },
  { language: "cpp", prefix: "cin", body: 'std::cin >> $1;', description: "Read from stdin" },
  { language: "cpp", prefix: "fori", body: 'for (int $1 = 0; $1 < $2; $1++) {\n    $3\n}', description: "For loop" },
  { language: "cpp", prefix: "foreach", body: 'for (auto $1 : $2) {\n    $3\n}', description: "For-each loop" },
  { language: "cpp", prefix: "while", body: 'while ($1) {\n    $2\n}', description: "While loop" },
  { language: "cpp", prefix: "if", body: 'if ($1) {\n    $2\n}', description: "If statement" },
  { language: "cpp", prefix: "ife", body: 'if ($1) {\n    $2\n} else {\n    $3\n}', description: "If-else statement" },
  { language: "cpp", prefix: "vector", body: 'std::vector<$1> $2;', description: "Vector declaration" },
  { language: "cpp", prefix: "pushback", body: '$1.push_back($2);', description: "Push back to vector" },
  { language: "cpp", prefix: "sort", body: 'std::sort($1.begin(), $1.end());', description: "Sort a container" },
  { language: "cpp", prefix: "unordered_map", body: 'std::unordered_map<$1, $2> $3;', description: "Unordered map" },
  { language: "cpp", prefix: "unordered_set", body: 'std::unordered_set<$1> $2;', description: "Unordered set" },
  { language: "cpp", prefix: "string", body: 'std::string $1;', description: "String declaration" },
  { language: "cpp", prefix: "getline", body: 'std::getline(std::cin, $1);', description: "Read line" },

  // C snippets
  { language: "c", prefix: "mainfn", body: 'int main() {\n    $1\n    return 0;\n}', description: "Main function" },
  { language: "c", prefix: "printf", body: 'printf("$1", $2);', description: "Print to stdout" },
  { language: "c", prefix: "scanf", body: 'scanf("$1", $2);', description: "Read from stdin" },
  { language: "c", prefix: "fori", body: 'for (int $1 = 0; $1 < $2; $1++) {\n    $3\n}', description: "For loop" },
  { language: "c", prefix: "while", body: 'while ($1) {\n    $2\n}', description: "While loop" },
  { language: "c", prefix: "if", body: 'if ($1) {\n    $2\n}', description: "If statement" },
  { language: "c", prefix: "malloc", body: 'int* $1 = (int*)malloc($2 * sizeof(int));', description: "Memory allocation" },
  { language: "c", prefix: "fgets", body: 'fgets($1, sizeof($1), stdin);', description: "Read string from stdin" },

  // Go snippets
  { language: "go", prefix: "mainfn", body: 'func main() {\n    $1\n}', description: "Main function" },
  { language: "go", prefix: "fmtp", body: 'fmt.Println($1)', description: "Print to stdout" },
  { language: "go", prefix: "fmtf", body: 'fmt.Printf("$1", $2)', description: "Formatted print" },
  { language: "go", prefix: "fori", body: 'for $1 := 0; $1 < $2; $1++ {\n    $3\n}', description: "For loop" },
  { language: "go", prefix: "foreach", body: 'for $1 := range $2 {\n    $3\n}', description: "For-range loop" },
  { language: "go", prefix: "if", body: 'if $1 {\n    $2\n}', description: "If statement" },
  { language: "go", prefix: "ife", body: 'if $1 {\n    $2\n} else {\n    $3\n}', description: "If-else" },
  { language: "go", prefix: "slice", body: '$1 := make([]$2, $3)', description: "Create slice" },
  { language: "go", prefix: "mapgo", body: '$1 := make(map[$2]$3)', description: "Create map" },
  { language: "go", prefix: "scanner", body: 'scanner := bufio.NewScanner(os.Stdin)\nfor scanner.Scan() {\n    $1\n}', description: "Read input scanner" },
  { language: "go", prefix: "func", body: 'func $1($2) $3 {\n    $4\n    return $5\n}', description: "Function definition" },
  { language: "go", prefix: "defer", body: 'defer $1()', description: "Defer function call" },
  { language: "go", prefix: "err", body: 'if err != nil {\n    $1\n}', description: "Error check" },
  { language: "go", prefix: "struct", body: 'type $1 struct {\n    $2\n}', description: "Struct definition" },

  // Rust snippets
  { language: "rust", prefix: "mainfn", body: 'fn main() {\n    $1\n}', description: "Main function" },
  { language: "rust", prefix: "println", body: 'println!("{}", $1);', description: "Print to stdout" },
  { language: "rust", prefix: "printdbg", body: 'println!("{:?}", $1);', description: "Debug print" },
  { language: "rust", prefix: "fori", body: 'for $1 in 0..$2 {\n    $3\n}', description: "For loop" },
  { language: "rust", prefix: "foreach", body: 'for $1 in $2.iter() {\n    $3\n}', description: "Iterator loop" },
  { language: "rust", prefix: "while", body: 'while $1 {\n    $2\n}', description: "While loop" },
  { language: "rust", prefix: "if", body: 'if $1 {\n    $2\n}', description: "If statement" },
  { language: "rust", prefix: "match", body: 'match $1 {\n    $2 => $3,\n    _ => $4,\n}', description: "Match expression" },
  { language: "rust", prefix: "vec", body: 'let mut $1: Vec<$2> = Vec::new();', description: "Mutable vector" },
  { language: "rust", prefix: "hashmap", body: 'use std::collections::HashMap;\n\nlet mut $1: HashMap<$2, $3> = HashMap::new();', description: "HashMap declaration" },
  { language: "rust", prefix: "fn", body: 'fn $1($2) -> $3 {\n    $4\n    $5\n}', description: "Function definition" },
  { language: "rust", prefix: "struct", body: 'struct $1 {\n    $2: $3,\n}', description: "Struct definition" },
  { language: "rust", prefix: "impl", body: 'impl $1 {\n    fn $2(&self) -> $3 {\n        $4\n    }\n}', description: "Impl block" },
  { language: "rust", prefix: "letmut", body: 'let mut $1 = $2;', description: "Mutable variable" },
  { language: "rust", prefix: "readline", body: 'let mut $1 = String::new();\nio::stdin().read_line(&mut $1).unwrap();\nlet $1 = $1.trim();', description: "Read line input" },

  // Cross-language snippets
  { language: "all", prefix: "todo", body: '// TODO: $1', description: "TODO comment (all languages)" },
  { language: "all", prefix: "fixme", body: '// FIXME: $1', description: "FIXME comment (all languages)" },
  { language: "all", prefix: "log", body: '// LOG: $1', description: "Log comment (all languages)" },
];

async function seed() {
  console.log("🚀 Seeding code templates and snippets...\n");

  // Clear existing data
  await templates.deleteMany({});
  await snippets.deleteMany({});

  // Insert templates
  console.log(`📝 Inserting ${defaultTemplates.length} default templates...`);
  const templateResult = await templates.insertMany(defaultTemplates as any[]);
  console.log(`   ✅ Inserted ${templateResult.insertedCount} templates`);

  // Convert snippets to ICodeSnippet format
  const snippetDocuments: Omit<ICodeSnippet, "_id">[] = builtInSnippets.map((s) => ({
    language: s.language,
    prefix: s.prefix,
    body: s.body,
    description: s.description,
    isBuiltIn: true,
    createdAt: now,
    updatedAt: now,
  }));

  console.log(`📝 Inserting ${snippetDocuments.length} built-in snippets...`);
  const snippetResult = await snippets.insertMany(snippetDocuments as any[]);
  console.log(`   ✅ Inserted ${snippetResult.insertedCount} snippets`);

  // Summary by language
  const languageCounts: Record<string, number> = {};
  for (const s of builtInSnippets) {
    languageCounts[s.language] = (languageCounts[s.language] || 0) + 1;
  }

  console.log("\n📊 Summary by language:");
  for (const [lang, count] of Object.entries(languageCounts)) {
    console.log(`   ${lang.padEnd(12)} ${count} snippets`);
  }

  console.log("\n✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});