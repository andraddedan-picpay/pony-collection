import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { LoginRequest, LoginResponse, User } from '@core/models/user.model';
import { LocalStorageHelper } from '@core/helpers/local-storage.helper';
import { LocalStorageKeys } from '@core/helpers/local-storage.helper';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    login(loginData: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData).pipe(
            map(({ access_token }) => {
                const data = jwtDecode<User & { sub: string }>(access_token);

                const user = {
                    id: data.sub,
                    email: data.email,
                    name: data.name,
                };

                if (access_token && data) {
                    LocalStorageHelper.set<string>(LocalStorageKeys.TOKEN, access_token);
                    LocalStorageHelper.set<User>(LocalStorageKeys.USER, user);
                }

                return {
                    access_token,
                    user,
                };
            }),
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    logout(): void {
        LocalStorageHelper.remove(LocalStorageKeys.TOKEN);
        LocalStorageHelper.remove(LocalStorageKeys.USER);
    }

    getToken(): string | null {
        return LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);
    }

    getUser(): User | null {
        return LocalStorageHelper.get<User>(LocalStorageKeys.USER);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
