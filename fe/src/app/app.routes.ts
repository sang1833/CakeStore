import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { ProductListComponent } from './features/catalog/product-list/product-list.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', redirectTo: 'catalog', pathMatch: 'full' },
            { path: 'catalog', component: ProductListComponent },
            {
                path: 'products/:id',
                loadComponent: () => import('./features/catalog/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
            },
            {
                path: 'checkout',
                loadComponent: () => import('./features/checkout/checkout-page/checkout-page.component').then(m => m.CheckoutPageComponent)
            }
        ]
    },
    { path: '**', redirectTo: '' }
];
