import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  template: `
    <div class="auth-container animate-fade-in">
      <div class="auth-card glass-panel">
        <div class="brand">
          <h1>La Patisserie</h1>
          <p>{{ 'AUTH.WELCOME_BACK' | translate }}</p>
        </div>
        
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>{{ 'AUTH.EMAIL' | translate }}</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="hello@example.com" required>
          </div>
          
          <div class="form-group">
            <label>{{ 'AUTH.PASSWORD' | translate }}</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required>
          </div>
          
          <div class="actions">
            <a href="#" class="forgot-pass">{{ 'AUTH.FORGOT_PASSWORD' | translate }}</a>
          </div>

          @if (errorMessage) {
            <div class="error-message">
              {{ errorMessage }}
            </div>
          }
          
          <button type="submit" class="btn-primary full-width" [disabled]="isLoading">
            @if (isLoading) {
              {{ 'common.loading' | translate }}
            } @else {
              {{ 'AUTH.SIGN_IN' | translate }}
            }
          </button>
        </form>
        
        <div class="footer">
          <p>{{ 'AUTH.NEW_HERE' | translate }} <a routerLink="/signup">{{ 'AUTH.CREATE_ACCOUNT' | translate }}</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
    }
    
    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem;
      text-align: center;
    }
    
    .brand {
      margin-bottom: 2rem;
      
      h1 {
        font-family: 'Playfair Display', serif;
        color: var(--color-secondary);
        font-size: 2rem;
        margin: 0;
      }
      
      p {
        color: #888;
        margin-top: 5px;
      }
    }
    
    .form-group {
      text-align: left;
      margin-bottom: 1.5rem;
      
      label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--color-text-main);
        font-size: 0.9rem;
      }
      
      input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s;
        
        &:focus {
          border-color: var(--color-primary);
          outline: none;
        }
      }
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1.5rem;
      
      .forgot-pass {
        font-size: 0.85rem;
        color: var(--color-primary-dark);
        text-decoration: none;
        
        &:hover { text-decoration: underline; }
      }
    }
    
    .btn-primary.full-width {
      width: 100%;
      justify-content: center;
      padding: 12px;
      font-size: 1rem;
    }
    
    .footer {
      margin-top: 2rem;
      font-size: 0.9rem;
      color: #666;
      
      a {
        color: var(--color-primary-dark);
        font-weight: 600;
        text-decoration: none;
      }
    }

    .error-message {
      color: #e74c3c;
      background-color: #fadbd8;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      border: 1px solid #e74c3c;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  authService = inject(AuthService);
  router = inject(Router);

  onSubmit() {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Invalid email or password'; // Simple error handling
          console.error('Login failed', err);
        }
      });
  }
}
