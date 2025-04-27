export interface User {
  user_id: number;
  email_id: string;
  user_type: string;
}

export interface Item {
  item_id: number;
  name: string;
  current_bid: number;
  start_price: number;
  end_time: string;
  start_time: string;
  status: boolean;
  won_by: number | null;
}

export interface Bid {
  bid_id: number;
  item_id: number;
  user_id: number;
  bid_amount: number;
  bid_time: string;
}
