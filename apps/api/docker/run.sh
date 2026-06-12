#!/bin/bash
# run.sh - Universal entrypoint for code execution inside Docker containers
# Arguments: [filename] [timeout_seconds]
# STDIN: test case input
# STDOUT: program output
# STDERR: compilation errors / runtime errors

FILENAME="$1"
TIMEOUT="${2:-5}"  # default 5 seconds timeout

if [ -z "$FILENAME" ]; then
    echo "ERROR: No filename provided"
    exit 1
fi

EXTENSION="${FILENAME##*.}"
BASENAME="${FILENAME%.*}"

# Create a temporary working directory
WORKDIR=$(mktemp -d /tmp/judge_XXXXXX)
trap 'rm -rf "$WORKDIR"' EXIT

# Copy source file to working directory
cp "$FILENAME" "$WORKDIR/"
cd "$WORKDIR"

# Determine language and execute
case "$EXTENSION" in
    c)
        # C - compile with gcc
        gcc -O2 -Wall -lm -o "$BASENAME" "$FILENAME" 2>"$WORKDIR/compile_error.txt" || {
            echo "COMPILATION_ERROR"
            cat "$WORKDIR/compile_error.txt"
            exit 0
        }
        timeout "$TIMEOUT" ./"$BASENAME"
        EXIT_CODE=$?
        ;;
    cpp)
        # C++ - compile with g++
        g++ -O2 -Wall -std=c++17 -o "$BASENAME" "$FILENAME" 2>"$WORKDIR/compile_error.txt" || {
            echo "COMPILATION_ERROR"
            cat "$WORKDIR/compile_error.txt"
            exit 0
        }
        timeout "$TIMEOUT" ./"$BASENAME"
        EXIT_CODE=$?
        ;;
    java)
        # Java - compile and run
        javac "$FILENAME" 2>"$WORKDIR/compile_error.txt" || {
            echo "COMPILATION_ERROR"
            cat "$WORKDIR/compile_error.txt"
            exit 0
        }
        timeout "$TIMEOUT" java "$BASENAME"
        EXIT_CODE=$?
        ;;
    py)
        # Python
        timeout "$TIMEOUT" python3 "$FILENAME"
        EXIT_CODE=$?
        ;;
    js)
        # JavaScript (Node.js)
        timeout "$TIMEOUT" node "$FILENAME"
        EXIT_CODE=$?
        ;;
    ts)
        # TypeScript - compile to JS then run
        npx tsc --outDir /tmp/ts_output --strict --target ES2020 --module commonjs "$FILENAME" 2>"$WORKDIR/compile_error.txt" || {
            echo "COMPILATION_ERROR"
            cat "$WORKDIR/compile_error.txt"
            exit 0
        }
        timeout "$TIMEOUT" node "/tmp/ts_output/${BASENAME}.js"
        EXIT_CODE=$?
        ;;
    go)
        # Go - compile and run
        go build -o "$BASENAME" "$FILENAME" 2>"$WORKDIR/compile_error.txt" || {
            echo "COMPILATION_ERROR"
            cat "$WORKDIR/compile_error.txt"
            exit 0
        }
        timeout "$TIMEOUT" ./"$BASENAME"
        EXIT_CODE=$?
        ;;
    rs)
        # Rust - compile and run
        rustc -O -o "$BASENAME" "$FILENAME" 2>"$WORKDIR/compile_error.txt" || {
            echo "COMPILATION_ERROR"
            cat "$WORKDIR/compile_error.txt"
            exit 0
        }
        timeout "$TIMEOUT" ./"$BASENAME"
        EXIT_CODE=$?
        ;;
    *)
        echo "ERROR: Unsupported file extension: $EXTENSION"
        exit 1
        ;;
esac

# Check for timeout or runtime error
if [ $EXIT_CODE -eq 124 ]; then
    echo "TIME_LIMIT_EXCEEDED"
elif [ $EXIT_CODE -ne 0 ]; then
    echo "RUNTIME_ERROR (exit code: $EXIT_CODE)"
fi

exit 0