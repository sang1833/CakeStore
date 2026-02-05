import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { DateSelectorComponent } from '../date-selector/date-selector.component';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-checkout-page',
    standalone: true,
    imports: [CommonModule, DateSelectorComponent, CurrencyPipe, RouterLink, FormsModule],
    template: `
    <div class="checkout-container animate-fade-in">
      <h1>Checkout</h1>

      @if (cart.count() === 0) {
        <div class="empty-state">
          <p>Your cart is empty.</p>
          <a routerLink="/catalog" class="btn-primary">Browse Sweets</a>
        </div>
      } @else {
        <div class="grid">
          <!-- Left: Items -->
          <div class="cart-items glass-panel">
            <h2>Your Selection</h2>
            @for (item of cart.cartItems(); track item.productId + item.customizationData) {
              <div class="cart-item">
                <div class="details">
                  <h4>{{ item.productName }}</h4>
                  <p class="meta">{{ item.productType === 'MakeToOrder' ? 'Pre-order' : 'Ready to Ship' }}</p>
                  @if (item.customizationData) {
                    <ul class="custom-list">
                      @for (key of objectKeys(item.customizationData); track key) {
                        <li><strong>{{ key }}:</strong> {{ item.customizationData[key] }}</li>
                      }
                    </ul>
                  }
                </div>
                <div class="qty-price">
                  <div class="qty-control">
                    <button (click)="updateQty(item, -1)">-</button>
                    <span>{{ item.quantity }}</span>
                    <button (click)="updateQty(item, 1)">+</button>
                  </div>
                  <div class="price">{{ item.price * item.quantity | currency:'USD' }}</div>
                </div>
              </div>
            }
          </div>

          <!-- Right: Summary & Schedule -->
          <div class="summary glass-panel">
            <h2>Order Summary</h2>
            
            <div class="totals">
              <div class="row">
                <span>Subtotal</span>
                <span>{{ cart.total() | currency:'USD' }}</span>
              </div>
              <div class="row total">
                <span>Total</span>
                <span>{{ cart.total() | currency:'USD' }}</span>
              </div>
            </div>

            <!-- Schedule Logic -->
            @if (cart.hasMakeToOrderItems()) {
              <div class="schedule-section">
                <app-date-selector 
                  [cartItems]="cart.cartItems()" 
                  (dateSelected)="onDateSelected($event)">
                </app-date-selector>
                
                @if (!selectedDeliveryDate()) {
                  <small class="error-text">Please select a delivery date.</small>
                }
              </div>
            } @else {
              <div class="info-box">
                <p>Standard Shipping (2-3 days)</p>
              </div>
            }

            <button class="btn-primary full-width" 
              [disabled]="cart.hasMakeToOrderItems() && !selectedDeliveryDate()"
              (click)="placeOrder()">
              Place Order
            </button>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .checkout-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    h1 { color: var(--color-secondary); margin-bottom: var(--spacing-lg); }

    .grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: var(--spacing-lg);
      align-items: start;
    }
    
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }

    .glass-panel {
      padding: var(--spacing-lg);
      background: white;
    }

    .cart-item {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #eee;
      padding: var(--spacing-sm) 0;
      
      &:last-child { border-bottom: none; }
    }

    .details h4 { margin: 0; color: var(--color-text-main); }
    .meta { font-size: 0.8rem; color: #888; margin: 4px 0; }
    .custom-list {
      list-style: none;
      padding: 0;
      font-size: 0.85rem;
      opacity: 0.9;
      li { margin-bottom: 2px; }
    }

    .qty-control {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 20px;
      
      button {
        border: none;
        background: none;
        cursor: pointer;
        font-weight: bold;
        width: 24px;
        &:hover { color: var(--color-primary); }
      }
    }

    .qty-price {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }

    .schedule-section {
      border-top: 1px solid #eee;
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
    }

    .btn-primary.full-width {
      width: 100%;
      margin-top: var(--spacing-lg);
      justify-content: center;
      
      &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }
    
    .error-text { color: var(--color-accent); display: block; margin-top: 5px; }

    .totals {
      margin-bottom: var(--spacing-md);
      .row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        &.total {
          font-weight: 700;
          font-size: 1.2rem;
          color: var(--color-primary-dark);
          border-top: 1px dashed #ddd;
          padding-top: 8px;
        }
      }
    }
  `]
})
export class CheckoutPageComponent {
    cart = inject(CartService);
    selectedDeliveryDate = signal<string | null>(null);

    objectKeys(obj: any): string[] {
        return Object.keys(obj);
    }

    updateQty(item: any, change: number) {
        this.cart.updateQuantity(item.productId, item.quantity + change, item.customizationData);
    }

    onDateSelected(date: string) {
        this.selectedDeliveryDate.set(date);
    }

    placeOrder() {
        alert('Order Placed! (Mock)');
        // Implementation: Call ApiService.placeOrder({ items, deliveryDate })
        this.cart.clearCart();
    }
}
