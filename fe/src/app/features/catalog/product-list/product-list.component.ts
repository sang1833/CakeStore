import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../../../core/models/product.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, TranslateModule],
  template: `
    <div class="hero animate-fade-in">
      <h1>{{ 'CATALOG.HERO_TITLE' | translate }}</h1>
      <p>{{ 'CATALOG.HERO_SUBTITLE' | translate }}</p>
    </div>
    
    <div class="grid">
      @for (product of products(); track product.id) {
        <app-product-card 
          [product]="product" 
          (addToCart)="onAddToCart($event)" 
          class="animate-fade-in"
          [style.animation-delay]="($index * 100) + 'ms'">
        </app-product-card>
      } @empty {
        <!-- Skeleton / Empty State -->
        <div class="loading-state">
           <p>{{ 'CATALOG.LOADING' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .hero {
      text-align: center;
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg) 0;
      
      h1 { 
        font-size: 3rem; 
        color: var(--color-secondary); 
        margin-bottom: var(--spacing-sm);
      }
      p { 
        color: var(--color-text-main); 
        font-size: 1.2rem; 
        opacity: 0.8; 
        font-family: var(--font-header);
        font-style: italic;
      }
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--spacing-lg);
      padding-bottom: var(--spacing-xl);
    }

    .loading-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: var(--spacing-xl);
      color: var(--color-secondary);
      font-size: 1.2rem;
    }
  `]
})
export class ProductListComponent {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  translate = inject(TranslateService);

  // Convert Observable to Signal
  products = toSignal(this.productService.getProducts(), { initialValue: [] });

  onAddToCart(product: Product) {
    this.cartService.addToCart(product);
    // Todo: Add Toast Notification
    console.log('Added to cart:', product.name);
  }
}
