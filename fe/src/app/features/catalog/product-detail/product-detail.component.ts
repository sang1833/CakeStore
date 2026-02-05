import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product, MakeToOrderProduct } from '../../../core/models/product.model';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
    template: `
    @if (product(); as p) {
      <div class="detail-container glass-panel animate-fade-in">
        <!-- Visuals -->
        <div class="image-section">
           <img [src]="p.imageUrl || 'assets/placeholder-cake.jpg'" [alt]="p.name">
        </div>

        <!-- Info & Actions -->
        <div class="info-section">
          <h1>{{ p.name }}</h1>
          <p class="price">{{ p.price | currency:'USD' }}</p>
          <p class="description">{{ p.description || 'A delicious handcrafted delight.' }}</p>

          <div class="divider"></div>

          <!-- Type A: Simple Add -->
          @if (p.type === 'ReadyToShip') {
            <div class="stock-info">
              <span class="stock-badge">In Stock</span>
            </div>
            <button class="btn-primary" (click)="addToCart(p)">
              Add to Cart
            </button>
          }

          <!-- Type B: Dynamic Form -->
          @if (p.type === 'MakeToOrder') {
            <form [formGroup]="customizationForm" (ngSubmit)="addToCart(p)">
              <h3>Customize Your Order</h3>
              
              <!-- Dynamic Fields based on Schema -->
              @for (key of getSchemaKeys(p); track key) {
                <div class="form-group">
                  <label>{{ key | titlecase }}</label>
                  
                  @let options = getSchemaOptions(p, key);
                  
                  @if (options) {
                    <!-- Select -->
                    <select [formControlName]="key">
                      @for (opt of options; track opt) {
                        <option [value]="opt">{{ opt }}</option>
                      }
                    </select>
                  } @else {
                    <!-- Text Input -->
                    <input type="text" [formControlName]="key" placeholder="Enter {{key}}">
                  }
                </div>
              }

              <!-- Inscription Logic (Specific Requirement) -->
              <div class="form-group">
                <label>Inscription (Max 30 chars)</label>
                <input type="text" formControlName="inscription" maxlength="30" placeholder="Happy Birthday...">
                @if (customizationForm.get('inscription')?.hasError('maxlength')) {
                  <small class="error">Too long! Max 30 chars.</small>
                }
              </div>

              <button class="btn-primary full-width" [disabled]="customizationForm.invalid">
                Check Availability & Add
              </button>
            </form>
          }
        </div>
      </div>
    } @else {
      <div class="loading">Loading details...</div>
    }
  `,
    styles: [`
    .detail-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-xl);
      padding: var(--spacing-lg);
      margin-top: var(--spacing-lg);
      background: white;
    }

    .image-section img {
      width: 100%;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-soft);
    }

    .info-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    h1 { font-size: 2.5rem; color: var(--color-secondary); margin: 0; }
    .price { font-size: 1.5rem; color: var(--color-primary-dark); font-weight: 700; }
    .description { font-size: 1.1rem; line-height: 1.6; opacity: 0.8; }
    
    .divider { height: 1px; background: rgba(0,0,0,0.1); width: 100%; margin: var(--spacing-sm) 0; }

    /* Form Styles */
    form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      background: #FAFAFA;
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      label { font-weight: 600; font-size: 0.9rem; color: var(--color-secondary); }
      
      input, select {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-family: var(--font-body);
        &:focus { outline: 2px solid var(--color-primary); border-color: transparent; }
      }
    }

    .btn-primary.full-width { width: 100%; justify-content: center; }
    
    .error { color: var(--color-accent); font-size: 0.8rem; }
  `]
})
export class ProductDetailComponent {
    private route = inject(ActivatedRoute);
    private productService = inject(ProductService);
    private cartService = inject(CartService);
    private fb = inject(FormBuilder);

    // Get ID from Route
    // Note: params is an Observable. We want to switchMap or just subscribe.
    // Using toSignal on route.params is tricky if we want to chain.
    // Let's use standard signal effect pattern or RxJS.

    product = signal<Product | null>(null);
    customizationForm: FormGroup = this.fb.group({
        inscription: ['', [Validators.maxLength(30)]]
    });

    constructor() {
        // React to route changes
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.loadProduct(id);
            }
        });
    }

    loadProduct(id: string) {
        this.productService.getProductById(id).subscribe(p => {
            this.product.set(p);
            if (p.type === 'MakeToOrder') {
                this.initForm(p as MakeToOrderProduct);
            }
        });
    }

    initForm(p: MakeToOrderProduct) {
        // Dynamically add controls based on schema
        const schema = p.customizationSchema || {};
        Object.keys(schema).forEach(key => {
            this.customizationForm.addControl(key, this.fb.control('', Validators.required));
        });
    }

    getSchemaKeys(p: Product): string[] {
        if (p.type !== 'MakeToOrder') return [];
        const mto = p as MakeToOrderProduct;
        return mto.customizationSchema ? Object.keys(mto.customizationSchema) : [];
    }

    getSchemaOptions(p: Product, key: string): string[] | null {
        const mto = p as MakeToOrderProduct;
        const val = mto.customizationSchema[key];
        return Array.isArray(val) ? val : null;
    }

    addToCart(p: Product) {
        if (p.type === 'MakeToOrder') {
            if (this.customizationForm.invalid) return;
            const customData = this.customizationForm.value;
            this.cartService.addToCart(p, 1, customData);
        } else {
            this.cartService.addToCart(p);
        }
    }
}
