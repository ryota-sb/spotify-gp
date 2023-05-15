import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

// 追記
import SpotifyProvider from "next-auth/providers/spotify";
import { type Account } from "next-auth/";

interface ExtendedToken extends Account {
  accessToken: string;
  refreshToken?: string;
  expires_at: number;
}

interface ResponseToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  error?: string;
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

async function refreshAccessToken(
  userId: string,
  newAccount: ExtendedToken
): Promise<void> {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: userId },
    });

    const account = accounts[0];

    // アカウントのトークン期限があり、そのトークンの期限が切れていたらreturnする
    if (account?.expires_at && new Date().getTime() < account.expires_at)
      return;

    const refreshToken = account?.refresh_token;

    const url = "https://accounts.spotify.com/api/token?";

    const params = new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID ?? "",
      client_secret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: refreshToken ?? "",
    });

    const _url = url + params.toString();

    const response = await fetch(_url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
    });

    const refreshedTokens = (await response.json()) as ResponseToken;

    const dateNowAt = Math.floor(Date.now() / 1000);

    if (!response.ok) {
      if (refreshedTokens.error === "invalid_grant") {
        await prisma.account.update({
          where: { id: account?.id },
          data: {
            refresh_token: newAccount.refreshToken,
            access_token: newAccount.accessToken,
            expires_at: newAccount.expires_at,
          },
        });
        return;
      }
      throw refreshedTokens;
    }

    await prisma.account.update({
      where: { id: account?.id },
      data: {
        refresh_token: refreshedTokens.refresh_token ?? refreshToken,
        access_token: refreshedTokens.access_token,
        expires_at: dateNowAt + refreshedTokens.expires_in,
      },
    });
    console.log("Refreshed!!");
  } catch (error) {
    console.log(error);
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
    signIn: ({ account }) => {
      console.log(account?.access_token);
      console.log(account?.expires_at);
      return true;
    },
  },
  events: {
    async signIn(payload) {
      await refreshAccessToken(
        payload.user.id,
        payload.account as ExtendedToken
      );
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    SpotifyProvider({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-read-email,playlist-read-private,user-read-email,streaming,user-read-private,user-library-read,user-library-modify,user-read-playback-state,user-modify-playback-state,user-read-recently-played,user-follow-read",
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages: {
    signIn: "/auth/signin",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
