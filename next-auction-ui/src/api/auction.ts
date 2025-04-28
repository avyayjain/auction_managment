import { getAuthHeader } from '../utils/auth';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Interface definitions
export interface Item {
  item_id: number;
  name: string;
  start_time: string;
  end_time: string;
  current_bid: number;
  user_id: number;
  status: 'active' | 'completed' | 'upcoming';
  start_price: number;
  won_by: number | null;
}

export interface Bid {
  bid_id: number;
  item_id: number;
  user_id: number;
  bid_amount: number;
  bid_time: string;
}

/**
 * Fetch all auction items
 */
export const fetchItems = async (): Promise<Item[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching items: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch items:', error);
    throw error;
  }
};

/**
 * Fetch a single auction item by ID
 */
export const fetchItemById = async (itemId: number): Promise<Item> => {
  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching item: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Place a bid on an auction item
 */
export const placeBid = async (itemId: number, bidAmount: number): Promise<Bid> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        item_id: itemId,
        bid_amount: bidAmount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Error placing bid: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to place bid:', error);
    throw error;
  }
};

/**
 * Fetch bid history for an item
 */
export const fetchBidHistory = async (itemId: number): Promise<Bid[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/bids`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching bid history: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch bid history:', error);
    throw error;
  }
};

/**
 * Create a new auction item (admin only)
 */
export const createItem = async (item: Omit<Item, 'item_id' | 'current_bid' | 'status' | 'won_by'>): Promise<Item> => {
  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error(`Error creating item: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create item:', error);
    throw error;
  }
};

/**
 * Update an auction item (admin only)
 */
export const updateItem = async (itemId: number, item: Partial<Item>): Promise<Item> => {
  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error(`Error updating item: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update item:', error);
    throw error;
  }
};

/**
 * Delete an auction item (admin only)
 */
export const deleteItem = async (itemId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`Error deleting item: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
}; 