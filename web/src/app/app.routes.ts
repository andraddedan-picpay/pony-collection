import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: '',
        loadComponent: () =>
            import('./features/ponies/pages/list/ponies-list.component').then(
                (m) => m.PoniesListComponent,
            ),
    },
];
