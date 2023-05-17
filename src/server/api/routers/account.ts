import { protectedProcedure, createTRPCRouter } from "../trpc";

export const accountRouter = createTRPCRouter({
  // accountテーブル トークン、リフレッシュトークン、トークン期限 取得
  getToken: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await ctx.prisma.account.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    const access_token = accounts[0]?.access_token;
    const refresh_token = accounts[0]?.refresh_token;
    const expired_at = accounts[0]?.expires_at;
    return { account: { access_token, refresh_token, expired_at } };
  }),

  // accountテーブル プロバイダーアカウントID取得
  getProviderAccount: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await ctx.prisma.account.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    const providerAccountId = accounts[0]?.providerAccountId;
    return { account: { providerAccountId } };
  }),
});
