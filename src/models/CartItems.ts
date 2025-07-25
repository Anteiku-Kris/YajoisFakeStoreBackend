export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
}
export interface CartItemWithProduct {
  id: string;
  quantity: number;
  product_id: string;
  products: {
    name: string;
    price: number;
  }[];
}


