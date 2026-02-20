# Production Guardrails

## Branch Protection Rules for `main`

- **Require a pull request before merging:** All changes must be made through a pull request.
- **Require status checks to pass before merging:** All CI checks must pass before a pull request can be merged.
- **Require branches to be up to date before merging:** This ensures that the branch is up to date with the base branch.
- **Include administrators:** Enforce all configured restrictions for administrators.
