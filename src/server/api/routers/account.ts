import { protectedProcedure, createTRPCRouter } from "../trpc";

export const accountRouter = createTRPCRouter({
  // accountテーブル トークン、リフレッシュトークン、トークン期限 取得
  getToken: protectedProcedure.query(async ({ ctx }) => {
    const account = await ctx.prisma.account.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    const access_token = account[0]?.access_token;
    const refresh_token = account[0]?.refresh_token;
    const expired_at = account[0]?.expires_at;
    return { account: { access_token, refresh_token, expired_at } };
  }),
});
