import { execSync, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { LANGUAGE_EXTENSIONS, LANGUAGE_DOCKER_IMAGES } from "./judge.interface.js";

const SANDBOX_BASE_DIR = path.join(os.tmpdir(), "judgesphere-sandbox");

/**
 * Ensure sandbox temporary directory exists
 */
function ensureSandboxDir(): void {
  if (!fs.existsSync(SANDBOX_BASE_DIR)) {
    fs.mkdirSync(SANDBOX_BASE_DIR, { recursive: true });
  }
}

/**
 * Run code inside a Docker container for a single test case.
 * Returns the raw stdout from the container.
 */
export function runCodeInContainer(
  language: string,
  code: string,
  input: string,
  timeout: number = 5
): { stdout: string; stderr: string; timedOut: boolean } {
  const extension = LANGUAGE_EXTENSIONS[language];
  if (!extension) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const imageName = LANGUAGE_DOCKER_IMAGES[language];
  if (!imageName) {
    throw new Error(`No Docker image configured for language: ${language}`);
  }

  ensureSandboxDir();

  // Create a unique temp directory for this execution
  const sessionId = `judge_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  const sessionDir = path.join(SANDBOX_BASE_DIR, sessionId);
  fs.mkdirSync(sessionDir, { recursive: true });

  const sourceFileName = `solution.${extension}`;
  const sourceFilePath = path.join(sessionDir, sourceFileName);

  try {
    // Write the source code to a file
    fs.writeFileSync(sourceFilePath, code, "utf-8");

    // Write the input to a file (for piping)
    const inputFilePath = path.join(sessionDir, "input.txt");
    fs.writeFileSync(inputFilePath, input, "utf-8");

    // Docker run command with resource limits and security
    const dockerCmd = [
      "docker",
      "run",
      "--rm", // Remove container after execution
      "--network", "none", // No network access
      "--read-only", // Read-only root filesystem
      "--memory", "256m", // Memory limit
      "--memory-swap", "256m", // No swap
      "--cpus", "0.5", // CPU limit
      "--pids-limit", "50", // Limit processes
      "--cap-drop", "ALL", // Drop all capabilities
      "--security-opt", "no-new-privileges:true",
      "--security-opt", "seccomp=unconfined",
      "-v", `${sessionDir}:/home/judge:ro`, // Mount code read-only
      "-i", // Interactive mode for stdin
      imageName,
      sourceFileName,
      timeout.toString(),
    ].join(" ");

    // Execute docker run piping the input
    const result = execSync(dockerCmd, {
      input,
      timeout: (timeout + 5) * 1000, // Give extra time for Docker startup
      maxBuffer: 10 * 1024 * 1024, // 10MB max output
      windowsHide: true,
      encoding: "utf-8",
    });

    return {
      stdout: result,
      stderr: "",
      timedOut: false,
    };
  } catch (error: any) {
    // Check if it was a timeout from execSync
    if (error.killed || error.signal === "SIGTERM" || error.code === "ETIMEOUT") {
      return {
        stdout: error.stdout || "",
        stderr: error.stderr || "",
        timedOut: true,
      };
    }

    // Other error
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || (error.message as string),
      timedOut: false,
    };
  } finally {
    // Cleanup the session directory
    try {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Verify that Docker is available and responsive
 */
export async function checkDockerHealth(): Promise<boolean> {
  try {
    execSync("docker info", {
      timeout: 5000,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a specific Docker image exists locally
 */
export function imageExists(imageName: string): boolean {
  try {
    execSync(`docker image inspect ${imageName}`, {
      timeout: 5000,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Pull a Docker image from registry
 */
export function pullImage(imageName: string): void {
  console.log(`Pulling Docker image: ${imageName}`);
  execSync(`docker pull ${imageName}`, {
    timeout: 120000, // 2 minutes
    stdio: "inherit",
  });
}

/**
 * Get disk usage by Docker system
 */
export function getDockerDiskUsage(): string {
  try {
    return execSync("docker system df", {
      timeout: 5000,
      encoding: "utf-8",
    });
  } catch {
    return "Unable to get Docker disk usage";
  }
}