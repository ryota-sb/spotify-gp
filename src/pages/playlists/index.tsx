import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

import { useRouter } from "next/router";

import type {
  PlaylistsObject,
  PlaylistObject,
  TracksObject,
  TrackObject,
  AudioFeaturesObject,
} from "~/server/types";

import { api } from "~/utils/api";

import { isAccessTokenExpired } from "~/utils/token_expired";

// Custom SWR
import { useSpotifyPlaylists } from "~/hooks/api/spotify";

// React Hook Form
import { useForm, type SubmitHandler } from "react-hook-form";

// Pages and Components
import Loading from "~/pages/loading";
import BPMSelector from "~/components/BPMSelector";
import Modal from "~/components/Modal";

const Playlists = () => {
  const router = useRouter();
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

  const providerAccount = api.account.getProviderAccount.useQuery();
  const getProviderAccountId = providerAccount.data?.account.providerAccountId;

  // ログインユーザーのプレイリスト全取得
  const { playlists, isLoading, isError } = useSpotifyPlaylists();

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

  /**
   * 渡されたトラックIDの配列からトラックごとの特徴データを返す
   * @param trackIds トラックIDの配列
   * @returns トラックの特徴データのオブジェクト配列
   */
  const getSpotifyTracksAudioFeatures = async () => {
    const trackIds = mixTracks.items.flatMap((itemArray) =>
      itemArray.map((item) => item.track.id)
    );
    const url = `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(
      "%2C"
    )}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken ?? ""}` },
    });
    const data = (await response.json()) as AudioFeaturesObject;
    return data;
  };

  /**
   * 渡されたBPMのトラックに絞り込み、そのトラックIDを返す
   * @param minBPM トラックBPMの最初値
   * @param maxBPM トラックBPMの最大値
   * @returns BPMで絞り込んだトラックIDの配列
   */
  const getFilteredTracksByBPM = async (minBPM: number, maxBPM: number) => {
    const audio_features = await getSpotifyTracksAudioFeatures();
    const tracks = audio_features.audio_features.filter(
      (item) => item.tempo >= minBPM && item.tempo <= maxBPM
    );
    const trackIds = tracks.map((track) => `spotify:track:${track.id}`);
    return trackIds;
  };

  /**
   * 空プレイリスト作成
   * @param formInput inputフォームに入力された値
   * @returns 作成したプレイリストオブジェクト
   */
  const createEmptyPlaylist = async (formInput: FormInput) => {
    const url = `https://api.spotify.com/v1/users/${
      getProviderAccountId ?? ""
    }/playlists`;
    const inputData = {
      name: formInput.name,
      description: "Playlist description",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken ?? ""}`,
      },
      body: JSON.stringify(inputData),
    });

    const data = (await response.json()) as PlaylistObject;
    return data;
  };

  /**
   * プレイリストをミックスし、BPMを揃えた新たなプレイリストを作成
   * @param formInput inputフォームに入力された値
   */
  const createMixPlaylistByBPM = async (formInput: FormInput) => {
    const emptyPlaylist = await createEmptyPlaylist(formInput);
    const trackIdsByBPM = await getFilteredTracksByBPM(minBPM, maxBPM);
    const url = `https://api.spotify.com/v1/playlists/${emptyPlaylist.id}/tracks`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken ?? ""}`,
      },
      body: JSON.stringify(trackIdsByBPM),
    });
    console.log(response);
  };

  // BPMの初期値とセット関数
  const [minBPM, setMinBPM] = useState(80);
  const [maxBPM, setMaxBPM] = useState(180);

  type FormInput = Pick<PlaylistObject, "name">;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    mode: "onChange",
    defaultValues: { name: "" },
  });

  const onSubmit: SubmitHandler<FormInput> = async (inputValue) => {
    await createMixPlaylistByBPM(inputValue);
    router.reload();
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
                          className="bg-red-500 px-5 py-2.5 text-center text-sm text-white hover:bg-red-600 focus:outline-none"
                          onClick={() => void handleRemoveMixState(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <BPMSelector
                  minBPM={minBPM}
                  maxBPM={maxBPM}
                  setMinBPM={setMinBPM}
                  setMaxBPM={setMaxBPM}
                />

                <Modal buttonText={"作成"}>
                  <div className="flex items-center justify-center">
                    <form
                      onSubmit={(...args) =>
                        void handleSubmit(onSubmit)(...args)
                      }
                    >
                      <div className="flex flex-col">
                        <input
                          type="text"
                          placeholder="プレイリスト名を入力してください"
                          className="p-4 outline-none"
                          {...register("name", { required: true })}
                        />
                        {errors.name && (
                          <div className="text-red-500">
                            プレイリスト名は必須です
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="rounded border border-green-600 bg-transparent px-4 py-2 font-semibold text-green-600 hover:border-transparent hover:bg-green-700 hover:text-white"
                      >
                        作成
                      </button>
                    </form>
                  </div>
                </Modal>
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
