# Manual Testing Guide: Password Reset Deep Link

## Prerequisites

1. **Build and run the Tauri app in development mode:**
   ```bash
   npm run dev:tauri
   ```

2. **Wait for the app to fully load** (you should see the login screen or dashboard)

## Test Scenarios

### Test 1: Deep Link When App is Closed

**Purpose:** Verify that deep links work when the app is launched via the link.

**Steps:**
1. Close the Tauri app completely
2. Open a terminal
3. Run the test script:
   ```bash
   ./scripts/test-password-reset-link.sh
   ```
   Or manually open:
   ```bash
   # macOS
   open "tauri://localhost/#reset/test-token-123"
   
   # Linux
   xdg-open "tauri://localhost/#reset/test-token-123"
   
   # Windows
   start "tauri://localhost/#reset/test-token-123"
   ```

**Expected Results:**
- ✅ App launches automatically
- ✅ App opens to login screen
- ✅ Password reset form is displayed
- ✅ Reset token field shows: `test-token-123`
- ✅ No console errors

### Test 2: Deep Link When App is Already Running

**Purpose:** Verify that deep links work when the app is already open.

**Steps:**
1. Keep the Tauri app running
2. Open a terminal
3. Run the test script or manually open the deep link (same as Test 1)

**Expected Results:**
- ✅ App receives the deep link (doesn't launch new instance)
- ✅ App navigates to login screen (if not already there)
- ✅ Password reset form is displayed
- ✅ Reset token field shows: `test-token-123`
- ✅ No console errors

### Test 3: Generate Password Reset Link from App

**Purpose:** Verify that the app generates the correct deep link format.

**Steps:**
1. Open the app
2. Go to login screen
3. Click "Forgot Password?"
4. Enter an email address
5. Click "Request Reset"
6. Copy the generated reset link

**Expected Results:**
- ✅ Reset link format: `tauri://localhost/#reset/[token]`
- ✅ Token is a valid string
- ✅ Link can be clicked/opened to trigger password reset

### Test 4: Invalid Deep Link Format

**Purpose:** Verify error handling for malformed deep links.

**Steps:**
1. Keep app running
2. Try opening invalid deep links:
   ```bash
   # Missing hash
   open "tauri://localhost"
   
   # Wrong protocol
   open "http://localhost/#reset/test"
   
   # Missing token
   open "tauri://localhost/#reset/"
   ```

**Expected Results:**
- ✅ App doesn't crash
- ✅ Invalid links are ignored gracefully
- ✅ No console errors (or only expected warnings)

## Verification Checklist

After running all tests, verify:

- [ ] Deep link works when app is closed
- [ ] Deep link works when app is running
- [ ] Password reset form appears correctly
- [ ] Reset token is parsed and displayed
- [ ] Hash change events are triggered
- [ ] No JavaScript errors in console
- [ ] No Rust errors in terminal
- [ ] App state updates correctly

## Troubleshooting

### Deep link doesn't open app
- **macOS:** Check that the app is properly built and the protocol is registered
- **Windows:** Verify registry entries were created during installation
- **Linux:** Check `.desktop` file has correct protocol handler

### App opens but doesn't show reset form
- Check browser console for JavaScript errors
- Verify `hashchange` event is being triggered
- Check that `Login.tsx` is listening for hash changes

### Deep link works in dev but not in production
- Ensure `tauri-plugin-deep-link` is included in production build
- Verify `tauri.conf.json` has the plugin configured
- Check that installers properly register the protocol

## Platform-Specific Notes

### macOS
- Deep links must be registered in `Info.plist` (handled by plugin)
- App must be properly signed for deep links to work in production
- Test with: `open "tauri://localhost/#reset/test"`

### Windows
- Deep links are registered in Windows Registry (handled by plugin)
- May require admin privileges during installation
- Test with: `start "tauri://localhost/#reset/test"`

### Linux
- Deep links are registered via `.desktop` file (handled by plugin)
- May require `xdg-utils` package
- Test with: `xdg-open "tauri://localhost/#reset/test"`

