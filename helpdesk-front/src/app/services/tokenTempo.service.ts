import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {API_CONFIG} from '../config/api.config';
import {TokenTempo} from "../models/TokenTempo";
import {ITokenTempo} from "../models/iTokenTempo";
import {TokenTempoStateService} from "./TokenTempoStateService";

@Injectable({
    providedIn: 'root'
})
export class TokenTempoService {
    constructor(
        private http: HttpClient,
        private tokenTempoStateService: TokenTempoStateService
    ) {
    }

    private handleError(err: HttpErrorResponse): Observable<null> {
        if (err.status === 404) {
            return of(null);
        }
        return throwError(() => new Error(err.error?.message || 'Erro desconhecido ao processar TokenTempo'));
    }

    findByPerfil(perfil: string): Observable<TokenTempo | null> {
        const endpoint = `${API_CONFIG.baseUrl}/token-tempo/role`;
        const params = new HttpParams().set('perfil', perfil);
        return this.http.get<TokenTempo>(endpoint, {params}).pipe(
            catchError(err => this.handleError(err))
        );
    }

    create(tokenTempo: TokenTempo): Observable<TokenTempo> {
        const endpoint = `${API_CONFIG.baseUrl}/token-tempo`;
        return this.http.post<TokenTempo>(endpoint, tokenTempo).pipe(
            tap(createdTokenTempo => this.tokenTempoStateService.setTokenTempo(createdTokenTempo)),
            catchError(err => this.handleError(err))
        );
    }

    update(id: number, tokenTempo: TokenTempo): Observable<TokenTempo> {
        const endpoint = `${API_CONFIG.baseUrl}/token-tempo/${id}`;
        return this.http.put<TokenTempo>(endpoint, tokenTempo).pipe(
            tap(updatedTokenTempo => this.tokenTempoStateService.setTokenTempo(updatedTokenTempo)),
            catchError(err => this.handleError(err))
        );
    }

    getConvertedTokenTempo(roleName: string): Observable<ITokenTempo | null> {
        const endpoint = `${API_CONFIG.baseUrl}/token-tempo/jwt-time`;
        const params = new HttpParams().set('perfil', roleName);

        return this.http.get<ITokenTempo>(endpoint, {params}).pipe(
            tap(tokenTempo => this.tokenTempoStateService.setTokenTempo(tokenTempo)),
            catchError(error => {
                return of(null);
            })
        );
    }
}
