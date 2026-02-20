import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
        canActivate: [authGuard],
        data: { public: true },
    },
    {
        path: '',
        loadComponent: () =>
            import('./features/ponies/pages/list/ponies-list.component').then(
                (m) => m.PoniesListComponent,
            ),
        canActivate: [authGuard],
    },
];
