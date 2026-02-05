export type ProductType = 'ReadyToShip' | 'MakeToOrder';

export interface Product {
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    type: ProductType;
}

export interface ReadyToShipProduct extends Product {
    type: 'ReadyToShip';
    stockQuantity: number;
    expiryDate?: string;
}

export interface MakeToOrderProduct extends Product {
    type: 'MakeToOrder';
    leadTimeHours: number;
    // JSON schema for the form (e.g., { "size": ["6inch", "8inch"], "message": "text" })
    customizationSchema: Record<string, any>;
}

export interface CartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    productType: ProductType;
    // For MakeToOrder items
    customizationData?: Record<string, any>;
}

export interface ProductionSlot {
    date: string; // DateOnly string YYYY-MM-DD
    maxCapacity: number;
    reservedCapacity: number;
    availableCapacity: number;
}
