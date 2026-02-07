import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  template: `
    <div class="auth-container animate-fade-in">
      <div class="auth-card glass-panel">
        <div class="brand">
          <h1>{{ 'AUTH.CREATE_ACCOUNT' | translate }}</h1>
          <p>Create your sweet account</p>
        </div>
        
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>{{ 'AUTH.NAME' | translate }}</label>
            <input type="text" [(ngModel)]="name" name="name" placeholder="John Doe" required>
          </div>

          <div class="form-group">
            <label>{{ 'AUTH.EMAIL' | translate }}</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="hello&#64;example.com" required>
          </div>

          <div class="form-group">
            <label>{{ 'AUTH.PHONE' | translate }}</label>
            <input type="tel" [(ngModel)]="phoneNumber" name="phoneNumber" placeholder="0123456789" required>
          </div>

          <div class="form-group">
            <label>{{ 'AUTH.ADDRESS' | translate }}</label>
            <input type="text" [(ngModel)]="address" name="address" placeholder="123 Bakery Street" required>
          </div>
          
          <div class="form-group">
            <label>{{ 'AUTH.PASSWORD' | translate }}</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required>
          </div>

          <div class="form-group">
            <label>{{ 'AUTH.CONFIRM_PASSWORD' | translate }}</label>
            <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="••••••••" required>
          </div>
          
          @if (errorMessage()) {
            <div class="error-message">
              {{ errorMessage() }}
            </div>
          }

          <button type="submit" class="btn-primary full-width" [disabled]="isLoading()">
            @if (isLoading()) {
              {{ 'common.loading' | translate }}
            } @else {
              {{ 'AUTH.CREATE_ACCOUNT' | translate }}
            }
          </button>
        </form>
        
        <div class="footer">
          <p>{{ 'AUTH.ALREADY_HAVE_ACCOUNT' | translate }} <a routerLink="/login">{{ 'AUTH.SIGN_IN' | translate }}</a></p>
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
      padding: 2rem 0;
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
      p { color: #888; margin-top: 5px; }
    }
    
    .form-group {
      text-align: left;
      margin-bottom: 1.25rem;
      
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
        box-sizing: border-box;
        transition: border-color 0.3s;
        
        &:focus {
          border-color: var(--color-primary);
          outline: none;
        }
      }
    }
    
    .btn-primary.full-width {
      width: 100%;
      justify-content: center;
      padding: 12px;
      font-size: 1rem;
      margin-top: 1rem;
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
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  phoneNumber = '';
  address = '';

  // State using Signals for better change detection
  isLoading = signal(false);
  errorMessage = signal('');

  authService = inject(AuthService);
  router = inject(Router);

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const registerData = {
      fullName: this.name,
      email: this.email,
      password: this.password,
      phoneNumber: this.phoneNumber,
      address: this.address
    };

    this.authService.register(registerData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          // Assuming successful registration triggers a redirect to login
          // We can also show a toast or alert with response.message if needed
          alert('Registration successful! Please login.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          // Handle backend validation errors if possible
          if (err.error && Array.isArray(err.error)) {
            const messages = err.error.map((e: any) => e.description).join(', ');
            this.errorMessage.set(messages);
          } else if (err.error && err.error.message) {
            this.errorMessage.set(err.error.message);
          } else {
            this.errorMessage.set('Registration failed. Please try again.');
          }
          console.error('Signup failed', err);
        }
      });
  }
}
