Profiler Codemod Testing & Integration Strategy
Objective
Build confidence and safety around codemods that inject and remove import profiling code using jscodeshift.

Goals
* Inject logging to top of files and functions
* Mark inserted logs for easy removal
* Use centralized logging API
* Ensure transform is safe, idempotent, and reversible

Why jscodeshift?
✅ AST-based = safe, structured transformations ✅ Supports batch automation across files ✅ Reversible if we tag changes (e.g., // @auto-log) ❌ Static-only; doesn’t understand runtime behavior ❌ Can break if edge cases aren’t handled (e.g., arrow functions without braces)

Recommended Workflow
1. Create a profile/<feature> branch
2. Run inject-logs.js codemod
3. Run benchmarks/tests
4. Run remove-logs.js to clean
5. Optionally merge insights or discard branch

Testing Plan
✅ Unit Tests (AST-level)
* Function declarations
* Function expressions
* Arrow functions
* Object & class methods
✅ Edge Cases
* One-liner arrow functions (wrap with braces or skip)
* Anonymous functions (fallback name like anonFunc)
* Already-logged functions (skip)
* No functions in file (noop)
* Existing log import (don’t duplicate)
✅ Integration Tests
* Run codemod on fixture files
* Confirm inserted logs match expected output
* Ensure cleanup works via remove-logs.js
✅ Behavioral Tests
* Run transformed files with DEBUG=app:profiler:*
* Confirm logs output properly
* Ensure nothing logs when disabled
✅ Round-Trip Test
* Inject logs, then remove logs
* Diff the result against original file (should be identical)

Existing Code
* Use existing code in archive/ folder

Known Unknowns
* Nested anonymous functions
* Files with mixed TS/JSX
* Source maps post-transform

Tooling
* Use jest or vitest with input/output snapshots
* Consider jscodeshift-test-utils for quick codemod test harness

Summary
Codemod profiling is safe and powerful if we:
* Tag inserted logs
* Contain the change in branches
* Test edge cases & diff results
Ready for implementation with minimal risk.

