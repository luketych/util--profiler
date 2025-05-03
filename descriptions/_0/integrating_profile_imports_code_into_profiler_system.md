Integrating profileImport and ImportProfiler into the Profiler System

Purpose

The existing profileImport.js and ImportProfiler.js modules provide a solid foundation for timing dynamic imports in a Node.js (ESM) codebase. These modules can be integrated into a broader profiling system that automates logging and performance tracking using codemods and runtime instrumentation.

Components

ImportProfiler.js

Tracks start time and total import durations

Logs import times with color-coded formatting via the debug package

Supports multiple imports per file using an internal Map

Useful for summarizing import bottlenecks during development

profileImport.js

Dynamically wraps and times import() statements

Supports:

Relative paths (e.g., ./module.js)

Scoped packages (e.g., @ktr-srt/foo)

Resolving from workspace roots using getPackageName and getWorkspaceURIs

Can automatically extract and log the calling file's path

How This Fits Into the Profiler System

✅ Use Case 1: Manual Runtime Profiling

Replace direct dynamic imports with:

const module = await profileImport('./myModule.js', import.meta.url)

This logs import duration with contextual file metadata. Ideal for debugging startup performance or lazy-loaded modules.

✅ Use Case 2: Automated Codemod Instrumentation

Codemods can wrap all import() calls with profileImport():

// Original:
const data = await import('./data.js')

// Transformed:
const data = await profileImport('./data.js', import.meta.url)

This enables automatic profiling of dynamic imports across a codebase.

✅ Use Case 3: Performance Logging Per File

Pair with codemods that inject:

import ImportProfiler from './profiler/ImportProfiler.js'
const profiler = new ImportProfiler(import.meta.url, 'src/myModule.js')

Then use profiler.trackImport() around key imports and profiler.summarize() to emit final stats.

Advantages

Built on native ESM features (import.meta.url, import())

Monorepo-aware (via getWorkspaceURIs)

Debug-only by default (DEBUG=app:profiler:*)

Decouples profiling from logging implementation (can later swap debug for pino, etc.)

Future Extensions

Add environment flag to disable/enable profiling (process.env.PROFILING)

Export JSON of all import timings

Support caching results per module

Integrate with performance.mark() or trace events

Summary

This code should be adopted as the runtime engine for your profiler system. It enables high-resolution, contextual timing of module imports and integrates cleanly with codemod-driven automation for profiling every file or just select targets.


