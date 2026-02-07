import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="history-container animate-fade-in">
      <h1>{{ 'ORDER.TITLE' | translate }}</h1>
      
      <div class="orders-list">
        @if (loading()) {
            <p>{{ 'common.loading' | translate }}</p>
        } @else {
            @for (order of orders(); track order.id) {
            <div class="order-card glass-panel">
            <div class="order-header">
              <div>
                <span class="order-id">#{{ order.id }}</span>
                <span class="order-date">{{ order.date | date:'mediumDate' }}</span>
              </div>
              <span class="status" [class]="order.status.toLowerCase()">
                {{ 'ORDER.STATUS_' + order.status.toUpperCase() | translate }}
              </span>
            </div>
            
            <div class="order-items">
              @for (item of order.items; track item.name) {
                <div class="item">
                  <span>{{ item.name }} (x{{ item.qty }})</span>
                  <span>{{ item.price }}</span>
                </div>
              }
            </div>
            
            <div class="order-footer">
              <div class="total">{{ 'ORDER.TOTAL' | translate }}: <strong>{{ order.total }}</strong></div>
              <button class="btn-secondary small">{{ 'ORDER.REORDER' | translate }}</button>
            </div>
          </div>
            }
        }
      </div>

      <div class="back-link">
        <a routerLink="/profile">← {{ 'AUTH.WELCOME_BACK' | translate }}</a>
      </div>
    </div>
  `,
  styles: [`
    .history-container { max-width: 800px; margin: 0 auto; }
    h1 { color: var(--color-secondary); margin-bottom: 2rem; }
    
    .order-card { padding: 1.5rem; margin-bottom: 1.5rem; }
    
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
      margin-bottom: 1rem;
      
      .order-id { font-weight: 700; color: var(--color-primary-dark); margin-right: 1rem; }
      .order-date { color: #888; font-size: 0.9rem; }
    }
    
    .status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: capitalize;
      
      &.delivered { background: #e6f9e6; color: #2ecc71; }
      &.processing { background: #eaf2ff; color: #3498db; }
      &.pending { background: #fff8e6; color: #f39c12; }
    }
    
    .order-items {
      margin-bottom: 1rem;
      .item { display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: var(--color-text-main); }
    }
    
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px dashed #ddd;
    }
    
    .back-link {
      margin-top: 2rem;
      a { color: var(--color-primary-dark); text-decoration: none; }
    }
  `]
})
export class OrderHistoryComponent {
  orderService = inject(OrderService);
  loading = signal(true);
  orders = signal<any[]>([]);

  constructor() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.orderService.getOrdersByUser().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.loading.set(false);
      }
    });
  }
}
