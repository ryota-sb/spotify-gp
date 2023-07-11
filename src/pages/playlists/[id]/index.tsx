import { useRouter } from "next/router";
import Image from "next/image";

import { api } from "~/utils/api";
import { isAccessTokenExpired } from "~/utils/token_expired";

import Layout from "~/components/Layout";
import Loading from "~/pages/loading";

import { useSpotifyPlaylistTracks } from "~/hooks/api/spotify";

const Playlist = () => {
  const accountData = api.account.getToken.useQuery();
  const accessTokenExpiredAt = accountData.data?.account.expired_at;

  const router = useRouter();
  const { id } = router.query;
  const playlistId = Array.isArray(id) ? id[0] : id;

  // プレイリスト内のトラック情報を取得
  const {
    tracks,
    isLoading: isTracksLoading,
    isError: isTracksError,
  } = useSpotifyPlaylistTracks(playlistId ?? "");

  if (isTracksLoading) return <Loading />;
  if (isTracksError) return <div>Error fetching Tracks data.</div>;

  return (
    <Layout>
      {isAccessTokenExpired(accessTokenExpiredAt) ? (
        <div className="flex h-screen items-center justify-center">
          <h1 className="text-2xl text-white">Spotifyの認証に失敗しました</h1>
        </div>
      ) : (
        <div>
          {/* プレイリスト内のトラック情報 */}
          <div>
            {tracks && tracks.items ? (
              <div className="bg-gray-200 p-10">
                <h1 className="mb-6 text-center text-3xl font-bold">Tracks</h1>
                <div className="grid grid-cols-3 gap-6">
                  {tracks.items.map((item, index) => (
                    <div key={index}>
                      <div>
                        <Image
                          src={item.track.album.images[0]?.url ?? ""}
                          alt={item.track.name}
                          width={200}
                          height={200}
                          style={{ objectFit: "contain" }}
                        />
                        <h1>{item.track.name}</h1>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Loading />
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Playlist;
