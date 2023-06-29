import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

import type {
  PlaylistsObject,
  PlaylistObject,
  TracksObject,
  TrackObject,
} from "~/server/types";

import { api } from "~/utils/api";

import { isAccessTokenExpired } from "~/utils/token_expired";

// Custom SWR
import {
  useSpotifyPlaylists,
  useSpotifyTracksAudioFeatures,
} from "~/hooks/api/spotify";

// Components
import Loading from "~/pages/loading";

const Playlists = () => {
  // 選択したプレイリストを格納する配列
  const [mixPlaylists, setMixPlaylists] = useState<PlaylistsObject>({
    items: [],
  });
  // 選択したプレイリスト内の全ての曲名を格納する配列
  const [mixTracks, setMixTracks] = useState<{ items: TrackObject[][] }>({
    items: [],
  });

  // トークン取得、トークン期限取得
  const accountData = api.account.getToken.useQuery();
  const accessTokenExpiredAt = accountData.data?.account.expired_at;
  const accessToken = accountData.data?.account.access_token;

  const { playlists, isLoading, isError } = useSpotifyPlaylists();

  // トラックごとの特徴値を取得
  // const {
  //   tracksAudioFeatures,
  //   isLoading: isTracksAudioFeaturesLoading,
  //   isError: isTracksAudioFeaturesError,
  // } = useSpotifyTracksAudioFeatures(trackIds ?? []);

  /**
   * 渡されたIDのプレイリストを取得
   * @param playlistId - プレイリストID
   * @returns プレイリストを格納したPlaylistObject型のデータ
   */
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

  /**
   * 渡したプレイリストIDのプレイリストの曲情報を取得
   * @param playlistId - プレイリストID
   * @returns 曲情報を格納したTracksObject型のデータ
   */
  const getPlaylistTracksData = async (
    playlistId: string
  ): Promise<TracksObject> => {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken ?? ""}` },
    });
    const data = (await response.json()) as TracksObject;
    return data;
  };

  /**
   * mixPlaylistとmixTracksに取得した値を追加
   * @param playlistId - プレイリストID
   */
  const addMixPlaylistAndTracks = async (playlistId: string) => {
    const isAlreadyAdded = mixPlaylists.items.some(
      (playlist) => playlist.id === playlistId
    );

    if (isAlreadyAdded) return;

    const playlistData = await getPlaylistData(playlistId);
    setMixPlaylists((prevPlaylists) => ({
      items: [...prevPlaylists.items, playlistData],
    }));

    await addMixTracks([playlistId]);
  };

  /**
   * 渡された複数のプレイリストIDのプレイリストの曲情報を取得し、mixTracksに追加
   * @param playlistIds - プレイリストIDの配列
   */
  const addMixTracks = async (playlistIds: string[]) => {
    const tracks: { items: TrackObject[][] } = { items: [] };

    for (const playlistId of playlistIds) {
      const playlistTracks = await getPlaylistTracksData(playlistId);
      const playlistItems = playlistTracks.items.map((item) => item);
      tracks.items.push(playlistItems);
    }
    setMixTracks((prevTrack) => ({
      items: [...prevTrack.items, ...tracks.items],
    }));
  };

  /**
   * mixPlaylistから指定されたインデックスのプレイリストを削除
   * @param index - 削除するプレイリストのインデックス
   */
  const removeMixPlaylist = (index: number) => {
    setMixPlaylists((prevPlaylist) => {
      const updatedPlaylists = [...prevPlaylist.items];
      updatedPlaylists.splice(index, 1);
      return {
        items: updatedPlaylists,
      };
    });
  };

  /**
   * mixTracksから指定されたインデックスの曲を削除
   * @param index - 削除するトラックのインデックス
   */
  const removeMixTrack = (index: number) => {
    setMixTracks((prevTrack) => {
      const updatedTracks = [...prevTrack.items];
      updatedTracks.splice(index, 1);
      return {
        items: updatedTracks,
      };
    });
  };

  /**
   * 渡されたindex番号のmixPlaylistsとmixTracksを配列から削除
   * @param index - 削除するプレイリストとトラックのインデックス
   */
  const handleRemoveMixState = (index: number) => {
    removeMixPlaylist(index);
    removeMixTrack(index);
  };

  // 値 確認
  useEffect(() => {
    console.log(mixPlaylists);
    console.log(mixTracks);
  }, [mixPlaylists, mixTracks]);

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
                  My playlists
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
                          onClick={() =>
                            void addMixPlaylistAndTracks(playlist.id)
                          }
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
                          onClick={() => void handleRemoveMixState(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() =>
                    void addMixTracks(mixPlaylists.items.map((item) => item.id))
                  }
                >
                  getMixTracks
                </button>
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
