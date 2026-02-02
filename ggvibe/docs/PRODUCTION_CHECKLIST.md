# Production Deployment Checklist

## Pre-Deployment

### 1. Environment Variables
Verify all required secrets are set:

```bash
# Required
SESSION_SECRET     # Min 32 chars, used for cookie encryption
DATABASE_URL       # PostgreSQL connection string
REPL_ID           # Replit project ID (auto-provided)
```

### 2. Database
```bash
cd ggvibe
npm run db:push   # Sync schema to database
```

### 3. Build Verification
```bash
cd ggvibe
npm ci            # Clean install from lockfile
npm run build     # Verify production build passes
npm run start     # Test production server starts
```

### 4. Health Check
```bash
curl http://localhost:5000/api/auth/health
# Expected: {"status":"healthy","checks":{...}}
```

## Deployment Steps (Replit)

1. Click **Publish** button in Replit
2. Select **Autoscale** deployment type
3. Verify build command: `cd ggvibe && npm ci && npm run build`
4. Verify run command: `cd ggvibe && npm run start`
5. Click **Publish**

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://ggvibe-chatgpt-ai.org/api/auth/health
```

### 2. OAuth Flow
1. Visit https://ggvibe-chatgpt-ai.org
2. Click "Sign In"
3. Verify redirect to Replit OAuth
4. Complete authentication
5. Verify redirect back to app with session

### 3. Security Headers
```bash
curl -I https://ggvibe-chatgpt-ai.org/ | grep -E "^(x-|referrer)"
# Expected:
# x-content-type-options: nosniff
# x-frame-options: SAMEORIGIN
# referrer-policy: strict-origin-when-cross-origin
```

## Rollback

If issues occur:
1. Use Replit's **Checkpoints** feature to revert
2. Or redeploy previous working commit
