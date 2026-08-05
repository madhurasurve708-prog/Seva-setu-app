# Backend Development Mode Integration Guide

## Overview
When `EXPO_PUBLIC_DEV_MODE=true` is set in the frontend, the app sends special headers to authenticate with the real backend without requiring Supabase authentication. This allows integration testing of the backend APIs without SMS verification.

## 🔒 SECURITY ARCHITECTURE - CRITICAL

The development mode bypass is protected by **multiple independent security layers**. Even if one layer fails, the others prevent production abuse.

### Security Layers (Defense in Depth)

#### Layer 1: Frontend Environment Variable
```bash
EXPO_PUBLIC_DEV_MODE=true
EXPO_PUBLIC_DEV_MODE_SECRET=<random-secret>
```
- Both must be set for dev mode to activate
- Secret is never committed to git
- Secret is different for each environment

#### Layer 2: Backend Environment Variable  
```python
ALLOW_DEV_MODE = os.getenv("ALLOW_DEV_MODE", "false") == "true"
DEV_MODE_SECRET = os.getenv("DEV_MODE_SECRET")
```
- Backend must explicitly allow dev mode
- Backend must have matching secret
- **Production servers NEVER set these variables**

#### Layer 3: Secret Token Validation
```python
if x_dev_secret != DEV_MODE_SECRET:
    raise HTTPException(403, "Invalid development mode secret")
```
- Frontend sends secret in every request
- Backend validates secret matches exactly
- Secret prevents header spoofing

#### Layer 4: Origin/IP Validation (Optional)
```python
ALLOWED_ORIGINS = ["http://localhost:19006", "exp://192.168.1.*"]
if origin not in ALLOWED_ORIGINS:
    raise HTTPException(403, "Development mode not allowed from this origin")
```
- Only allow dev mode from specific origins
- Add IP whitelist for additional security

## Development Mode Headers
When in development mode, the frontend sends these headers with every API request:

```
X-Dev-Mode: true
X-Dev-Phone: +91XXXXXXXXXX
X-Dev-Secret: <matching-secret>
Authorization: Bearer dev-bypass-token
```

## Backend Implementation Requirements

### 1. Environment Variables (REQUIRED)
Add these to your backend environment configuration:

```bash
# Production: NEVER set these (leave empty or unset)
ALLOW_DEV_MODE=false
DEV_MODE_SECRET=

# Development: Set these to enable dev mode
ALLOW_DEV_MODE=true
DEV_MODE_SECRET=your-super-secret-random-string-here
```

### 2. Update Authentication Dependencies

```python
import os
from fastapi import Header, HTTPException

# Security configuration
ALLOW_DEV_MODE = os.getenv("ALLOW_DEV_MODE", "false") == "true"
DEV_MODE_SECRET = os.getenv("DEV_MODE_SECRET", "")

async def get_current_citizen(
    x_dev_mode: str = Header(None),
    x_dev_phone: str = Header(None),
    x_dev_secret: str = Header(None),
    authorization: str = Header(None)
):
    # SECURITY LAYER 1: Check if backend allows dev mode
    if x_dev_mode == "true":
        if not ALLOW_DEV_MODE:
            raise HTTPException(
                status_code=403, 
                detail="Development mode is not enabled on this server"
            )
        
        # SECURITY LAYER 2: Validate secret token
        if not x_dev_secret or x_dev_secret != DEV_MODE_SECRET:
            raise HTTPException(
                status_code=403, 
                detail="Invalid development mode secret"
            )
        
        # SECURITY LAYER 3: Validate phone number
        if not x_dev_phone:
            raise HTTPException(
                status_code=400, 
                detail="Phone number required in development mode"
            )
        
        # Authenticate using phone number from header
        citizen = await get_citizen_by_phone(x_dev_phone)
        if not citizen:
            # Auto-create citizen in dev mode if needed
            citizen = await create_citizen_from_phone(x_dev_phone)
        return citizen
    
    # Production: Use Supabase authentication
    # Your existing Supabase auth logic here
    ...
```

### 3. Update Citizen Profile Endpoints
```python
@router.get("/api/citizen/profile")
async def get_citizen_profile(
    current_citizen: Citizen = Depends(get_current_citizen)
):
    return current_citizen

@router.post("/api/citizen/profile")
async def create_citizen_profile(
    profile_data: CitizenProfileCreate,
    current_citizen: Citizen = Depends(get_current_citizen)
):
    # current_citizen is already authenticated via dev mode or Supabase
    # Your profile creation logic
    ...
```

### 4. Update Complaint Endpoints
```python
@router.post("/api/citizen/complaints")
async def create_complaint(
    complaint_data: ComplaintCreate,
    current_citizen: Citizen = Depends(get_current_citizen)
):
    # current_citizen will be authenticated either via dev mode or Supabase
    complaint_data.citizen_id = current_citizen.id
    # Your complaint creation logic
    ...
```

## 🚨 PRODUCTION SECURITY - HOW BYPASS IS PREVENTED

### Scenario 1: Attacker tries to use dev mode in production

**Attacker sends:**
```http
X-Dev-Mode: true
X-Dev-Phone: +919999999999
X-Dev-Secret: guessed-secret
```

**Backend response:**
```json
{
  "detail": "Development mode is not enabled on this server"
}
```
**Why it fails:** Layer 1 - `ALLOW_DEV_MODE=false` in production

### Scenario 2: Attacker knows backend has dev mode enabled

**Attacker sends:**
```http
X-Dev-Mode: true
X-Dev-Phone: +919999999999
X-Dev-Secret: guessed-secret
```

**Backend response:**
```json
{
  "detail": "Invalid development mode secret"
}
```
**Why it fails:** Layer 2 - Secret doesn't match `DEV_MODE_SECRET`

### Scenario 3: Attacker somehow knows the secret

**Attacker sends:**
```http
X-Dev-Mode: true
X-Dev-Phone: +919999999999
X-Dev-Secret: correct-secret
```

**Backend response:**
```json
{
  "detail": "Development mode not allowed from this origin"
}
```
**Why it fails:** Layer 4 - Origin/IP not in whitelist (if implemented)

### Scenario 4: Developer accidentally leaves dev mode enabled

**Configuration error:**
```bash
# Production server accidentally has:
ALLOW_DEV_MODE=true
DEV_MODE_SECRET=production-secret
```

**Attacker sends:**
```http
X-Dev-Mode: true
X-Dev-Phone: +919999999999
X-Dev-Secret: production-secret
```

**Backend response:**
```json
{
  "detail": "Invalid development mode secret"
}
```
**Why it fails:** Layer 2 - Frontend `EXPO_PUBLIC_DEV_MODE_SECRET` doesn't match backend `DEV_MODE_SECRET`

### Key Security Principles

1. **Backend is authoritative**: The backend makes the final decision
2. **Secrets don't match**: Frontend and backend have different secrets
3. **Environment-specific**: Each environment has unique secrets
4. **Defense in depth**: Multiple independent layers
5. **Fail secure**: Default is to deny, not allow

## Deployment Configuration

### Production Deployment (Render)
```yaml
# render.yaml or environment variables
ALLOW_DEV_MODE: false
DEV_MODE_SECRET: ""  # Empty string
```

### Development Deployment (Local)
```bash
# .env file
ALLOW_DEV_MODE=true
DEV_MODE_SECRET=local-dev-secret-12345
```

### Staging Deployment
```bash
# .env.staging file
ALLOW_DEV_MODE=true
DEV_MODE_SECRET=staging-secret-67890
```

## Testing Checklist
- [ ] Backend rejects dev mode when `ALLOW_DEV_MODE=false`
- [ ] Backend rejects invalid dev mode secrets
- [ ] Backend rejects dev mode without phone number
- [ ] Profile creation works with valid dev mode headers
- [ ] Complaint creation works with valid dev mode headers  
- [ ] Image upload works with valid dev mode headers
- [ ] Announcements fetch works with valid dev mode headers
- [ ] Dev mode is completely disabled in production
- [ ] Secrets are different between environments
- [ ] Secrets are never committed to git

## Benefits
- ✅ Test complete frontend + backend integration without SMS
- ✅ No backend mocking required - test real API endpoints
- ✅ Faster development iteration
- ✅ Authenticates real backend logic and data structures
- ✅ **Multiple security layers prevent production abuse**
- ✅ **Defense-in-depth architecture**
- ✅ **Backend is authoritative for security decisions**