import axios from 'axios';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Type definitions for auction items
export interface AuctionItem {
  item_id: number;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  current_bid: number | null;
  start_price: number;
  status: string; // 'active', 'completed', or 'upcoming'
  user_id: number;
  won_by?: number | null;
  image_url?: string | null;
}

export interface Bid {
  bid_id?: number;
  item_id?: number;
  user_id?: number;
  bid_amount: number;
  bid_time?: string;
  user_name?: string;
  user_email?: string;
  timestamp?: string;
}

export interface AuctionFilters {
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface CreateItemRequest {
  item_name: string;
  start_time: string;
  end_time: string;
  start_price: number;
}

export interface UpdateItemRequest {
  item_name: string;
  start_time: string;
  end_time: string;
  start_price: number;
  current_bid: number;
  user_id: number;
  status: boolean;
  won_by: number | null;
}

// Mock auction items for fallback when API is not available
const FALLBACK_AUCTIONS: AuctionItem[] = [
  {
    item_id: 1,
    name: "Vintage Watch Collection",
    start_time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    end_time: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    current_bid: 250,
    status: "active",
    start_price: 100,
    won_by: null,
    user_id: 1
  },
  {
    item_id: 2,
    name: "Antique Wooden Furniture",
    start_time: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    end_time: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    current_bid: 500,
    status: "active",
    start_price: 150,
    won_by: null,
    user_id: 1
  },
  {
    item_id: 3,
    name: "Collectible Trading Cards",
    start_time: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    end_time: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    current_bid: 75,
    status: "upcoming",
    start_price: 50,
    won_by: null,
    user_id: 1
  },
  {
    item_id: 4,
    name: "Vintage Camera",
    start_time: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    end_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    current_bid: 350,
    status: "completed",
    start_price: 200,
    won_by: 2,
    user_id: 1
  }
];

// Fallback bid history data
const FALLBACK_BIDS: Record<number, Bid[]> = {
  1: [
    {
      bid_id: 1,
      item_id: 1,
      user_id: 2,
      bid_amount: 250,
      bid_time: new Date(Date.now() - 86400000 / 2).toISOString(),
      user_name: "Jane Doe"
    },
    {
      bid_id: 2,
      item_id: 1,
      user_id: 3,
      bid_amount: 200,
      bid_time: new Date(Date.now() - 86400000 / 1.5).toISOString(),
      user_name: "Bob Smith"
    }
  ],
  2: [
    {
      bid_id: 3,
      item_id: 2,
      user_id: 2,
      bid_amount: 500,
      bid_time: new Date(Date.now() - 86400000 / 3).toISOString(),
      user_name: "Jane Doe"
    },
    {
      bid_id: 4,
      item_id: 2,
      user_id: 3,
      bid_amount: 400,
      bid_time: new Date(Date.now() - 86400000 / 2).toISOString(),
      user_name: "Bob Smith"
    }
  ],
  3: [],
  4: [
    {
      bid_id: 5,
      item_id: 4,
      user_id: 2,
      bid_amount: 350,
      bid_time: new Date(Date.now() - 86400000 / 2).toISOString(),
      user_name: "Jane Doe"
    }
  ]
};

// Auction Service
class AuctionService {
  // Flag to indicate if we should use fallback data
  private useFallback: boolean = false;

  private handleApiError(error: any): never {
    console.error("API Error:", error);
    this.useFallback = true;
    if (axios.isAxiosError(error) && !error.response) {
      throw new Error("Cannot connect to auction server. Please try again later.");
    }
    throw error;
  }

  // Get all active auction items
  async getActiveItems(): Promise<AuctionItem[]> {
    try {
      if (this.useFallback) {
        console.log("Using fallback data for active items");
        const now = new Date().toISOString();
        return FALLBACK_AUCTIONS.filter(item => 
          item.start_time <= now && item.end_time > now
        );
      }

      const response = await axios.get(`${API_URL}/api/items?status=true`);
      return response.data;
    } catch (error) {
      console.error("Error fetching active items:", error);
      this.useFallback = true;
      
      // Return filtered mock data for active items
      const now = new Date().toISOString();
      return FALLBACK_AUCTIONS.filter(item => 
        item.status === "active" || (item.start_time <= now && item.end_time > now)
      );
    }
  }

  // Get a specific auction item by ID
  async getItem(itemId: number): Promise<AuctionItem> {
    try {
      if (this.useFallback) {
        const item = FALLBACK_AUCTIONS.find(item => item.item_id === itemId);
        if (!item) {
          throw new Error(`Item with ID ${itemId} not found`);
        }
        return item;
      }

      const response = await axios.get(`${API_URL}/api/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching item ${itemId}:`, error);
      
      const item = FALLBACK_AUCTIONS.find(item => item.item_id === itemId);
      if (!item) {
        throw new Error(`Item with ID ${itemId} not found`);
      }
      return item;
    }
  }

  // Get bids for a specific auction item
  async getItemBids(itemId: number): Promise<Bid[]> {
    try {
      if (this.useFallback) {
        return FALLBACK_BIDS[itemId] || [];
      }

      const response = await axios.get(`${API_URL}/api/items/${itemId}/bids`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bids for item ${itemId}:`, error);
      return FALLBACK_BIDS[itemId] || [];
    }
  }

  // Place a bid on an auction item
  async placeBid(itemId: number, amount: number): Promise<void> {
    try {
      if (this.useFallback) {
        // Find auction to update
        const auction = FALLBACK_AUCTIONS.find(a => a.item_id === itemId);
        if (!auction) {
          throw new Error(`Auction with ID ${itemId} not found`);
        }

        if (auction.status === "completed") {
          throw new Error("Cannot bid on a completed auction");
        }

        if (amount <= (auction.current_bid || 0)) {
          throw new Error(`Bid must be higher than current bid: ${auction.current_bid || 0}`);
        }

        // Update the current bid
        auction.current_bid = amount;

        // Add to bid history
        if (!FALLBACK_BIDS[itemId]) {
          FALLBACK_BIDS[itemId] = [];
        }

        const newBid = {
          bid_id: Math.max(0, ...FALLBACK_BIDS[itemId].map(b => b.bid_id || 0)) + 1,
          item_id: itemId,
          user_id: 1, // Current user
          bid_amount: amount,
          bid_time: new Date().toISOString(),
          user_name: "You"
        };

        FALLBACK_BIDS[itemId].unshift(newBid);
        return;
      }

      await axios.post(`${API_URL}/user_bid/${itemId}`, { user_bid: amount }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      if (!this.useFallback && axios.isAxiosError(error) && !error.response) {
        this.useFallback = true;
        return this.placeBid(itemId, amount);
      }

      console.error(`Error placing bid for item ${itemId}:`, error);
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          throw new Error("Cannot connect to auction server. Please try again later.");
        }
        if (error.response.status === 413) {
          throw new Error("The auction has ended.");
        }
        if (error.response.status === 400) {
          throw new Error(error.response.data?.detail?.[0]?.msg || "Bid must be higher than current bid.");
        }
      }
      throw error;
    }
  }

  // Create a new auction item (admin only)
  async createItem(itemData: Partial<AuctionItem>, token: string): Promise<AuctionItem> {
    try {
      if (this.useFallback) {
        const newItem: AuctionItem = {
          item_id: Math.max(...FALLBACK_AUCTIONS.map(a => a.item_id)) + 1,
          name: itemData.name || 'New Item',
          start_time: itemData.start_time || new Date().toISOString(),
          end_time: itemData.end_time || new Date(Date.now() + 86400000).toISOString(),
          current_bid: null,
          start_price: itemData.start_price || 100,
          status: 'active',
          user_id: 1,
          won_by: null
        };
        
        FALLBACK_AUCTIONS.push(newItem);
        return newItem;
      }

      const response = await axios.post(`${API_URL}/api/items`, itemData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (!this.useFallback && axios.isAxiosError(error) && !error.response) {
        this.useFallback = true;
        return this.createItem(itemData, token);
      }
      
      console.error('Error creating auction item:', error);
      if (axios.isAxiosError(error) && !error.response) {
        throw new Error("Cannot connect to auction server. Please try again later.");
      }
      throw error;
    }
  }

  /**
   * Get auction items with optional filters
   */
  async getItems(filters?: AuctionFilters): Promise<AuctionItem[]> {
    try {
      if (this.useFallback) {
        let items = [...FALLBACK_AUCTIONS];
        
        // Apply filters
        if (filters) {
          if (filters.status) {
            items = items.filter(item => item.status === filters.status);
          }
          if (filters.minPrice) {
            items = items.filter(item => 
              (item.current_bid || item.start_price) >= (filters.minPrice || 0)
            );
          }
          if (filters.maxPrice) {
            items = items.filter(item => 
              (item.current_bid || item.start_price) <= (filters.maxPrice || Infinity)
            );
          }
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            items = items.filter(item => 
              item.name.toLowerCase().includes(searchLower) || 
              (item.description || '').toLowerCase().includes(searchLower)
            );
          }
        }
        
        return items;
      }

      const response = await axios.get(`${API_URL}/api/items`, { params: filters });
      return response.data;
    } catch (error) {
      if (!this.useFallback && axios.isAxiosError(error) && !error.response) {
        this.useFallback = true;
        return this.getItems(filters);
      }
      
      console.error('Error fetching items:', error);
      this.useFallback = true;
      return this.getItems(filters);
    }
  }

  /**
   * Get bid history for an item
   */
  async getBidHistory(itemId: number): Promise<Bid[]> {
    try {
      if (this.useFallback) {
        return FALLBACK_BIDS[itemId] || [];
      }

      const response = await axios.get(`${API_URL}/bid_history/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bid history for item ${itemId}:`, error);
      return FALLBACK_BIDS[itemId] || [];
    }
  }

  /**
   * Update an auction item (admin only)
   */
  async updateItem(itemId: number, item: UpdateItemRequest): Promise<AuctionItem> {
    try {
      if (this.useFallback) {
        const existingItemIndex = FALLBACK_AUCTIONS.findIndex(a => a.item_id === itemId);
        if (existingItemIndex === -1) {
          throw new Error(`Item with ID ${itemId} not found`);
        }
        
        const updatedItem = {
          ...FALLBACK_AUCTIONS[existingItemIndex],
          name: item.item_name,
          start_time: item.start_time,
          end_time: item.end_time,
          start_price: item.start_price,
          current_bid: item.current_bid,
          user_id: item.user_id,
          status: item.status ? 'active' : 'completed',
          won_by: item.won_by
        };
        
        FALLBACK_AUCTIONS[existingItemIndex] = updatedItem;
        return updatedItem;
      }

      const response = await axios.put(`${API_URL}/api/items/${itemId}`, item, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      if (!this.useFallback && axios.isAxiosError(error) && !error.response) {
        this.useFallback = true;
        return this.updateItem(itemId, item);
      }
      
      console.error(`Error updating item ${itemId}:`, error);
      if (axios.isAxiosError(error) && !error.response) {
        throw new Error("Cannot connect to auction server. Please try again later.");
      }
      throw error;
    }
  }

  /**
   * Delete an auction item (admin only)
   */
  async deleteItem(itemId: number): Promise<boolean> {
    try {
      if (this.useFallback) {
        const index = FALLBACK_AUCTIONS.findIndex(a => a.item_id === itemId);
        if (index === -1) {
          throw new Error(`Item with ID ${itemId} not found`);
        }
        
        FALLBACK_AUCTIONS.splice(index, 1);
        return true;
      }

      await axios.delete(`${API_URL}/api/items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return true;
    } catch (error) {
      if (!this.useFallback && axios.isAxiosError(error) && !error.response) {
        this.useFallback = true;
        return this.deleteItem(itemId);
      }
      
      console.error(`Error deleting item ${itemId}:`, error);
      if (axios.isAxiosError(error) && !error.response) {
        throw new Error("Cannot connect to auction server. Please try again later.");
      }
      throw error;
    }
  }

  /**
   * Get the winner of an auction
   */
  async getAuctionWinner(itemId: number): Promise<any> {
    try {
      if (this.useFallback) {
        const item = FALLBACK_AUCTIONS.find(item => item.item_id === itemId);
        
        if (!item || !item.won_by || item.status !== 'completed') {
          return null;
        }
        
        // Mock winner data
        return {
          name: "Jane Doe",
          email: "jane.doe@example.com"
        };
      }

      const response = await axios.get(`${API_URL}/get_auction_winner/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      if (!this.useFallback && axios.isAxiosError(error) && !error.response) {
        this.useFallback = true;
        return this.getAuctionWinner(itemId);
      }
      
      console.error(`Error fetching winner for item ${itemId}:`, error);
      if (axios.isAxiosError(error) && !error.response) {
        throw new Error("Cannot connect to auction server. Please try again later.");
      }
      throw error;
    }
  }

  // Force fallback mode for testing
  setFallbackMode(enabled: boolean): void {
    this.useFallback = enabled;
  }
}

export const auctionService = new AuctionService();

// Automatically set fallback mode if we detect the API server is down
setTimeout(() => {
  axios.get(`${API_URL}/health`).catch(() => {
    console.log("Server appears to be down, enabling fallback mode");
    auctionService.setFallbackMode(true);
  });
}, 100); 