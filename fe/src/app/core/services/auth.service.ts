import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
    id: string;
    email: string;
    fullName: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = `${environment.apiUrl}/Auth`;

    // Signals
    currentUser = signal<User | null>(null);
    isAuthenticated = signal<boolean>(false);

    constructor() {
        this.loadUser();
    }

    loadUser() {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr && userStr !== 'undefined') {
            try {
                this.currentUser.set(JSON.parse(userStr));
                this.isAuthenticated.set(true);
            } catch (e) {
                console.error('Failed to parse user from storage', e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        } else {
            localStorage.removeItem('user');
            if (!token) localStorage.removeItem('token');
        }
    }

    login(credentials: { email: string; password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                this.handleAuthSuccess(response);
            })
        );
    }

    register(userData: { fullName: string; email: string; password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
            tap(response => {
                this.handleAuthSuccess(response);
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
    }

    private handleAuthSuccess(response: AuthResponse) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
    }
}
