import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserService, UserProfile, UpdateProfileRequest } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="profile-container animate-fade-in">
      @if (profile(); as p) {
        <div class="profile-header glass-panel">
          <div class="avatar">{{ p.fullName.charAt(0) }}</div>
          <div class="info">
            <h1>{{ p.fullName }}</h1>
            <p>{{ 'PROFILE.MEMBER_SINCE' | translate }} 2024</p>
            <div class="badges">
              <span class="badge gold">Gold Member</span>
            </div>
          </div>
          <div class="actions">
            <button class="btn-secondary small" (click)="toggleEdit()">
              {{ isEditing() ? 'Cancel' : ('PROFILE.EDIT' | translate) }}
            </button>
            <button class="btn-danger small" (click)="authService.logout()">
              {{ 'AUTH.LOGOUT' | translate }}
            </button>
          </div>
        </div>

        @if (isEditing()) {
          <div class="edit-form glass-panel">
            <h3>Edit Profile</h3>
            <div class="form-group">
              <label>{{ 'AUTH.NAME' | translate }}</label>
              <input [(ngModel)]="editForm.fullName" placeholder="Full Name">
            </div>
             <div class="form-group">
              <label>Phone</label>
              <input [(ngModel)]="editForm.phone" placeholder="Phone Number">
            </div>
             <div class="form-group">
              <label>{{ 'PROFILE.ADDRESS' | translate }}</label>
              <input [(ngModel)]="editForm.address" placeholder="Address">
            </div>
            <button class="btn-primary" (click)="saveProfile()">Save Changes</button>
          </div>
        } @else {
          <div class="details-grid">
            <div class="detail-card glass-panel">
              <h3>{{ 'PROFILE.CONTACT' | translate }}</h3>
              <div class="row">
                <label>{{ 'AUTH.EMAIL' | translate }}</label>
                <span>{{ p.email }}</span>
              </div>
              <div class="row">
                <label>Phone</label>
                <span>{{ p.phone || 'Not set' }}</span>
              </div>
            </div>
            
            <div class="detail-card glass-panel">
              <h3>{{ 'PROFILE.ADDRESS' | translate }}</h3>
              <p>{{ p.address || 'No address set' }}</p>
            </div>
          </div>
        }
      } @else {
        <p>{{ 'common.loading' | translate }}</p>
      }
      
      <div class="quick-links glass-panel">
        <h3>{{ 'PROFILE.QUICK_LINKS' | translate }}</h3>
        <a routerLink="/orders" class="link-btn">📦 {{ 'PROFILE.HISTORY' | translate }}</a>
        <a routerLink="/cart" class="link-btn">🛒 {{ 'PROFILE.MY_CART' | translate }}</a>
      </div>
    </div>
  `,
  styles: [`
    .profile-container { max-width: 800px; margin: 0 auto; }
    
    .profile-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap; 
    }

    .actions {
        display: flex;
        gap: 1rem;
    }

    .btn-danger {
        background: #fff;
        color: #e74c3c;
        border: 1px solid #e74c3c;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9rem;
        
        &:hover {
            background: #e74c3c;
            color: white;
        }
    }
    
    .avatar {
      width: 100px;
      height: 100px;
      background: var(--color-primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: bold;
      font-family: var(--font-header);
    }
    
    .info {
      flex: 1;
      h1 { margin: 0 0 0.5rem 0; color: var(--color-secondary); }
      p { margin: 0 0 0.5rem 0; color: #666; }
    }
    
    .badge.gold {
      background: #f1c40f;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .detail-card {
      padding: 1.5rem;
      h3 { margin-top: 0; color: var(--color-secondary); border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
    }
    
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      label { font-weight: 600; color: #666; }
    }
    
    .edit-form {
      padding: 2rem;
      margin-bottom: 2rem;
      margin-top: 2rem;
      
      h3 { margin-top: 0; color: var(--color-secondary); margin-bottom: 1.5rem; }

      .form-group {
        margin-bottom: 1.5rem;
        
        label { 
            display: block; 
            margin-bottom: 0.5rem; 
            font-weight: 600; 
            color: var(--color-text-main);
            font-size: 0.9rem;
        }
        
        input { 
            width: 100%; 
            padding: 12px; 
            border: 1px solid #ddd; 
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
            box-sizing: border-box;

            &:focus {
                border-color: var(--color-primary);
                box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1); 
                outline: none;
            }
        }
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        font-size: 1rem;
        transition: transform 0.2s, box-shadow 0.2s;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }

        &:active {
            transform: translateY(0);
        }
      }
    }

    .btn-secondary {
        background: white;
        color: var(--color-secondary);
        border: 1px solid #ddd;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9rem;

        &:hover {
            border-color: var(--color-secondary);
            background: #fcfcfc;
        }
    }

    .quick-links {
      padding: 1.5rem;
      h3 { margin-top: 0; color: var(--color-secondary); }
      .link-btn {
        display: block;
        padding: 1rem;
        margin-bottom: 0.5rem;
        background: #f9f9f9;
        border-radius: 8px;
        text-decoration: none;
        color: var(--color-text-main);
        transition: background 0.2s;
        &:hover { background: #f0f0f0; }
      }
    }
    
    @media (max-width: 600px) {
      .profile-header { flex-direction: column; text-align: center; }
      .details-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent {
  userService = inject(UserService);
  authService = inject(AuthService);
  router = inject(Router);

  profile = signal<UserProfile | null>(null);
  isEditing = signal(false);

  // Form data
  editForm: UpdateProfileRequest = {
    fullName: '',
    phone: '',
    address: ''
  };

  constructor() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().subscribe(p => {
      this.profile.set(p);
      this.resetForm();
    });
  }

  resetForm() {
    const p = this.profile();
    if (p) {
      this.editForm = {
        fullName: p.fullName,
        phone: p.phone,
        address: p.address
      };
    }
  }

  toggleEdit() {
    this.isEditing.update(v => !v);
    if (this.isEditing()) {
      this.resetForm();
    }
  }

  saveProfile() {
    this.userService.updateProfile(this.editForm).subscribe({
      next: () => {
        this.isEditing.set(false);
        this.loadProfile(); // Reload to get fresh data
        alert('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Update failed', err);
        alert('Failed to update profile.');
      }
    });
  }
}
