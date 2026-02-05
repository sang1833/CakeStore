import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ValidationResponse {
    earliestAvailableDate: string;
    availableSlots: { date: string; available: boolean; remaining: number }[];
}

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    get<T>(path: string, params?: Record<string, any>): Observable<T> {
        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach((key) => {
                if (params[key] !== undefined && params[key] !== null) {
                    httpParams = httpParams.set(key, params[key]);
                }
            });
        }
        return this.http.get<T>(`${this.apiUrl}/${path}`, { params: httpParams });
    }

    post<T>(path: string, body: any): Observable<T> {
        return this.http.post<T>(`${this.apiUrl}/${path}`, body);
    }

    // ... other methods

    // Mock Validation for now
    validateCart(items: any[]): Observable<ValidationResponse> {
        // Logic: If any MakeToOrder, minDate is T+1 (or T+2 if > 18:00)
        // Here we just return a mock response
        const today = new Date();
        const nextWeek = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() + 1 + i);
            const dateStr = d.toISOString().split('T')[0];
            return {
                date: dateStr,
                available: Math.random() > 0.3, // Randomly full
                remaining: Math.floor(Math.random() * 10)
            };
        });

        return of({
            earliestAvailableDate: nextWeek[0].date,
            availableSlots: nextWeek
        }).pipe(delay(500));
    }
}
