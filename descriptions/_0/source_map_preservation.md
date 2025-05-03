Combining jscodeshift and Babel for Codemods with Source Map Support

When instrumenting a JavaScript codebase for profiling (e.g., to log import times or execution entry/exit), we want:

Readable, diff-friendly code after transformation

Accurate source maps to enable reliable debugging

Easy reversibility (tagged code that can be cleaned up)

However, no single tool excels at all three. This plan outlines how to use jscodeshift and Babel together to maximize the strengths of each.

Tool Strengths

Feature

jscodeshift

Babel

Readable diff output

✅ Yes

❌ Often compressed

Preserves formatting

✅ (via recast)

❌ Minimal formatting

Source map support

❌ None

✅ Full support via generator

Large-scale transforms

✅ Excellent

⚠️ More complex for bulk work

Reversibility

✅ Easy with tags

❌ Not designed for tagging

Strategy: Best of Both Worlds

🔁 Workflow:

Original Source
     ↓
 [1] jscodeshift (adds profiling logs, readable)
     ↓
 [2] Babel (regenerates source maps)
     ↓
 Final Output with accurate logs + source maps

Step-by-Step Integration

✅ Step 1: Transform with jscodeshift

Use codemods to insert log.enter(), log.exit(), or profileImport() calls. Tag inserted lines with // @auto-log so they can be reversed.

✅ Step 2: Parse with Babel

Write a small Node.js script to regenerate source maps after codemod transformation:

const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;

const transformedCode = fs.readFileSync('file.js', 'utf-8');
const ast = parse(transformedCode, { sourceType: 'module' });
const { code, map } = generate(ast, { sourceMaps: true }, transformedCode);

fs.writeFileSync('file.output.js', code);
fs.writeFileSync('file.output.js.map', JSON.stringify(map));

✅ Optional: Run Babel only where needed

If performance or formatting is a concern, run Babel only on files where debugging is critical (e.g., test files, unstable modules).

Why Not Use Babel Alone?

Babel plugins are harder to write than jscodeshift codemods

Babel strips whitespace and often flattens or renames structures

jscodeshift + recast maintains better formatting and human readability

Future Enhancements

Build a CLI tool that:

Runs jscodeshift

Pipes output through Babel

Stores source maps

Integrate this into a GitHub Actions profiling pipeline

Add a PROFILING=1 runtime flag to toggle behavior

Summary

By combining jscodeshift (for powerful, readable transforms) with Babel (for source map generation), we can build a robust profiling system that:

Injects logs cleanly

Supports accurate stack traces

Can be reversed easily

This hybrid approach lets us profile with confidence, without sacrificing debug-ability or maintainability.


