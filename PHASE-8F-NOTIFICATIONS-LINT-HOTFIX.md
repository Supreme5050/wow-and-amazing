# Wow & Amazing — Phase 8F Notifications Lint Hotfix

This hotfix fixes the React ESLint `react-hooks/set-state-in-effect` error in `src/components/admin/AdminNotifications.tsx`.

## Cause

The notification loader called `setError("")` synchronously before its first `await`, while the loader itself was invoked from `useEffect`. The React hooks lint rule treats that as a synchronous state update triggered by an effect and blocks lint.

## Fix

The API request now runs first. State updates (`setPayload` and clearing the error) happen only after the asynchronous request resolves. The notification functionality, API routes, Supabase data and delivery behavior are unchanged.

No Supabase migration is required.
