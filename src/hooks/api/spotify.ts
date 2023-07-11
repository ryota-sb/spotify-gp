import useSWR from "swr";
import { api } from "~/utils/api";
import type {
  PlaylistsObject,
  PlaylistObject,
  TracksObject,
} from "~/server/types";

const fetcher = (url: string, access_token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${access_token}` } });

// ログインユーザーのプレイリストを全て取得
const useSpotifyPlaylists = () => {
  const tokenData = api.account.getToken.useQuery();
  const accountData = api.account.getProviderAccount.useQuery();
  const accessToken = tokenData.data?.account.access_token;
  const userId: string = accountData.data?.account.providerAccountId ?? "";
  const { data, error } = useSWR<PlaylistsObject, Error>(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    (url: string) => fetcher(url, accessToken ?? "").then((res) => res.json())
  );

  return {
    playlists: data,
    isLoading: !error && !data,
    isError: error,
  };
};

// ログインユーザーの指定IDのプレイリストを取得
const useSpotifyPlaylist = (playlistId: string) => {
  const tokenData = api.account.getToken.useQuery();
  const accessToken = tokenData.data?.account.access_token;
  const { data, error } = useSWR<PlaylistObject, Error>(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    (url: string) => fetcher(url, accessToken ?? "").then((res) => res.json())
  );

  return {
    playlist: data,
    isLoading: !error && !data,
    isError: error,
  };
};

// プレイリストの曲情報を取得
const useSpotifyPlaylistTracks = (playlistId: string) => {
  const tokenData = api.account.getToken.useQuery();
  const accessToken = tokenData.data?.account.access_token;
  const { data, error } = useSWR<TracksObject, Error>(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    (url: string) => fetcher(url, accessToken ?? "").then((res) => res.json())
  );

  return {
    tracks: data,
    isLoading: !error && !data,
    isError: error,
  };
};

export { useSpotifyPlaylists, useSpotifyPlaylist, useSpotifyPlaylistTracks };
