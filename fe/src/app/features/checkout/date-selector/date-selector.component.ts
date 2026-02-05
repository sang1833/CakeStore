import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService, ValidationResponse } from '../../../core/services/api.service';
import { CartItem } from '../../../core/models/product.model';

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

    slots = signal<ValidationResponse['availableSlots']>([]);
    loading = signal(true);
    selectedDate = signal<string | null>(null);

    ngOnInit() {
        this.api.validateCart(this.cartItems).subscribe({
            next: (res) => {
                this.slots.set(res.availableSlots);
                this.loading.set(false);
            }
        });
    }

    selectDate(slot: any) {
        if (!slot.available) return;
        this.selectedDate.set(slot.date);
        this.dateSelected.emit(slot.date);
    }
}
