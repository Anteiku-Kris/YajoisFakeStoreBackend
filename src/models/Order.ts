export interface Order {
    id: string
    user_id: string
    status: "pending" | "paid" | "cancelled"
    total: number
    payment_method: string
    created_at: string
}