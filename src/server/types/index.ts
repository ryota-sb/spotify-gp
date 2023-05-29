export interface SpotifyOwner {
  display_name: string;
  external_urls: { spotify: string };
  href: string;
  id: string;
  type: ["user"];
  url: string;
}

export interface PlaylistImage {
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
  images: PlaylistImage[];
  name: string;
  owner: SpotifyOwner;
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

interface TrackImage {
  height: number;
  width: number;
  url: string;
}

export interface Track {
  track: {
    name: string;
    id: string;
    album: { images: TrackImage[] };
    popularity: number;
    type: ["track"];
  };
}

export interface Tracks {
  items: Track[];
}

export interface AudioFeature {
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

export interface AudioFeatures {
  audio_features: AudioFeature[];
}
