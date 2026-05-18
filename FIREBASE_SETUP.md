# Firebase Authentication Setup Guide

Your Farm2Vets application now has Firebase authentication integrated! Here's how to set it up:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project" or select an existing one
3. Name it (e.g., "Farm2Vets")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Get Your Firebase Credentials

1. In your Firebase project, go to **Settings** (⚙️ icon) → **Project settings**
2. Scroll to "Your apps" section
3. Click the Web app icon (</>) to register a web app
4. Give it a name (e.g., "Farm2Vets Web")
5. Copy the Firebase configuration object that looks like:

```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "project-id.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
}
```

## Step 3: Configure Environment Variables

1. Open `frontend/.env` file
2. Replace the placeholder values with your Firebase credentials:

```env
VITE_API_URL=http://localhost:8000

VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef...
```

## Step 4: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click "Email/Password"
3. Enable both:
   - ✅ Email/Password
   - ✅ Email link (optional, for passwordless sign-in)
4. Click "Save"

## Step 5: Test the Application

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

4. You should see:
   - **Landing Page** (public) with "Sign up" and "Login" buttons
   - Click "Sign up" to create an account
   - Click "Login" to sign in
   - After authentication, you'll see the Dashboard

## Authentication Flow

### For Unauthenticated Users:
```
Landing Page → Sign Up / Login → (Authentication)
```

### For Authenticated Users:
```
Dashboard → (Full Access) → Logout (returns to Landing Page)
```

## Key Features Implemented

✅ **Firebase Email/Password Authentication**
- Sign up with email and password
- Login with email and password
- Secure password validation
- Account creation

✅ **Protected Routes**
- Landing page is public
- All app features require authentication
- Automatic redirection based on auth state

✅ **User Session Management**
- Firebase automatically manages user sessions
- Sessions persist across page refreshes
- One-click logout functionality

✅ **Bilingual Support**
- All authentication pages support English and Vietnamese
- Language preference is preserved

✅ **User Profile Display**
- Shows user email in top-right corner
- Quick access to profile and logout
- User avatar with initials

## What Was Created

### New Files:
- `frontend/src/config/firebase.ts` - Firebase configuration
- `frontend/src/context/AuthContext.tsx` - Authentication state management
- `frontend/src/pages/LoginPage.tsx` - Login form component
- `frontend/src/pages/SignupPage.tsx` - Sign-up form component

### Modified Files:
- `frontend/src/App.tsx` - Added auth-based routing
- `frontend/src/components/layout/TopBar.tsx` - Added user menu and logout
- `frontend/src/pages/LandingPage.tsx` - Updated CTAs to login/signup
- `frontend/src/locales/en.json` - Added auth translations
- `frontend/src/locales/vi.json` - Added Vietnamese auth translations
- `frontend/.env` - Added Firebase configuration variables

### New Dependencies:
- `firebase` - Firebase SDK
- `@react-oauth/google` - Google OAuth (for future use)

## Troubleshooting

### "Firebase not configured" error
- Check that all environment variables in `.env` are filled with correct values
- Restart the development server after updating `.env`

### "User not found" or "Wrong password"
- Create a new account first if you haven't already
- Verify email address is correct
- Check password length (minimum 6 characters)

### Authentication not persisting
- Clear browser cache and localStorage
- Check that Firebase project has Email/Password auth method enabled
- Verify Firebase configuration is correct

### Build errors
- Run `npm install` in the frontend directory
- Ensure Node.js version is 18+
- Clear `node_modules` and reinstall if issues persist

## Next Steps

1. **Email Verification** - Add email verification flow in Firebase
2. **Password Reset** - Implement password reset functionality
3. **Profile Management** - Allow users to update their profile information
4. **Social Login** - Add Google/GitHub authentication (packages already installed)
5. **Backend Integration** - Connect authenticated users with your FastAPI backend

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `farm2vets.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `farm2vets-abc123` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `farm2vets.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:123456789:web:abc...` |

---

For more help, visit the [Firebase Documentation](https://firebase.google.com/docs/auth).
