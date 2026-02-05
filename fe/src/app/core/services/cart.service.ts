import { Injectable, computed, signal, effect } from '@angular/core';
import { CartItem, Product, ProductType } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    // Core Signal
    readonly cartItems = signal<CartItem[]>([]);

    // Computed Signals
    readonly count = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
    readonly total = computed(() => this.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0));

    // Check if cart contains any "MakeToOrder" items which require scheduling
    readonly hasMakeToOrderItems = computed(() =>
        this.cartItems().some(item => item.productType === 'MakeToOrder')
    );

    constructor() {
        // Load from localStorage on init
        const savedCart = localStorage.getItem('cake_cart');
        if (savedCart) {
            this.cartItems.set(JSON.parse(savedCart));
        }

        // Persist to localStorage whenever cart changes
        effect(() => {
            localStorage.setItem('cake_cart', JSON.stringify(this.cartItems()));
        });
    }

    addToCart(product: Product, quantity: number = 1, customizationData?: Record<string, any>) {
        this.cartItems.update(items => {
            // Logic: For ReadyToShip, we can group by ID.
            // For MakeToOrder, we must group by ID + Customization equality (simplified here to just unique entry for now if custom)

            const existingItemIndex = items.findIndex(item =>
                item.productId === product.id &&
                JSON.stringify(item.customizationData) === JSON.stringify(customizationData)
            );

            if (existingItemIndex > -1) {
                // Clone and update
                const newItems = [...items];
                newItems[existingItemIndex].quantity += quantity;
                return newItems;
            } else {
                // Add new
                return [...items, {
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                    quantity,
                    productType: product.type,
                    customizationData
                }];
            }
        });
    }

    removeFromCart(productId: string, customizationData?: Record<string, any>) {
        this.cartItems.update(items =>
            items.filter(item =>
                !(item.productId === productId && JSON.stringify(item.customizationData) === JSON.stringify(customizationData))
            )
        );
    }

    updateQuantity(productId: string, quantity: number, customizationData?: Record<string, any>) {
        if (quantity <= 0) {
            this.removeFromCart(productId, customizationData);
            return;
        }

        this.cartItems.update(items => {
            return items.map(item => {
                if (item.productId === productId && JSON.stringify(item.customizationData) === JSON.stringify(customizationData)) {
                    return { ...item, quantity };
                }
                return item;
            });
        });
    }

    clearCart() {
        this.cartItems.set([]);
    }
}
