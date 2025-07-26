export interface UserPurchaseHistory {
  order_id: string;
  user_id: string;
  order_date: string;
  product_name: string;
  price: number;
  quantity: number;
  rating: number | null;
  comment: string | null;
}
