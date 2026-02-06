import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { CartItem, ValidateCartResponse } from '../../../core/models/product.model';

@Component({
  selector: 'app-date-selector',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="calendar-container">
      <h3>Select Delivery Date</h3>
      
      @if (loading()) {
        <div class="loading">Checking kitchen availability...</div>
      } @else {
        <div class="slots-grid">
          @for (slot of slots(); track slot.date) {
            <button 
              class="slot-card" 
              [class.disabled]="!slot.available" 
              [class.selected]="selectedDate() === slot.date"
              (click)="selectDate(slot)"
              [disabled]="!slot.available">
              
              <div class="day">{{ slot.date | date:'EEE' }}</div>
              <div class="date">{{ slot.date | date:'dd MMM' }}</div>
              
              <div class="status">
                @if (slot.available) {
                  <span class="badge success">{{ slot.remaining }} left</span>
                } @else {
                  <span class="badge error">Full</span>
                }
              </div>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .calendar-container {
      margin-top: var(--spacing-md);
    }

    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }

    .slot-card {
      background: white;
      border: 1px solid #eee;
      border-radius: var(--radius-md);
      padding: 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all 0.2s;

      &:hover:not(.disabled) {
        border-color: var(--color-primary);
        transform: translateY(-2px);
      }

      &.selected {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        
        .badge { background: white; color: var(--color-primary); }
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #f9f9f9;
      }
    }

    .day { font-weight: 700; font-size: 0.9rem; margin-bottom: 2px; }
    .date { font-size: 0.8rem; margin-bottom: 5px; }

    .badge {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      
      &.success { background: #e6f4ea; color: #1e8e3e; }
      &.error { background: #fce8e6; color: #d93025; }
    }
  `]
})
export class DateSelectorComponent implements OnInit {
  @Input({ required: true }) cartItems: CartItem[] = [];
  @Output() dateSelected = new EventEmitter<string>();

  private api = inject(ApiService);

  slots = signal<{ date: string, available: boolean, remaining: number }[]>([]);
  loading = signal(true);
  selectedDate = signal<string | null>(null);

  ngOnInit() {
    // Map CartItems to ValidateCartRequest
    const request = {
      items: this.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    this.api.validateCart(request).subscribe({
      next: (res) => {
        // Backend returns "EarliestAvailableDate".
        // Since the backend logic is simplified in MVP (just returns availableDate), 
        // we will generate a visual calendar starting from that date.
        // If IsSlotAvailable is false, it means > 30 days.

        if (res.isSlotAvailable) {
          this.generateSlots(res.earliestAvailableDate);
        } else {
          // Handle no slots (empty array)
          this.slots.set([]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Validation failed', err);
        this.loading.set(false);
      }
    });
  }

  generateSlots(startDateStr: string) {
    const start = new Date(startDateStr);
    const slots = [];

    // Generate next 7 days from the earliest available date
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      slots.push({
        date: dateStr,
        available: true, // If backend says earliest is X, implies X and (likely) subsequent are free in this simple model
        remaining: 99 // Todo: Backend doesn't return capacity per day in Validate endpoint yet, only earliest date.
      });
    }
    this.slots.set(slots);
  }
  selectDate(slot: any) {
    if (!slot.available) return;
    this.selectedDate.set(slot.date);
    this.dateSelected.emit(slot.date);
  }
}
