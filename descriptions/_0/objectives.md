Investigate whether using jscodeshift library would be a good choice for modifying a codebase in order to profile it.

What are the strengths, weaknesses, risks, etc?


What is the flow? Should we have a separate branch for profiling? Then we can simply add code to the codebase in order to profile it? And not worry as much about undoing everything we add?

Or should we make it obvious what code was added by the profiler, so that it can easily be removed?
