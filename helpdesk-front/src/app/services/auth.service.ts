import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {JwtHelperService} from '@auth0/angular-jwt';
import {API_CONFIG} from '../config/api.config';
import {Credenciais} from '../models/credenciais';
import {Observable, BehaviorSubject, Subscription, timer, interval} from 'rxjs';
import {map} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {SessionExpiryDialogComponent} from '../components/session-expiry-dialog/session-expiry-dialog.component';
import {Router} from '@angular/router';
import {ThemeService} from './theme.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy {

    private jwtService: JwtHelperService = new JwtHelperService();
    private expirationWarning = new BehaviorSubject<boolean>(false);
    private expirationCheckSubscription: Subscription | undefined;
    private sessionExpired = false;
    private logoutTimer: Subscription | undefined;
    private isLogoutInitiated = false;

    constructor(
        private http: HttpClient,
        private dialog: MatDialog,
        private router: Router,
        private themeService: ThemeService
    ) {
        this.startExpirationCheck();
    }

    authenticate(creds: Credenciais): Observable<HttpResponse<string>> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http.post<string>(`${API_CONFIG.baseUrl}/login`, creds, {
            observe: 'response',
            responseType: 'text' as 'json',
            headers: headers
        });
    }

    successfulLogin(authToken: string): void {
        localStorage.setItem('token', authToken);
        const decodedToken = this.jwtService.decodeToken(authToken);
        if (decodedToken?.exp) {
            localStorage.setItem('token_expiration', decodedToken.exp.toString());
        }
        this.setThemeFromToken(decodedToken);
        this.checkTokenExpiration();
    }

    isAuthenticated(): Observable<boolean> {
        const token = localStorage.getItem('token');
        return new Observable(subscriber => {
            const isExpired = token ? this.jwtService.isTokenExpired(token) : true;
            subscriber.next(!isExpired);
            subscriber.complete();
        });
    }

    logout(): void {
        if (this.isLogoutInitiated) {
            return;
        }
        this.isLogoutInitiated = true;
        localStorage.clear();
        this.router.navigate(['/login']);
    }

    getUserId(): number | null {
        const token = localStorage.getItem('token');
        const decodedToken = token ? this.jwtService.decodeToken(token) : null;
        return decodedToken?.id ?? null;
    }

    getUserName(): string | null {
        const token = localStorage.getItem('token');
        const decodedToken = token ? this.jwtService.decodeToken(token) : null;
        return decodedToken?.nome ?? null;
    }

    getUserEmail(): string | null {
        const token = localStorage.getItem('token');
        const decodedToken = token ? this.jwtService.decodeToken(token) : null;
        return decodedToken?.sub ?? null;
    }

    getUserTheme(): string | null {
        const token = localStorage.getItem('token');
        const decodedToken = token ? this.jwtService.decodeToken(token) : null;
        return decodedToken?.tema ?? null;
    }

    getUserRoles(): string[] | null {
        const token = localStorage.getItem('token');
        const decodedToken = token ? this.jwtService.decodeToken(token) : null;
        return decodedToken?.roles ?? null;
    }

    refreshToken(): Observable<string> {
        const refreshToken = localStorage.getItem('token')?.replace('Bearer ', '');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${refreshToken}`
        });

        if (!refreshToken) {
            return new Observable(subscriber => {
                subscriber.error('Refresh token não encontrado.');
            });
        }

        return this.http.post<string>(`${API_CONFIG.baseUrl}/auth/refresh-token`, {}, {
            observe: 'response',
            responseType: 'text' as 'json',
            headers: headers
        }).pipe(
            map(response => {
                const newToken = response.body as string;
                if (newToken) {
                    localStorage.setItem('token', newToken);
                    const decodedToken = this.jwtService.decodeToken(newToken);
                    if (decodedToken?.exp) {
                        localStorage.setItem('token_expiration', decodedToken.exp.toString());
                    }
                    this.setThemeFromToken(decodedToken);
                    return newToken;
                }
                throw new Error('Token não retornado pelo servidor.');
            })
        );
    }

    getTokenExpirationWarning(): Observable<boolean> {
        return this.expirationWarning.asObservable();
    }

    private setThemeFromToken(decodedToken: any): void {
        const theme = decodedToken?.tema || 'indigoPink'; // Substitua 'tema' pelo nome correto no token
        this.themeService.setTheme(theme);
    }

    private checkTokenExpiration(): void {
        const token = localStorage.getItem('token');
        const expirationTime = localStorage.getItem('token_expiration');
        if (token && expirationTime) {
            const expirationDate = new Date(Number(expirationTime) * 1000);
            const now = new Date();
            const timeLeft = expirationDate.getTime() - now.getTime();

            if (timeLeft <= 0) {
                if (!this.sessionExpired) {
                    this.sessionExpired = true;
                    this.startLogoutTimer(15 * 60 * 1000); // 15 minutos
                }
            } else if (timeLeft <= 60 * 1000) {
                this.openSessionExpiryDialog();
            } else {
                this.expirationWarning.next(false);
            }
        }
    }

    private openSessionExpiryDialog(): void {
        const dialogRef = this.dialog.open(SessionExpiryDialogComponent, {
            disableClose: true,
            width: '400px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'refresh') {
                this.refreshToken().subscribe(
                    () => {
                        this.expirationWarning.next(false);
                        this.stopLogoutTimer();
                        this.checkTokenExpiration();
                    },
                    (error) => {
                        this.logout();
                    }
                );
            } else {
                this.logout();
            }
        });
    }

    private startLogoutTimer(duration: number): void {
        this.logoutTimer = timer(duration).subscribe(() => {
            this.logout();
        });
    }

    private stopLogoutTimer(): void {
        if (this.logoutTimer) {
            this.logoutTimer.unsubscribe();
        }
    }

    private startExpirationCheck(): void {
        this.expirationCheckSubscription = interval(60000).subscribe(() => {
            this.checkTokenExpiration();
        });
    }

    ngOnDestroy(): void {
        if (this.expirationCheckSubscription) {
            this.expirationCheckSubscription.unsubscribe();
        }
        this.stopLogoutTimer();
    }

    login(credentials: any): void {
        this.authenticate(credentials).subscribe(response => {
            const token = response.body as string;
            if (token) {
                this.successfulLogin(token);
            }
        });
    }

    private getTokenFromLoginResponse(): string {
        return '';
    }
}
