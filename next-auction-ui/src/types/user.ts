export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
  stats?: UserStats;
  session?: UserSession;
}

export interface UserPreferences {
  notificationEnabled: boolean;
  emailNotifications: {
    newBid: boolean;
    outbid: boolean;
    auctionEnding: boolean;
    auctionWon: boolean;
    auctionLost: boolean;
    sellerUpdates: boolean;
  };
  bidding: {
    autoBidEnabled: boolean;
    maxAutoBidAmount?: number;
    bidIncrement?: number;
  };
  displayMode: 'light' | 'dark' | 'system';
  language: string;
}

export interface UserStats {
  totalBids: number;
  auctionsWon: number;
  auctionsLost: number;
  auctionsHosted: number;
  positiveRatings: number;
  negativeRatings: number;
  totalSpent: number;
  totalEarned: number;
  memberSince: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  lastActive: string;
  device?: string;
  ipAddress?: string;
  token?: string;
}

export type UserRole = 'user' | 'admin' | 'moderator'; 