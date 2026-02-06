import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    address: string;
}

export interface UpdateProfileRequest {
    fullName: string;
    phone: string;
    address: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private api = inject(ApiService);

    getProfile(): Observable<UserProfile> {
        return this.api.get<UserProfile>('User/profile');
    }

    updateProfile(data: UpdateProfileRequest): Observable<any> {
        return this.api.put('User/profile', data);
    }
}
