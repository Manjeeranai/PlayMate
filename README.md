# Playmate Guild Workspace App

Static web app for running prize distribution per guild workspace.

## Workspace model

- `1 guild = 1 workspace`
- Each workspace has its own admin, member access code, and prize distribution data
- Admins can manage more than one workspace, but data stays isolated by workspace

## Supabase setup

1. Create a Supabase project
2. Open the SQL Editor
3. Run the SQL from `supabase-schema.sql`
4. In Supabase, go to `Authentication -> Providers -> Google` and enable Google sign-in
5. Add your app URL to:
   - `Authentication -> URL Configuration -> Site URL`
   - `Authentication -> URL Configuration -> Redirect URLs`
6. If you are testing locally with a static file or local server, add the exact URL you will open in the browser, for example:
   - `http://127.0.0.1:5500/index.html`
   - `http://localhost:5500/index.html`
7. Open `supabase-config.js`
8. Replace:

```js
window.SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

9. Save the file
10. Open `index.html`

## How access works

- A guild admin signs in with Google through Supabase Auth
- The admin creates a workspace after login
- The admin can generate a member access code from inside the app
- Generated member codes are tied to the workspace and use a workspace-based prefix plus a random suffix
- Guild members enter that code to open the workspace in member mode
- Member mode is read-only; only the admin can change settings or run the distribution
- Workspace data is stored in `workspace_state` and protected by RLS

## Tables created

- `workspaces`
- `workspace_admins`
- `workspace_state`
- `workspace_access_codes`

## RPC functions created

- `is_workspace_admin(...)`
- `create_workspace(...)`
- `rotate_workspace_access_code(...)`
- `resolve_workspace_access_code(...)`

## Notes

- The app keeps a browser local backup for the active workspace as a fallback
- Rotating a member access code immediately invalidates the previous code
- Member access is read-only by design; only admins can write to `workspace_state`

## Quick verification

1. Sign in with Google as the guild admin
2. Create a workspace
3. Set guild name and add at least 1 member
4. Refresh the page and confirm the member is still there
5. Generate a member access code
6. Open a new private/incognito window
7. Enter the member access code and confirm the workspace opens in read-only mode
