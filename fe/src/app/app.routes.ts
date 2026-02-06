
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', redirectTo: 'catalog', pathMatch: 'full' },
            {
                path: 'catalog',
                loadComponent: () => import('./features/catalog/product-list/product-list.component').then(m => m.ProductListComponent)
            },
            {
                path: 'products/:id',
                loadComponent: () => import('./features/catalog/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
            },
            {
                path: 'checkout',
                loadComponent: () => import('./features/checkout/checkout-page/checkout-page.component').then(m => m.CheckoutPageComponent)
            },
            {
                path: 'our-story',
                loadComponent: () => import('./features/pages/our-story/our-story.component').then(m => m.OurStoryComponent)
            },
            {
                path: 'cart',
                loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
            },
            {
                path: 'login',
                loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'signup',
                loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/user/profile/profile.component').then(m => m.ProfileComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./features/user/order-history/order-history.component').then(m => m.OrderHistoryComponent)
            }
        ]
    },
    { path: '**', redirectTo: '' }
];

