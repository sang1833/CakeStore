import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ValidateCartRequest, ValidateCartResponse } from '../models/product.model';

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

    put<T>(path: string, body: any): Observable<T> {
        return this.http.put<T>(`${this.apiUrl}/${path}`, body);
    }

    delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(`${this.apiUrl}/${path}`);
    }

    // Real Validation Call
    validateCart(request: ValidateCartRequest): Observable<ValidateCartResponse> {
        return this.post<ValidateCartResponse>('cart/validate', request);
    }
}
