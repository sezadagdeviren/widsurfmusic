import { Track } from 'react-native-track-player';

export interface MusicTrack extends Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  duration?: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: MusicTrack[];
  color?: string;
}

export interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface MetadataResult {
  artwork?: string;
  title?: string;
  artist?: string;
}
