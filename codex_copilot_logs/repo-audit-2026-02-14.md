# Repo Audit — 2026-02-14

## Scope
Scanned the repository for:
- `error`
- `issue`
- `problem`
- uncompleted code
- fake code / bypass logic

## Findings

### 1) Errors
1. **Broken CI workflow due unresolved merge conflict markers** in `.github/workflows/ci.yml`.
   - Impact: GitHub Actions cannot parse/run CI reliably.
   - Fix: Removed conflict block and kept one valid workflow definition.

2. **Lint pipeline masked failures** (`next lint || true`) in `ggvibe/package.json`.
   - Impact: lint errors were hidden, creating false-green checks.
   - Fix: Switched to strict lint command (`next lint`).

3. **Lint config/version mismatch** (Next.js 15 + `eslint-config-next` 16 + ESLint 9) in `ggvibe/package.json`.
   - Impact: lint crashed (`Converting circular structure to JSON`) instead of running rules.
   - Fix: Aligned to `eslint-config-next@15.5.12` and `eslint@^8.57.1`.

4. **Build blocked in restricted network env** due SWC binary fetch failure during `next build`.
   - Impact: local/CI build failed with `ENETUNREACH` and missing SWC binary.
   - Fix: Added platform package `@next/swc-linux-x64-gnu@15.5.12` as dev dependency.

### 2) Issues / Problems
1. **CI called scripts that did not exist** (`typecheck`, `test`) in old workflow branch.
   - Impact: deterministic CI failure when job runs.
   - Fix: Added `typecheck` script and updated CI job to run only scripts present (`lint`, `typecheck`, `build`).

2. **Navigation lint violations** (`<a href="/">` for internal routing) in static pages.
   - Impact: lint errors, non-idiomatic Next.js navigation.
   - Fix: migrated to `<Link href="/">` in privacy and terms pages.

### 3) Uncompleted code
- No explicit TODO/FIXME “unfinished implementation” markers were found in the core app code during scan.
- Some warnings remain (non-blocking), e.g. `<img>` optimization recommendation and unused variable warnings.

### 4) Fake code / bypass patterns
1. **`next lint || true`** was a bypass pattern that pretended success while lint was failing.
   - Fixed by removing the bypass.

## Remaining recommended fixes (not yet applied)
1. Replace `<img>` with `next/image` in `ggvibe/app/page.tsx` to improve LCP and remove warning.
2. Remove or use unused variables in:
   - `ggvibe/lib/env.ts`
   - `ggvibe/lib/schema.ts`
   - `ggvibe/lib/url/base-url.ts`
3. Optional: migrate from deprecated `next lint` command to ESLint CLI via codemod.
4. Optional: normalize npm config to remove `http-proxy` unknown env warnings in this environment.

## Validation Commands
- `npm ci` (inside `ggvibe`)
- `npm run lint`
- `npm run typecheck`
- `npm run build`

All commands above now complete successfully in this environment after fixes.
