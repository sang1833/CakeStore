import { Component, Input, Output, EventEmitter, signal, OnChanges } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, TranslateModule],
  template: `
      <!-- Image Area -->
      <div [ngClass]="{'glass-panel animate-fade-in': true}" class="image-wrapper">
        <img 
          [routerLink]="['/products', product.id]" 
          [src]="imageSrc()" 
          (error)="onImageError()"
          [alt]="product.name">
        <div class="badge" [class.type-a]="product.type === 'ReadyToShip'" [class.type-b]="product.type === 'MakeToOrder'">
          {{ (product.type === 'ReadyToShip' ? 'CATALOG.READY_TO_SHIP' : 'CATALOG.PRE_ORDER') | translate }}
        </div>
      </div>

      <!-- Content -->
      <div class="content">
        <h3 [routerLink]="['/products', product.id]" class="clickable-title">{{ product.name }}</h3>
        <p class="price">{{ product.price | currency:'USD' }}</p>
        
        <!-- Action Buttons -->
        <div class="actions">
          @if (product.type === 'ReadyToShip') {
            <div class="button-group">
                <a [routerLink]="['/products', product.id]" class="btn-secondary small">
                    {{ 'CATALOG.VIEW' | translate }}
                </a>
                <button class="btn-primary" (click)="addToCart.emit(product)">
                  {{ 'CATALOG.ADD_TO_CART' | translate }} 🛒
                </button>
            </div>
          } @else {
            <a [routerLink]="['/products', product.id]" class="btn-secondary full-width">
              {{ 'CATALOG.CUSTOMIZE' | translate }} 🎨
            </a>
          }
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
      background: white;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-card);
      }
    }

    .clickable-title {
        cursor: pointer;
        &:hover { color: var(--color-primary); }
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
      z-index: 2;
      
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

    .button-group {
        display: flex;
        gap: 8px;
        justify-content: center;
        
        .btn-primary { flex: 2; font-size: 0.9rem; padding: 10px; }
        .btn-secondary { flex: 1; font-size: 0.9rem; padding: 10px; }
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
      text-decoration: none;
      
      &:hover {
        background: var(--color-secondary);
        color: white;
      }

      &.full-width { display: block; width: 100%; box-sizing: border-box; }
    }
  `]
})
export class ProductCardComponent implements OnChanges {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  imageSrc = signal<string>('');

  ngOnChanges() {
    let imgUrl;
    if (this.product.imageUrl) {
      imgUrl = this.product.imageUrl;
    } else {
      imgUrl = 'assets/placeholder-cake.png';
    }
    this.imageSrc.set(imgUrl);
  }

  onImageError() {
    this.imageSrc.set('assets/placeholder-cake.png');
  }
}

