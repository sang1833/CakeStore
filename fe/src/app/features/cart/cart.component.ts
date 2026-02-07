import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../core/services/cart.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink, CurrencyPipe, TranslateModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="cart-page-container animate-fade-in">
        <h1>{{ 'CART.TITLE' | translate }}</h1>
        
        @if (cart.count() === 0) {
            <div class="empty-state glass-panel">
                <p>{{ 'CART.EMPTY' | translate }}</p>
                <a routerLink="/catalog" class="btn-primary">{{ 'CART.BROWSE' | translate }}</a>
            </div>
        } @else {
            <div class="cart-grid">
                <!-- Items List -->
                <div class="items-list">
                    @for (item of cart.cartItems(); track item.productId + item.customizationData) {
                        <div class="cart-row glass-panel">
                            <div class="info">
                                <h3>{{ item.productName }}</h3>
                                <p class="type-badge">
                                    {{ (item.productType === 'MakeToOrder' ? 'CART.PRE_ORDER' : 'CART.READY_SHIP') | translate }}
                                </p>
                                @if (item.customizationData) {
                                    <small class="custom-specs">
                                        {{ getCustomDetails(item.customizationData) }}
                                    </small>
                                }
                            </div>
                            
                            <div class="controls">
                                <div class="qty-control">
                                    <button (click)="decreaseQty(item)">-</button>
                                    <span>{{ item.quantity }}</span>
                                    <button (click)="increaseQty(item)">+</button>
                                </div>
                                <div class="price">
                                    {{ item.price * item.quantity | currency:'USD' }}
                                </div>
                            </div>
                        </div>
                    }
                </div>
                
                <!-- Summary -->
                <div class="summary-box glass-panel">
                    <h2>{{ 'CART.SUMMARY' | translate }}</h2>
                    <div class="row">
                        <span>{{ 'CART.ITEMS' | translate }}</span>
                        <span>{{ cart.count() }}</span>
                    </div>
                    <div class="row total">
                        <span>{{ 'CART.TOTAL' | translate }}</span>
                        <span>{{ cart.total() | currency:'USD' }}</span>
                    </div>
                    
                    <a routerLink="/checkout" class="btn-primary full-width">{{ 'CART.CHECKOUT' | translate }}</a>
                </div>
            </div>
        }
    </div>
  `,
    styles: [`
    .cart-page-container { max-width: 1000px; margin: 0 auto; }
    h1 { margin-bottom: 2rem; color: var(--color-secondary); }
    
    .empty-state { text-align: center; padding: 4rem; }
    
    .cart-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
        align-items: start;
        
        @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    
    .cart-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .info {
        h3 { margin: 0 0 5px 0; font-size: 1.1rem; }
        .type-badge { font-size: 0.8rem; color: #888; text-transform: uppercase; margin: 0; }
        .custom-specs { display: block; margin-top: 5px; color: var(--color-primary-dark); font-style: italic; }
    }
    
    .controls {
        display: flex;
        align-items: center;
        gap: 2rem;
    }
    
    .qty-control {
        display: flex;
        align-items: center;
        border: 1px solid #ddd;
        border-radius: 20px;
        overflow: hidden;
        
        button {
            border: none;
            background: #f9f9f9;
            width: 30px;
            height: 30px;
            cursor: pointer;
            &:hover { background: #eee; }
        }
        
        span { padding: 0 10px; font-weight: 600; font-size: 0.9rem; }
    }
    
    .price { font-weight: 700; font-family: var(--font-header); font-size: 1.1rem; min-width: 80px; text-align: right; }
    
    .summary-box {
        padding: 2rem;
        
        h2 { margin-top: 0; }
        .row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: #666; }
        .row.total { font-weight: 700; color: var(--color-secondary); font-size: 1.2rem; border-top: 2px solid #eee; padding-top: 1rem; margin-top: 1rem; }
        
        .btn-primary.full-width {
            display: flex;
            justify-content: center;
            width: 100%;
            text-decoration: none;
            margin-top: 1.5rem;
            box-sizing: border-box;
        }
    }
  `]
})
export class CartComponent {
    cart = inject(CartService);

    getCustomDetails(data: any): string {
        return Object.values(data).join(', ');
    }

    increaseQty(item: any) {
        this.cart.updateQuantity(item.productId, item.quantity + 1, item.customizationData);
    }

    decreaseQty(item: any) {
        this.cart.updateQuantity(item.productId, item.quantity - 1, item.customizationData);
    }
}
