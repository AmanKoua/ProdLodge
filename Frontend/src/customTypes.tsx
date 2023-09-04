// Home page types (and AudioBox)
export interface Chain {
  name: string;
  data: string;
  id: string;
}

export interface SongData {
  chains: Chain[];
  description: string;
  id: string;
  title: string;
  trackIds: string[];
}

// AudioBox types

export interface TrackData {
  isEnabled: boolean;
  name: string;
  moduleCount: number;
  idx: number;
}

export interface AudioModule {
  type?: string;
  isEnabled?: boolean;
  frequency?: number;
  resonance?: number;
  gain?: number;
  impulse?: number;
  amount?: number;
  threshold?: number;
  knee?: number;
  ratio?: number;
  reduction?: number;
  attack?: number;
  release?: number;
}

// NewSong types

export interface SongUploadData {
  trackName: string;
  file?: File;
}
