import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private api = inject(ApiService);

    getProducts(): Observable<Product[]> {
        return this.api.get<Product[]>('products');
    }

    getProductById(id: string): Observable<Product> {
        return this.api.get<Product>(`products/${id}`);
    }
}
