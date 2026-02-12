# CI Troubleshooting (GitHub Actions Policy)

## Symptom
Workflow fails with:

> `actions/checkout@v4 and actions/setup-node@v4 are not allowed... all actions must be from a repository owned by my-tiktok`

## Chosen fix path (PATH 1, preferred)
Keep official GitHub-maintained actions and allow them in org/repo settings.

## Out-of-repo settings to apply

### Option A: Repository-level allowlist
1. Open GitHub repo: `my-tiktok/GGVIBE-LIVE-AI-ORG`.
2. Go to **Settings → Actions → General**.
3. Under **Actions permissions** set one of:
   - **Allow all actions and reusable workflows**, or
   - **Allow select actions and reusable workflows** and add:
     - `actions/checkout@v4`
     - `actions/setup-node@v4`
4. Save.

### Option B: Organization-level policy (recommended for consistency)
1. Open GitHub org: `my-tiktok`.
2. Go to **Settings → Actions → General**.
3. In **Policies**, allow GitHub-owned actions and reusable workflows (or explicitly allowlist the two actions above).
4. Ensure repository policy does not override/block this setting.

## Why PATH 1
- Smallest surface area and least maintenance.
- Uses official, security-reviewed actions.
- Avoids vendoring/mirroring action code and version drift risks.

## If your org requires PATH 2 (mirror actions)
Create an internal actions mirror repository and pin immutable refs there; this repo currently does **not** implement PATH 2.

## If local environment has no `origin` remote
Use this exact flow to publish the prepared branch:

```bash
git remote add origin git@github.com:my-tiktok/GGVIBE-LIVE-AI-ORG.git
# or HTTPS:
# git remote add origin https://github.com/my-tiktok/GGVIBE-LIVE-AI-ORG.git

git fetch origin
git checkout -B codex/final-repo-stabilization
git push -u origin codex/final-repo-stabilization
```

Then open a PR from `codex/final-repo-stabilization` into `main`.

If credentials are not available in the current environment, generate a patch bundle and apply it in a credentialed environment:

```bash
git format-patch -1 --stdout > codex-final-repo-stabilization.patch
# On a machine with GitHub credentials:
git checkout -b codex/final-repo-stabilization origin/main
git am < codex-final-repo-stabilization.patch
git push -u origin codex/final-repo-stabilization
```
