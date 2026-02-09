import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { CreateOrderRequest, CreateOrderResponse } from '../models/product.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private api = inject(ApiService);

    placeOrder(order: CreateOrderRequest): Observable<CreateOrderResponse> {
        return this.api.post<CreateOrderResponse>('orders', order);
    }

    getOrdersByUser(): Observable<any[]> {
        return this.api.get<any[]>('Orders/history');
    }
}
