// Home page types (and AudioBox)

export interface Chain {
  name: string;
  data: string;
  id: string;
}

export interface SongData {
  chains: Chain[];
  description: string;
  visibility: string;
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

// Friend page types

export interface FriendRequestData {
  id: string;
  type: string;
  data: {
    email: string;
    status: string;
  };
}

export interface UserFriend {
  id: string;
  userName: string;
  email: string;
}

export interface FriendRequestResponse {
  payload: FriendRequestData[];
}

export interface FriendsListRequestResponse {
  friends: UserFriend[];
}

// Friend Profile page types

export interface FriendProfile {
  userName: string;
  socialMediaHandles: {
    soundcloud?: string;
    bandcamp?: string;
    spotify?: string;
    youtube?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  pictureId: string;
}
