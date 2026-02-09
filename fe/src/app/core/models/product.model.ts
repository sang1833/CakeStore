export type ProductType = 'ReadyToShip' | 'MakeToOrder';

export interface Product {
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    type: ProductType;
    isActive: boolean;
}

export interface ReadyToShipProduct extends Product {
    type: 'ReadyToShip';
    stockQuantity: number;
    expiryDate?: string;
}

export interface MakeToOrderProduct extends Product {
    type: 'MakeToOrder';
    leadTimeHours: number;
    customizationSchema: Record<string, any>;
}

export interface CartItem {
    productId: string;
    productName: string; // Used for display, not sent to API for validation usually
    price: number;
    quantity: number;
    productType: ProductType;
    customizationData?: Record<string, any>;
}

export interface ValidateCartRequest {
    items: {
        productId: string;
        quantity: number;
    }[];
}

export interface ValidateCartResponse {
    isSlotAvailable: boolean;
    earliestAvailableDate: string; // DateOnly string YYYY-MM-DD
    message: string;
}

export interface OrderItemRequest {
    productId: string;
    quantity: number;
    customizationData?: Record<string, any>;
}

export interface CreateOrderRequest {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    deliveryDate?: string; // DateOnly string YYYY-MM-DD
    items: OrderItemRequest[];
}

export interface CreateOrderResponse {
    orderId: string;
    status: string;
    deliveryDate: string;
    totalAmount: number;
}
