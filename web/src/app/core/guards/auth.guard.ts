import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = (route): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const isAuthenticated = authService.isAuthenticated();
    const isPublicRoute = Boolean(route.data?.['public']);

    if (isPublicRoute) {
        return allowPublicAccess(isAuthenticated, router);
    }

    return requireAuthentication(isAuthenticated, router);
};

function allowPublicAccess(isAuthenticated: boolean, router: Router): boolean | UrlTree {
    if (isAuthenticated) {
        return router.createUrlTree(['/']);
    }

    return true;
}

function requireAuthentication(isAuthenticated: boolean, router: Router): boolean | UrlTree {
    if (!isAuthenticated) {
        return router.createUrlTree(['/login']);
    }
    return true;
}
