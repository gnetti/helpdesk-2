import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { TokenTempo } from "../models/TokenTempo";
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class TokenTempoService {

    constructor(private http: HttpClient, private authService: AuthService) {}

    private handleError(err: HttpErrorResponse): Observable<null> {
        console.error('Erro ao processar operação de TokenTempo:', err);
        if (err.status === 404) {
            return of(null);
        }
        return throwError(() => new Error(err.error?.message || 'Erro desconhecido ao processar TokenTempo'));
    }

    findByPerfil(perfil: string): Observable<TokenTempo | null> {
        if (!this.authService.isUserIdOne()) {
            return throwError(() => new Error('Acesso negado: Apenas o usuário com ID 1 tem acesso a essas configurações.'));
        }

        const endpoint = `${API_CONFIG.baseUrl}/token-tempo/role`;
        const params = new HttpParams().set('perfil', perfil);

        return this.http.get<TokenTempo>(endpoint, { params }).pipe(
            catchError(err => this.handleError(err))
        );
    }

    create(tokenTempoDTO: TokenTempo): Observable<TokenTempo> {
        if (!this.authService.isUserIdOne()) {
            return throwError(() => new Error('Acesso negado: Apenas o usuário com ID 1 tem acesso a essas configurações.'));
        }

        const endpoint = `${API_CONFIG.baseUrl}/token-tempo`;

        return this.http.post<TokenTempo>(endpoint, tokenTempoDTO).pipe(
            catchError(err => this.handleError(err))
        );
    }

    update(id: number, tokenTempoDTO: TokenTempo): Observable<TokenTempo> {
        if (!this.authService.isUserIdOne()) {
            return throwError(() => new Error('Acesso negado: Apenas o usuário com ID 1 tem acesso a essas configurações.'));
        }

        const endpoint = `${API_CONFIG.baseUrl}/token-tempo/${id}`;

        return this.http.put<TokenTempo>(endpoint, tokenTempoDTO).pipe(
            catchError(err => this.handleError(err))
        );
    }
}
