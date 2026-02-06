import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { DateSelectorComponent } from '../date-selector/date-selector.component';
import { FormsModule } from '@angular/forms';
import { CreateOrderRequest } from '../../../core/models/product.model';

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
          <!-- Left: Items & Customer Info -->
          <div class="main-column">
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
                       <span>x {{ item.quantity }}</span> 
                       <div class="price">{{ item.price * item.quantity | currency:'USD' }}</div>
                    </div>
                  </div>
                }
             </div>

             <!-- Simple Customer Form -->
             <div class="customer-form glass-panel">
                <h2>Your Details</h2>
                <div class="form-group">
                   <label>Name</label>
                   <input [(ngModel)]="customerName" placeholder="Full Name">
                </div>
                <div class="form-group">
                   <label>Email</label>
                   <input [(ngModel)]="customerEmail" placeholder="email@example.com">
                </div>
             </div>
          </div>

          <!-- Right: Summary & Schedule -->
          <div class="summary glass-panel">
            <h2>Order Summary</h2>
            
            <div class="totals">
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
            }

            <button class="btn-primary full-width" 
              [disabled]="(cart.hasMakeToOrderItems() && !selectedDeliveryDate()) || !customerName || !customerEmail || isSubmitting()"
              (click)="placeOrder()">
              @if (isSubmitting()) { 
                Processing... 
              } @else {
                Place Order
              }
            </button>
            
            @if (errorMessage()) {
                <div class="error-banner">{{ errorMessage() }}</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-container { max-width: 1000px; margin: 0 auto; }
    h1 { color: var(--color-secondary); margin-bottom: var(--spacing-lg); }
    .grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--spacing-lg); align-items: start; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    
    .glass-panel { padding: var(--spacing-lg); background: white; margin-bottom: var(--spacing-lg); }
    
    .cart-item { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: var(--spacing-sm) 0; }
    .details h4 { margin: 0; color: var(--color-text-main); }
    .meta { font-size: 0.8rem; color: #888; }
    
    .customer-form {
        .form-group {
            margin-bottom: 1rem;
            label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
            input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
        }
    }
    
    .btn-primary.full-width { width: 100%; margin-top: var(--spacing-lg); justify-content: center; }
    .error-banner { margin-top: 10px; color: #d93025; background: #fce8e6; padding: 10px; border-radius: 8px; font-size: 0.9rem; }
    .qty-price { text-align: right; }
  `]
})
export class CheckoutPageComponent {
  cart = inject(CartService);
  orderService = inject(OrderService);
  router = inject(Router);

  selectedDeliveryDate = signal<string | null>(null);
  customerName = '';
  customerEmail = '';
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  objectKeys(obj: any): string[] { return Object.keys(obj); }
  onDateSelected(date: string) { this.selectedDeliveryDate.set(date); }

  placeOrder() {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const orderRequest: CreateOrderRequest = {
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      deliveryDate: this.selectedDeliveryDate() || undefined, // Backend might expect null/undefined if not applicable? Actually logic dictates Type B needs it.
      items: this.cart.cartItems().map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        customizationData: i.customizationData
      }))
    };

    this.orderService.placeOrder(orderRequest).subscribe({
      next: (res) => {
        alert(`Order Placed Successfully! ID: ${res.orderId}`);
        this.cart.clearCart();
        this.router.navigate(['/catalog']); // Redirect to catalog (or success page if I had one)
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Sorry, the selected slot just filled up! Please try another date.');
          // Ideally trigger validation refresh here
        } else {
          this.errorMessage.set('Something went wrong. Please try again.');
        }
      }
    });
  }
}
