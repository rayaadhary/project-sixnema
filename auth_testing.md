# SIXNEMA Authentication Testing

Use the three demo accounts in `/app/memory/test_credentials.md`.
Verify valid login sets a session and opens the correct role dashboard; invalid credentials remain on login with an error; logout returns to login.
Verify `/api/auth/me` accepts the session and `/api/auth/logout` clears it.