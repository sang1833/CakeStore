import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    template: `
    <header class="glass-panel">
      <div class="container">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <span class="logo-icon">🍰</span>
          <span class="logo-text">La Patisserie</span>
        </a>

        <!-- Navigation -->
        <nav>
          <a routerLink="/catalog" routerLinkActive="active">Catalog</a>
          <a routerLink="/about" routerLinkActive="active">Our Story</a>
        </nav>

        <!-- Actions -->
        <div class="actions">
          <button class="cart-btn" (click)="toggleCart()">
            <span class="icon">🛒</span>
            @if (cart.count() > 0) {
              <span class="badge animate-fade-in">{{ cart.count() }}</span>
            }
          </button>
        </div>
      </div>
    </header>
  `,
    styles: [`
    :host {
      display: block;
      position: sticky;
      top: var(--spacing-sm);
      z-index: 1000;
      padding: 0 var(--spacing-sm);
    }

    .glass-panel {
      padding: var(--spacing-sm) var(--spacing-lg);
      display: flex;
      justify-content: center;
    }

    .container {
      width: 100%;
      max-width: 1200px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-header);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-secondary);
      
      .logo-icon { font-size: 1.8rem; }
    }

    nav {
      display: flex;
      gap: var(--spacing-lg);

      a {
        font-weight: 500;
        color: var(--color-text-main);
        position: relative;
        opacity: 0.7;

        &:hover, &.active {
          opacity: 1;
          color: var(--color-secondary);
        }

        &.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--color-primary);
          border-radius: 2px;
        }
      }
    }

    .cart-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      position: relative;
      cursor: pointer;
      padding: 0.5rem;
      transition: transform 0.2s;

      &:hover { transform: scale(1.1); }

      .badge {
        position: absolute;
        top: 0;
        right: 0;
        background: var(--color-accent);
        color: white;
        font-size: 0.75rem;
        font-weight: bold;
        min-width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
      }
    }
  `]
})
export class HeaderComponent {
    cart = inject(CartService);

    toggleCart() {
        console.log('Toggle Cart Drawer'); // Todo: Implement Drawer
    }
}
