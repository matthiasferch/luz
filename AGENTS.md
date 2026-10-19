# Workspace Guidelines

## Scope

These guidelines apply throughout the workspace. The `packages/AGENTS.md` file adds
engine-specific architecture, testing, and asset rules. For now, the naming and
comment rules below apply to TypeScript, JavaScript, CommonJS, ECMAScript modules,
and GLSL. Vue script blocks follow these rules as well. Python uses its separate Ruff configuration.

Math follows the same naming and comment rules. Preserve native typed-array APIs
such as `from`, `of`, `set`, and `Symbol.species`, and conventional component and
swizzle names such as `x`, `xyz`, and `rgba`.

## Naming and comments

- Name functions, methods, and function-valued variables with verb phrases that
  describe their action. Use predicate prefixes such as `is`, `has`, `can`, or
  `should`, and action prefixes such as `get`, `calculate`, `create`, or `update`.
  Event handlers are an exception: use the `on` prefix, such as `onChange`,
  instead of `handleChange` or another verb phrase. Conversion names beginning
  with `to` also count as verb phrases. Decorator factories and externally
  mandated entry points such as GLSL `main` are exempt.
- Limit every class and interface name to at most two conceptual nouns. Use
  adjectives or move context into the module or namespace instead of stacking
  more nouns into the type name. Official technology and platform qualifiers,
  such as `WebGL2`, do not count toward this limit.
- Spell out words in identifiers, including local variables and constants. Do
  not introduce shortened forms such as `max`, `min`, `config`, `env`, `tex`, or
  `tmp` or `fps`. `gl` and `id` are accepted conventional exceptions. Preserve official
  external APIs, names, and formats such as WebGL, GLSL, JSON, URL, KTX, RGB,
  and protocol-defined shader symbols.
- Use conventional single-character names for color and vector components and
  coordinate indices: `x`, `y`, `z`, `w`, `r`, `g`, `b`, `a`, and `u`, `v` for
  texture coordinates. These are exceptions to the spelled-out noun-phrase
  rules; color-channel masks may also use `r`, `g`, `b`, `a` instead of Boolean
  predicate names. Keep descriptive names for entire vectors and colors.
- Name variables and parameters with concrete noun phrases. Do not use bare
  adjectives or ordinals such as `closest`, `current`, or `first`; identify the
  thing being described, such as `closestContact`, `currentFrame`, or
  `firstCollider`. Name counts for what they count, such as `culledBodyCount`.
  Name Boolean values as predicates such as `isVisible` or
  `hasFocus`. Apply these rules to luz-owned serialized fields and shader
  variables, including uniform names. Migrate changed contracts together with
  their readers, writers, schemas, and first-party assets. Preserve externally
  defined API names, Blender properties, and GLSL built-ins.
- Keep names concise by omitting context already clear from the owning type or
  module. Prefer state predicates such as `isAmbientOcclusionVisualized` and
  `isSubsurfaceLightingEnabled` for flags. Avoid starting variable, parameter,
  and property names with `should`; prefer `is…Enabled` or `are…Enabled` for
  feature flags and other direct state predicates where appropriate. Do not add
  words merely to lengthen a name.
- Enforce Boolean naming for variables, parameters, declared properties, and
  accessors in ESLint, and for shader declarations during shader validation.
  Keep regression coverage for these checks and the documented exceptions.
- Use lower camel case for luz-owned string constants, including type
  discriminators and enum-like values. Migrate their readers, writers, schemas, and
  first-party assets together. Preserve display labels, authored names, and
  externally defined values such as Blender socket names and protocol identifiers.
- Keep comments to the absolute minimum. Add a comment only when the code cannot
  express an important reason, invariant, compatibility constraint, or
  non-obvious mathematical choice. Do not narrate operations, add decorative
  section labels, retain commented-out code, or use comments in place of clearer
  names and structure. Precede every comment block with an empty line unless it
  begins on the first line of a file or code block.

Write the project name `luz` in lowercase in prose, UI text, logs, and comments.
Preserve uppercase protocol and tooling identifiers such as the `LUZG` binary
magic and `LUZ_*` environment variables.

Shared naming checks live in `tooling/eslint/config/naming.cjs`. Type-aware Boolean prefix checks
run on all TypeScript, including `packages/math`; JavaScript, CommonJS, and ECMAScript
modules use the checks that do not require type information. Vue script blocks enable the same naming checks. The prose naming and comment rules above
remain review requirements even where lint does not enforce them. Preserve the
configured external exceptions, including `depthMask` and build-defined globals.

## Serialized contracts and compatibility

Use interfaces for object contracts and type aliases for unions, tuples, callable
signatures, mapped types, and compositions. Use classes when runtime behavior,
initialization, identity, inheritance, decorators, or registration require them.
Shared TypeScript rules in `tooling/eslint/config/types.cjs` enforce object interfaces and
type-only imports/exports. Keep value imports needed by decorator metadata;
ambient declarations may use inline import type annotations. Engine packages
reject explicit `any`; validate `unknown` at external boundaries instead. Vue
script blocks use the same type-style checks.

Keep serialized fields and shader variables aligned with runtime API names, such
as `isContinuousCollisionEnabled`, `areMipmapsEnabled`, `textureCoordinates`, and
`isAmbientOcclusionVisualized`. Current exports use these names without aliases
for the previous names. Re-export external scenes and models with the current
Blender extension when updating older assets. Saved editor preferences under
renamed fields return to their defaults.

Keep string values consistent across runtime APIs, serialized type discriminators,
material graph node types, render stages, and schemas. Examples include `loop`,
`once`, `model`, `triangles`, and `lessEqual`. Repository assets already use the
current values; re-export external assets that still use capitalized values.
Preserve the spelling of display labels, authored names, Blender socket names and
properties, and protocol identifiers.

## Braces and statement spacing

Separate the import block, including CommonJS require declarations, from the
following code with an empty line. Also separate adjacent function implementations,
including class methods, object methods and function-valued declarations, with an
empty line. Enforce this with
`luz/implementation-padding`.

Always use braces around control-flow bodies, including single statements and
empty bodies after `if`, `else`, `for`, `while`, and `do`. Keep normal `else if`
chains. Concise arrow-function expressions are not control-flow bodies.

Require an empty line before `if`, `for` (including `for…in` and `for…of`),
`while`, `switch`, `try`, and `return` when another statement precedes it in the
same block. Do not add padding at the start of a block, between a condition and
its body, before `else`/`catch`/`finally`, or before the trailing
`while` in a `do…while` statement. A comment does not count as an empty line;
padding may appear before a leading comment attached to the statement.

Require an empty line before each standalone `await` statement when another
sibling statement precedes it, including consecutive awaits. Do not add padding
at the start of a file, block, or switch case, or split awaits from surrounding
assignments, declarations, returns, or other expressions. Await spacing takes
precedence over removing blank lines within a call group. Enforce this with the
autofixable `luz/await-padding` rule.

Also require an empty line after a complete `if`/`else`, `for`, `while`,
`do…while`, `switch`, or `try`/`catch`/`finally` statement when another statement
follows in the same block. Do not separate the branches of one statement or add
padding before the enclosing block's closing brace.

Separate groups of declarations from surrounding statements with an empty line.
Consecutive `const` declarations can stay together, as can consecutive `let` or
`var` declarations; switching declaration kinds requires an empty line. Preserve
intentional blank lines within a group. GLSL follows the same rule for typed
variable declarations, constants, uniforms, and input/output declarations.
Loop-header declarations do not introduce padding inside the loop header.

Separate consecutive assignment statements from consecutive standalone function
calls with an empty line in either direction. Compound assignments and
increments/decrements belong to the assignment group. Awaited, optional,
constructor, and tagged-template calls belong to the call group. An assignment
such as `value = calculate()` remains an assignment. Remove blank lines between
consecutive assignments or between consecutive calls when no comment separates
them. Preserve spacing around intervening comments and shader preprocessor
directives. This removal does not apply to declaration groups. Apply this rule
only between sibling statements, not inside expressions or loop headers.

Group adjacent class fields by visibility, `static`, and `readonly` modifiers.
Remove blank lines within each group and require an empty line when any of those
modifiers changes. Implicit and explicit `public` fields share a group; both
`private` and `#` fields have private visibility. Preserve field order,
initializer order, and spacing around intervening comments. Keep decorators
attached to their fields. Methods, accessors, and other non-field members end a
field group; this rule does not change spacing around those members. Decorator
spacing takes precedence over removing blank lines within a field group.

Require an empty line before a decorated declaration or class member when
another sibling precedes it, and after a decorated property when another class
member follows it. This includes decorated fields and auto-accessor properties.
Keep stacked decorators together and attached to their declaration. Do not add
padding at the start of a file, block, or class, before a class's closing brace,
or inside expressions and parameter lists. An attached leading comment may
follow the empty line; blank lines inside comments do not count as padding.
Enforce this with the autofixable `luz/decorator-padding` rule.

These layout rules apply to TypeScript, JavaScript, CommonJS, ECMAScript modules,
Vue script blocks, and GLSL, including math code. The naming and comment
exceptions above remain unchanged. Python is excluded.

Keep shared engine and editor layout rules in `tooling/eslint/config/layout.cjs`, with custom
rules in the local `tooling/eslint` plugin. The root `.eslintrc.cjs` and
`apps/editor/.eslintrc.cjs` configure parsers, scope, and shared rule imports. Run
`npm run lint:fix` to apply the JavaScript/TypeScript/Vue brace and spacing fixes,
and `npm run validate:shaders` to check shader layout as well as compilation.
Prettier preserves this spacing; ESLint and shader validation enforce it in CI.

Python follows the Ruff configuration in `pyproject.toml`. `npm run format` and
`npm run format:check` include Ruff formatting for `integrations/blender`;
`npm run lint:python` runs Ruff checks and Python bytecode compilation there.

`npm run lint` also runs Stylelint on CSS and Vue styles, HTML Validate on HTML,
actionlint with ShellCheck on workflows, and PSScriptAnalyzer on PowerShell.
Keep tool downloads pinned and cached outside tracked source. Coverage regression
tests verify that all repository JavaScript, TypeScript, and Vue files are included
in the ESLint commands, including configuration files and ambient declarations.

## Unused bindings

Reject unused variables, imports, functions, parameters, and catch bindings in
TypeScript, JavaScript, CommonJS, ECMAScript modules, and Vue scripts, including
math code. Use the shared `tooling/eslint/config/unused.cjs` configuration and
`@typescript-eslint/no-unused-vars`; disable the base `no-unused-vars` rule to
avoid duplicate or incorrect TypeScript diagnostics. Do not exempt local
variables or catch bindings merely because their names start with `_`.

Prefix intentionally unused parameters with `_` when a callback position or
public/overridden signature requires them. Remove unnecessary bindings while
preserving side effects and public signatures; use `catch {}` when the caught
error is not needed. Vue bindings used by the template count as used.

## Repository hygiene

Preserve unrelated working-tree changes and user-authored assets. Never commit
BlendKit or Poliigon content. Do not commit generated dependency, build, cache,
coverage, or temporary diagnostic output.
