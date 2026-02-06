import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  template: `
    <header class="glass-panel">
      <div class="container">
        <!-- Logo -->
        <a routerLink="/" class="logo" (click)="closeMenu()">
          <span class="logo-icon">🍰</span>
          <span class="logo-text">Banh Ngot</span>
        </a>

        <!-- Hamburger Button -->
        <button class="hamburger" (click)="toggleMenu()" [class.active]="isMenuOpen">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <!-- Navigation & Actions Wrapper -->
        <div class="nav-wrapper" [class.open]="isMenuOpen">
            <!-- Navigation -->
            <nav>
            <a routerLink="/catalog" routerLinkActive="active" (click)="closeMenu()">{{ 'HEADER.CATALOG' | translate }}</a>
            <a routerLink="/our-story" routerLinkActive="active" (click)="closeMenu()">{{ 'HEADER.OUR_STORY' | translate }}</a>
            </nav>

            <!-- Actions -->
            <div class="actions">
            <!-- Language Switcher -->
            <div class="lang-switch">
                <button (click)="switchLang('en')" [class.active]="currentLang === 'en'">🇺🇸</button>
                <span class="divider">|</span>
                <button (click)="switchLang('vi')" [class.active]="currentLang === 'vi'">🇻🇳</button>
            </div>

            <a routerLink="/cart" class="icon-btn cart-btn" [title]="'HEADER.CART' | translate" (click)="closeMenu()">
                <span class="icon">🛒</span>
                @if (cart.count() > 0) {
                <span class="badge">{{ cart.count() }}</span>
                }
            </a>

            @if (auth.isAuthenticated()) {
                <a routerLink="/profile" class="icon-btn" [title]="'HEADER.PROFILE' | translate" (click)="closeMenu()">
                    <span class="icon">👤</span>
                </a>
            } @else {
                <button routerLink="/login" class="btn-primary btn-small" [title]="'HEADER.LOGIN' | translate" (click)="closeMenu()">
                    {{ 'HEADER.LOGIN' | translate }}
                </button>
            }
            </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 0;
    }

    .glass-panel {
      padding: var(--spacing-sm) var(--spacing-lg);
      display: flex;
      justify-content: center;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
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
      text-decoration: none;
      z-index: 1001;
      
      .logo-icon { font-size: 1.8rem; }
      .logo-text { 
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
       }
    }

    .hamburger {
        display: none; 
        flex-direction: column;
        justify-content: space-between;
        width: 30px;
        height: 21px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        z-index: 1001;

        span {
            display: block;
            width: 100%;
            height: 3px;
            background: var(--color-secondary);
            border-radius: 3px;
            transition: all 0.3s ease;
        }

        &.active span:nth-child(1) { transform: translateY(9px) rotate(45deg); }
        &.active span:nth-child(2) { opacity: 0; }
        &.active span:nth-child(3) { transform: translateY(-9px) rotate(-45deg); }
    }

    .nav-wrapper {
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: space-between;
        margin-left: 2rem;
    }

    nav {
      display: flex;
      gap: var(--spacing-lg);

      a {
        font-weight: 500;
        color: var(--color-text-main);
        position: relative;
        opacity: 0.7;
        text-decoration: none;

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

    .actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    /* Mobile Styles */
    @media (max-width: 768px) {
        .hamburger { display: flex; }

        .nav-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: white;
            flex-direction: column;
            justify-content: center;
            gap: 2rem;
            margin: 0;
            padding: 2rem;
            box-sizing: border-box;
            transform: translateY(-100%);
            transition: transform 0.3s ease-in-out;
            opacity: 0;
            visibility: hidden;
            
            &.open {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
        }

        nav {
            flex-direction: column;
            align-items: center;
            font-size: 1.5rem;
            gap: 2rem;
        }

        .actions {
            flex-direction: column;
            gap: 2rem;
            
            .icon-btn { font-size: 2rem; }
        }
    }

    .lang-switch {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-right: 1rem;
        
        button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            filter: grayscale(1);
            transition: filter 0.2s, transform 0.2s;
            padding: 0;
            
            &:hover, &.active {
                filter: grayscale(0);
                transform: scale(1.1);
            }
        }
        
        .divider { color: #ddd; font-size: 0.8rem; }
    }

    .icon-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      position: relative;
      cursor: pointer;
      padding: 0.5rem;
      transition: transform 0.2s;
      display: flex;
      align-items: center;
      text-decoration: none;

      &:hover { transform: scale(1.1); }
    }

    .cart-btn {
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
  auth = inject(AuthService);
  translate = inject(TranslateService);

  isMenuOpen = false;

  get currentLang() {
    return this.translate.currentLang;
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
