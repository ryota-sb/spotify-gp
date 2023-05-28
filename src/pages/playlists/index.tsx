import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

import type { PlaylistsObject, PlaylistObject, Tracks } from "~/server/types";

import { api } from "~/utils/api";

import { isAccessTokenExpired } from "~/utils/token_expired";

// Custom SWR
import { useSpotifyPlaylists } from "~/hooks/api/spotify";

// Components
import Loading from "~/pages/loading";

const Playlists = () => {
  // 選択したプレイリストを格納する配列
  const [mixPlaylists, setMixPlaylists] = useState<PlaylistsObject>({
    items: [],
  });

  useEffect(() => {
    console.log(mixPlaylists);
  });

  const accountData = api.account.getToken.useQuery();
  const accessTokenExpiredAt = accountData.data?.account.expired_at;
  const accessToken = accountData.data?.account.access_token;

  const { playlists, isLoading, isError } = useSpotifyPlaylists();

  // 渡されたIDのプレイリストを取得
  const getPlaylistData = async (
    playlistId: string
  ): Promise<PlaylistObject> => {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken ?? ""}` },
    });
    const data = (await response.json()) as PlaylistObject;
    return data;
  };

  // mixPlaylistにプレイリストを追加
  const addMixPlaylist = async (playlistId: string) => {
    const isAlreadyAdded = mixPlaylists.items.some(
      (playlist) => playlist.id === playlistId
    );

    if (isAlreadyAdded) return;

    const playlistData = await getPlaylistData(playlistId);
    setMixPlaylists((prevPlaylists) => ({
      items: [...prevPlaylists.items, playlistData],
    }));
  };

  // mixPlaylistからプレイリストを削除
  const removeMixPlaylist = (index: number) => {
    setMixPlaylists((prevPlaylists) => {
      const updatedPlaylists = [...prevPlaylists.items];
      updatedPlaylists.splice(index, 1);
      return {
        items: updatedPlaylists,
      };
    });
  };

  if (isLoading) return <Loading />;
  if (isError) return <div>Error...</div>;

  return (
    <div className="flex justify-center">
      {isAccessTokenExpired(accessTokenExpiredAt) ? (
        <div className="flex h-screen items-center justify-center">
          <h1 className="text-2xl text-white">Spotifyの認証に失敗しました</h1>
        </div>
      ) : (
        <div>
          {playlists && playlists.items ? (
            <div className="grid grid-cols-3 gap-10">
              {/* My playlists */}
              <div className="col-span-2 bg-gray-200 p-10">
                <h1 className="mb-6 text-center text-3xl font-bold">
                  My Spotify playlists.
                </h1>

                <div className="grid grid-cols-2 gap-6">
                  {playlists.items.map((playlist) => (
                    <div key={playlist.id}>
                      <Link href={`/playlists/${playlist.id}`}>
                        <div className="relative h-80 max-w-full">
                          <Image
                            src={playlist.images[0]?.url ?? ""}
                            alt={playlist.name}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      </Link>
                      <div className="my-4 flex items-center justify-between">
                        <h1 className="truncate text-2xl">{playlist.name}</h1>
                        <button
                          type="button"
                          className="bg-green-600 px-5 py-2.5 text-center text-sm text-white hover:bg-green-700 focus:outline-none"
                          onClick={() => void addMixPlaylist(playlist.id)}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mix playlists */}
              <div className="bg-gray-200 p-10">
                <h1 className="mb-6 text-center text-3xl font-bold">
                  Mix Playlists
                </h1>
                <div className="grid grid-cols-1 gap-6">
                  {mixPlaylists.items.map((mixPlaylist, index) => (
                    <div key={mixPlaylist.id}>
                      <Link href={`/playlists/${mixPlaylist.id}`}>
                        <div className="relative h-80 max-w-full">
                          <Image
                            src={mixPlaylist.images[0]?.url ?? ""}
                            alt={mixPlaylist.name}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      </Link>
                      <div className="my-4 flex items-center justify-between">
                        <h1 className="truncate text-2xl">
                          {mixPlaylist.name}
                        </h1>
                        <button
                          type="button"
                          className="bg-green-600 px-5 py-2.5 text-center text-sm text-white hover:bg-green-700 focus:outline-none"
                          onClick={() => void removeMixPlaylist(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>home</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Playlists;
