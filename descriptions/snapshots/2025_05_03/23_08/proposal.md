Goal: Refactor viscera/src for better structure by separating concerns and replacing local utility functions with dependencies sourced directly from specified GitHub repositories (pinned to specific versions).

Key Changes:

Externalize Utilities:
Remove the local utility files:
viscera/src/findWorkspaceRoot.js
viscera/src/getPackageJSONasObj.js
viscera/src/getPackageName.js
viscera/src/getWorkspaceURIs.js
Add dependencies to viscera/package.json pointing to your GitHub utility repositories, pinned to specific commit hashes or tags (e.g., "util-find-workspace": "github:your-username/repo1#commit-hash-1"). Requires specific repo URLs/hashes from you.
Run npm install in viscera/ to install these dependencies.
Update viscera/src/profileImport.js to import these utility functions from the newly installed packages in node_modules instead of local files.
Separate Global State:
Create a new file: viscera/src/cumulativeTime.js.
Move the global state variables (cumulativeImportTimeNs, exitHookRegistered) and related functions (logCumulativeTime, registerExitHook) from viscera/src/profileImport.js into viscera/src/cumulativeTime.js. Export necessary functions (e.g., addImportTime, registerExitHook).
Update viscera/src/profileImport.js to import and use the functions from ./cumulativeTime.js to track cumulative time.
Introduce Explicit Entry Point:
Create a new file: viscera/src/index.js.
Make viscera/src/index.js simply import profileImport from ./profileImport.js and re-export it (e.g., export { default } from './profileImport.js'; or similar depending on export style).
Modify viscera/package.json to set the main field (or update exports if using that) to point to "src/index.js".
Maintain Core Logic Files:
viscera/src/profileImport.js: Retains the core logic for orchestrating the import profiling, but now imports utilities from installed packages and global state functions from cumulativeTime.js.
viscera/src/ImportProfiler.js: Remains unchanged, handling the logic for individual import profiling instances.
Summary for Commit Message:

CopyInsert
refactor(src): improve structure and externalize utils

- Restructure `viscera/src` for better separation of concerns.
- Externalize utility functions (workspace root, package utils) by adding direct GitHub dependencies pinned to specific commits/tags in package.json.
- Remove local copies of utility files.
- Move global cumulative time tracking logic to a dedicated `cumulativeTime.js` module.
- Introduce `src/index.js` as the explicit package entry point, re-exporting `profileImport`.
- Update `profileImport.js` to use external utility packages and the new `cumulativeTime` module.
- Update `package.json` main entry point.
This summary captures the essence of the changes: externalizing dependencies, separating global state, and creating a clear entry point for better code organization.

Ready to proceed? I'll need the details for the GitHub dependencies (repo URLs and commit hashes/tags) to modify the package.json correctly.
