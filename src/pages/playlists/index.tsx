import Link from "next/link";
import Image from "next/image";

import { useEffect } from "react";

// tRPC API
import { api } from "~/utils/api";

// Custom SWR
import { useSpotifyPlaylists } from "~/hooks/api/spotify";

// Components
import Loading from "~/pages/loading";

const Playlists = () => {
  useEffect(() => {
    console.log(isAccessTokenExpired());
    console.log(accessTokenExpiredAt);
    console.log(currentExpiredAt);
  });
  // 現在の時間（UNIX時間）
  const currentExpiredAt = new Date(Date.now() / 1000).getTime();

  const accountData = api.account.getToken.useQuery();
  const accessTokenExpiredAt = accountData.data?.account.expired_at;

  // アクセストークンの期限が切れていれば、trueを返す
  const isAccessTokenExpired = () => {
    if (!accessTokenExpiredAt) return;
    return accessTokenExpiredAt < currentExpiredAt;
  };

  const { playlists, isLoading, isError } = useSpotifyPlaylists();

  if (isLoading) return <Loading />;
  if (isError) return <div>Error...</div>;

  return (
    <div className="flex justify-center">
      {isAccessTokenExpired() ? (
        <div className="flex h-screen items-center justify-center">
          <h1 className="text-2xl">Spotifyの認証に失敗しました</h1>
        </div>
      ) : (
        <div>
          {playlists && playlists.items ? (
            <div className="flex gap-10">
              <div className="bg-gray-200 p-10">
                <h1 className="mb-6 text-center text-2xl">
                  My Spotify playlists.
                </h1>

                <div className="grid grid-cols-3 gap-6">
                  {playlists.items.map((item) => (
                    <div key={item.id}>
                      <Link href={`/playlists/${item.id}`}>
                        <Image
                          src={item.images[0]?.url ?? ""}
                          alt={item.name}
                          width={200}
                          height={200}
                          style={{ objectFit: "contain" }}
                        />
                        <h1>{item.name}</h1>
                        <h2>{item.id}</h2>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-200 p-10">
                <h1 className="text-center text-2xl">Mix Playlists</h1>
              </div>
            </div>
          ) : (
            <Loading />
          )}
        </div>
      )}
    </div>
  );
};

export default Playlists;
