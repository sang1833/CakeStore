import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, RouterLink, CurrencyPipe],
    template: `
    <div class="card glass-panel" [class.make-to-order]="product.type === 'MakeToOrder'">
      <!-- Image Area -->
      <div class="image-wrapper">
        <img [src]="product.imageUrl || 'assets/placeholder-cake.jpg'" [alt]="product.name">
        <div class="badge" [class.type-a]="product.type === 'ReadyToShip'" [class.type-b]="product.type === 'MakeToOrder'">
          {{ product.type === 'ReadyToShip' ? 'Ready to Ship' : 'Pre-order' }}
        </div>
      </div>

      <!-- Content -->
      <div class="content">
        <h3>{{ product.name }}</h3>
        <p class="price">{{ product.price | currency:'USD' }}</p>
        
        <!-- Action Buttons -->
        <div class="actions">
          @if (product.type === 'ReadyToShip') {
            <button class="btn-primary" (click)="addToCart.emit(product)">
              Add to Cart 🛒
            </button>
          } @else {
            <a [routerLink]="['/products', product.id]" class="btn-secondary">
              Customize 🎨
            </a>
          }
        </div>
      </div>
    </div>
  `,
    styles: [`
    .card {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      background: white; /* Fallback */
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-card);
      }
    }

    .image-wrapper {
      position: relative;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }
    }

    .badge {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 12px;
      border-radius: var(--radius-pill);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      &.type-a { background: var(--color-primary); color: white; }
      &.type-b { background: var(--color-secondary); color: white; }
    }

    .content {
      padding: var(--spacing-md);
      display: flex;
      flex-direction: column;
      flex: 1;
      text-align: center;
    }

    h3 {
      font-size: 1.25rem;
      margin-bottom: var(--spacing-xs);
      color: var(--color-text-main);
    }

    .price {
      font-family: var(--font-header);
      font-size: 1.1rem;
      color: var(--color-primary-dark);
      font-weight: 700;
      margin-bottom: var(--spacing-sm);
    }

    .actions {
      margin-top: auto;
    }

    .btn-secondary {
      display: inline-block;
      padding: 10px 24px;
      border: 2px solid var(--color-secondary);
      border-radius: var(--radius-pill);
      color: var(--color-secondary);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.8rem;
      
      &:hover {
        background: var(--color-secondary);
        color: white;
      }
    }
  `]
})
export class ProductCardComponent {
    @Input({ required: true }) product!: Product;
    @Output() addToCart = new EventEmitter<Product>();
}
