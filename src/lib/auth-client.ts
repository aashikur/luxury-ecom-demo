import { createAuthClient } from 'better-auth/react';
import { adminClient, phoneNumberClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  plugins: [adminClient(), phoneNumberClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
