# Debugging Journey: `profileImport` Tests

**Summary:**
This debugging journal documents the challenges and strategies used while testing `profileImport`, a dynamic import wrapper in a monorepo ESM environment. It addresses Jest’s ESM mocking limitations, dynamic import interception, and the use of dependency injection to enable testability.

---

## 🔧 Main Issues Faced

### ❌ TypeError in Workspace Tests

* **Problem**: Tests involving `@ktr-srt/` workspace paths failed with:

  > `TypeError: The "path" argument must be of type string. Received undefined.`
* **Cause**: `getWorkspaceURIs()` called `findWorkspaceRoot()` which unexpectedly returned `undefined` during the test.

### ❌ `Cannot find module` Errors

* **Problem**: After fixing the above, the `dynamic import(resolvedPath)` in `profileImport` failed to locate mocked modules like:

  * `/path/to/caller/module.js`
  * `/path/to/another.js`
  * `/path/to/workspace/pkg`
* **Cause**: Jest was not able to mock or intercept the dynamic import behavior properly within the already-loaded module.

---

## ✅ Solutions Implemented

### 🔧 Fixing the TypeError

* **Approach**: Dynamically imported the module under test (`profileImport`) inside a `beforeAll` block in `profileImport.test.js`.
* **Why it worked**: Ensured all mocks (e.g., `jest.unstable_mockModule`) were registered before the module and its dependencies were loaded.

### 🔧 Fixing `Cannot find module`

* **Approach**: Modified `profileImport.js` to accept an optional third argument `_importer`, defaulting to the native `import()`.
* In tests, passed a `mockImporter` created using `jest.fn()` to return mocked modules.
* **Why it worked**: This **dependency injection** bypassed the limitations of mocking `import()` globally and gave precise control in tests.

---

## 🧠 Hypotheses for Root Causes

### 🧪 Mock Timing with ESM

* Static imports in the test file likely executed before mocks were registered.
* This caused real, unmocked functions (e.g., `findWorkspaceRoot`) to be executed with incomplete mocks.

### 🧪 Mocking Dynamic `import()`

* Neither `jest.unstable_mockModule({ virtual: true })` nor `jest.spyOn(global, 'import')` could reliably intercept internal dynamic imports.
* The `import()` function used internally by `profileImport` was out of reach for global mocking.
* Unlike standard function mocks, `import()` is a language-level feature, and its resolution context is tightly coupled to the surrounding module. Jest can't reliably intercept or replace it once a module has already been evaluated.

---

## 🔁 Common Themes and Patterns

### 📦 ESM Mocking Challenges

* Mocking in ESM requires defining mocks **before** importing the test subject.
* `jest.unstable_mockModule` is effective, but requires precise setup order.

### 🔁 Dynamic Import of Test Subject

* Dynamically `import()`-ing the module under test ensures mocks are ready and applied correctly.

### 💡 Dependency Injection for Testability

* Refactoring to accept a dependency (like `_importer`) is often cleaner and more reliable than trying to intercept built-in globals.

### 🔄 Iterative Refinement

* The process involved:

  * Trying different mocking approaches
  * Forming hypotheses from failures
  * Applying minimal, targeted fixes
  * Resulting in a reliable and testable profiling utility

---

## 📘 Lessons Learned

* Always define `jest.unstable_mockModule` mocks **before** importing the test subject in ESM.
* Use `beforeAll` + `await import()` to defer module loading until mocks are applied.
* Mocking `import()` directly is brittle — use **dependency injection** instead.
* Codemod and profiling utilities should be designed for **testability** from the start.

---

This journey highlighted the complexity of testing ESM modules with dynamic behavior and demonstrated robust practices for mock timing, dependency injection, and codemod testability.
