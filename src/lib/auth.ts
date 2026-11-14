import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { admin, phoneNumber } from 'better-auth/plugins';
import { mongoDb } from './mongodb-client';

export const auth = betterAuth({
  database: mongodbAdapter(mongoDb),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'USER',
      },
      phone: {
        type: 'string',
        required: false,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: 'USER',
      adminRole: ['ADMIN', 'SUPER_ADMIN'],
    }),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        // Development console / Production Bangladesh SMS gateway hook
        console.log(`[Better Auth OTP] Sending code ${code} to ${phoneNumber}`);
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
