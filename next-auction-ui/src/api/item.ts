import { getAuthHeader } from '../utils/auth';

// API base URL from environment or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Item {
  item_id: number;
  name: string;
  start_time: string;
  end_time: string;
  current_bid: number;
  user_id: number;
  status: 'active' | 'closed';
  start_price: number;
  won_by: number | null;
  description?: string;
  image_url?: string;
}

export interface Bid {
  bid_id: number;
  item_id: number;
  user_id: number;
  bid_amount: number;
  bid_time: string;
  user_name?: string;
}

export interface CreateItemData {
  name: string;
  description?: string;
  start_price: number;
  start_time: string;
  end_time: string;
  image_url?: string;
}

export interface UpdateItemData {
  name?: string;
  description?: string;
  start_price?: number;
  start_time?: string;
  end_time?: string;
  status?: 'active' | 'closed';
  image_url?: string;
}

/**
 * Get all auction items
 */
export const getItems = async (status?: 'active' | 'closed'): Promise<Item[]> => {
  try {
    const url = status 
      ? `${API_BASE_URL}/items?status=${status}` 
      : `${API_BASE_URL}/items`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch items');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};

/**
 * Get a specific item by ID
 */
export const getItemById = async (itemId: number): Promise<Item> => {
  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch item');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Create a new auction item
 */
export const createItem = async (itemData: CreateItemData): Promise<Item> => {
  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create item');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

/**
 * Update an existing auction item
 */
export const updateItem = async (itemId: number, itemData: UpdateItemData): Promise<Item> => {
  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update item');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Delete an auction item
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
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete item');
    }
  } catch (error) {
    console.error(`Error deleting item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Place a bid on an auction item
 */
export const placeBid = async (itemId: number, bidAmount: number): Promise<Bid> => {
  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ bid_amount: bidAmount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to place bid');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error placing bid on item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Get bids for a specific item
 */
export const getItemBids = async (itemId: number): Promise<Bid[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/bids`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch item bids');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching bids for item ${itemId}:`, error);
    throw error;
  }
}; 