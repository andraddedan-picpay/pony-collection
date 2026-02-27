import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Pony, UpdatePony } from '../models/pony.model';
import { LocalStorageHelper, LocalStorageKeys } from '@app/core/helpers';

@Injectable({
    providedIn: 'root',
})
export class PonyService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    getPonyList(): Observable<Pony[]> {
        const endpoint = `${this.apiUrl}/ponies`;
        const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

        const options = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        return this.http.get<Pony[]>(endpoint, options).pipe(
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    createPony(pony: Omit<Pony, 'id'>): Observable<Pony> {
        const endpoint = `${this.apiUrl}/ponies`;
        const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

        const options = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        return this.http.post<Pony>(endpoint, pony, options).pipe(
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    uploadImage(file: File): Observable<{ imageUrl: string }> {
        const endpoint = `${this.apiUrl}/ponies/upload`;
        const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

        const formData = new FormData();
        formData.append('file', file);

        const options = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        return this.http.post<{ imageUrl: string }>(endpoint, formData, options).pipe(
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    updatePony(ponyId: string, updateData: UpdatePony): Observable<Pony> {
        const endpoint = `${this.apiUrl}/ponies/${ponyId}`;
        const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

        const options = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        return this.http.put<Pony>(endpoint, updateData, options).pipe(
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }
}
