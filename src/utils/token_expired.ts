// アクセストークンの期限が切れていれば、trueを返す
export const isAccessTokenExpired = (
  accessTokenExpiredAt: number | null | undefined
) => {
  // 現在の時間（UNIX時間）
  const currentExpiredAt = new Date(Date.now() / 1000).getTime();

  if (!accessTokenExpiredAt) return;
  return accessTokenExpiredAt < currentExpiredAt;
};
