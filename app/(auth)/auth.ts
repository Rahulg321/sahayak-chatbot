import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from 'next-auth/providers/credentials';
import { createGuestUser, db, getUser, getUserById } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import type { DefaultJWT } from 'next-auth/jwt';
import { sessions, accounts, user, user as userTable } from "@/lib/db/schema";
import { eq } from 'drizzle-orm';
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { DrizzleAdapter } from "@auth/drizzle-adapter";


export type UserType = 'guest' | 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
      accessToken?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
//@ts-ignore 
  adapter: DrizzleAdapter(db, {
    usersTable: user,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    Google,
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const user = (await getUser(email as string))?.[0];

        if (!user || !user.password) {
          console.log("User not found or password is null");
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          password as string,
          user.password
        );

        if (!passwordsMatch) {
          console.log("Invalid password, they do not match");
          return null;
        }

        const accessToken = sign(
          { id: user.id, type: "regular" },
          process.env.AUTH_SECRET as string
        );

        console.log("created an accessToken", accessToken);

        return { ...user, type: "regular", accessToken };
      },
    }),
  ],
  events: {
    signIn: async ({ user, account, profile, isNewUser }) => {
      // Only update emailVerified for OAuth providers (not credentials)
      if (account?.provider !== "credentials" && user.id) {
        try {
          await db
            .update(userTable)
            .set({ emailVerified: new Date() })
            .where(eq(userTable.id, user.id));
          
          console.log(`Email verified for user ${user.email} via ${account?.provider}`);
        } catch (error) {
          console.error("Error updating emailVerified:", error);
        }
      }
    },
  },
 callbacks: {
    signIn: async ({ user, account }) => {
      if (account?.provider !== "credentials") {
        const existingUser = (await getUser(user.email as string))?.[0];
        if (existingUser && existingUser.password) {
          console.log(
            "User already has a password, created usingother provider"
          );
          return false;
        }

        if (user.id) {
          await db
            .update(userTable)
            .set({ emailVerified: new Date() })
            .where(eq(userTable.id, user.id));
        }
        return true;
      }

      const existingUser = await getUserById(user.id as string);

      if (!existingUser?.emailVerified) {
        return false;
      }

      return true;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/admin");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; 
      } else if (isLoggedIn) {
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
        token.accessToken = user.accessToken as string;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
        session.user.accessToken = token.accessToken as string;
      }

      return session;
    },
  },
});
