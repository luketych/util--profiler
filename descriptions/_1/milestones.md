{{ ... }}

## Milestone 1: Setup & Foundation
*   Set up project structure (codemods, tests, fixtures, runtime profiler code).
*   Install dependencies (`jscodeshift`, `debug`, testing tools).
*   Integrate `ImportProfiler.js`, `profileImport.js` (assuming they exist or need to be created/copied).
*   Basic unit tests for the runtime profiler code.

## Milestone 2: Core Codemod Development (Dynamic Imports)
*   Develop `inject-logs` codemod to wrap dynamic `import()` with `profileImport()`.
*   Develop `remove-logs` codemod to reverse the injection.
*   Implement logging markers (e.g., `// @auto-profile-import`).
*   Create test fixtures and write codemod tests (input/output, round-trip).

## Milestone 3: Edge Case Handling & Robustness
*   Expand tests for edge cases (path types, syntax variations).
*   Refine codemods to handle these cases.
*   Investigate and address source map handling.

## Milestone 4: Workflow & Integration
*   Create simple CLI scripts (`npm run profile:inject`/`npm run profile:remove`).
*   Document and test the branch-based workflow.
*   Test end-to-end on a sample project.

## Milestone 5: Documentation & Refinement
*   Write user documentation (setup, usage, workflow).
*   Document limitations.
*   Refine logging output.