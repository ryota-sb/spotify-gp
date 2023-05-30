export interface SpotifyOwnerObject {
  display_name: string;
  external_urls: { spotify: string };
  href: string;
  id: string;
  type: ["user"];
  url: string;
}

export interface PlaylistImageObject {
  height: null;
  width: null;
  url: string;
}

export interface PlaylistObject {
  collaborative?: boolean;
  description?: string;
  external_urls?: { spotify: string };
  href?: string;
  id: string;
  images: PlaylistImageObject[];
  name: string;
  owner: SpotifyOwnerObject;
  primary_color?: null;
  public?: boolean;
  snapshot_id?: string;
  tracks?: {
    href?: string;
    total?: number;
  };
  type: ["playlist"];
  uri?: string;
}

export interface PlaylistsObject {
  items: PlaylistObject[];
}

interface TrackImageObject {
  height: number;
  width: number;
  url: string;
}

export interface TrackObject {
  track: {
    name: string;
    id: string;
    album: { images: TrackImageObject[] };
    popularity: number;
    type: "track";
  };
}

export interface TracksObject {
  items: TrackObject[];
}

export interface AudioFeatureObject {
  acousticness: number;
  analysis_url: string;
  danceability: number;
  duration_ms: number;
  energy: number;
  id: string;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  time_signature: number;
  track_href: string;
  type: ["audio_features"];
  uri: string;
  valence: number;
}

export interface AudioFeaturesObject {
  audio_features: AudioFeatureObject[];
}
