import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ITokenTempo } from "../models/iTokenTempo";
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TokenTempoStateService {
    private tokenTempoSubject = new BehaviorSubject<ITokenTempo | null>(null);
    tokenTempo$ = this.tokenTempoSubject.asObservable();

    constructor(private http: HttpClient) {}

    setTokenTempo(tokenTempo: ITokenTempo | null): void {
        this.tokenTempoSubject.next(tokenTempo);
    }

    getTokenTempo(): ITokenTempo | null {
        return this.tokenTempoSubject.value;
    }

    fetchAndStoreTokenTempo(roleName: string): Observable<ITokenTempo | null> {
        const endpoint = `${API_CONFIG.baseUrl}/token-tempo/jwt-time`;
        const params = new HttpParams().set('perfil', roleName);

        return this.http.get<ITokenTempo>(endpoint, { params }).pipe(
            tap(tokenTempo => this.setTokenTempo(tokenTempo))
        );
    }
}
