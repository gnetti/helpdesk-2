import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {JwtHelperService} from '@auth0/angular-jwt';
import {API_CONFIG} from '../config/api.config';
import {Credenciais} from '../models/credenciais';
import {Observable, BehaviorSubject, Subject, interval, timer, Subscription} from 'rxjs';
import {takeUntil, tap, filter, map} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SessionExpiryDialogComponent} from '../components/session-expiry-dialog/session-expiry-dialog.component';
import {Router} from '@angular/router';
import {ThemeService} from './theme.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy {

    private readonly TEMPO_AVISO_EXPIRACAO_MINUTOS = 30;
    private readonly TEMPO_EXIBICAO_DIALOGO_MINUTOS = 0.15;
    private readonly INTERVALO_ATUALIZACAO_MINUTOS = 1;

    private readonly EXPIRATION_WARNING_TIME = this.minutesToMilliseconds(this.TEMPO_AVISO_EXPIRACAO_MINUTOS);
    private readonly DIALOG_DISPLAY_TIME = this.minutesToMilliseconds(this.TEMPO_EXIBICAO_DIALOGO_MINUTOS);
    private readonly REFRESH_INTERVAL = this.minutesToMilliseconds(this.INTERVALO_ATUALIZACAO_MINUTOS);

    private jwtService: JwtHelperService = new JwtHelperService();
    private expirationWarning = new BehaviorSubject<boolean>(false);
    private destroy$ = new Subject<void>();
    private sessionExpired = false;
    private logoutTimer: Subscription;
    private isLogoutInitiated = false;
    private hasShownExpiryDialog = false;
    private sessionExpiryDialogRef: MatDialogRef<SessionExpiryDialogComponent> | undefined;

    constructor(
        private http: HttpClient,
        private dialog: MatDialog,
        private router: Router,
        private themeService: ThemeService
    ) {
        this.startExpirationCheck();
    }

    authenticate(creds: Credenciais): Observable<HttpResponse<string>> {
        return this.http.post<string>(`${API_CONFIG.baseUrl}/login`, creds, {
            observe: 'response',
            responseType: 'text' as 'json',
            headers: new HttpHeaders({'Content-Type': 'application/json'})
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
            subscriber.next(token ? !this.jwtService.isTokenExpired(token) : false);
            subscriber.complete();
        });
    }

    logout(): void {
        if (this.isLogoutInitiated) return;
        this.isLogoutInitiated = true;
        localStorage.clear();
        this.router.navigate(['/login']
        );
    }

    getUserId(): number | null {
        const token = localStorage.getItem('token');
        return token ? this.jwtService.decodeToken(token)?.id ?? null : null;
    }

    getUserName(): string | null {
        const token = localStorage.getItem('token');
        return token ? this.jwtService.decodeToken(token)?.nome ?? null : null;
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
        const theme = decodedToken?.tema || 'indigoPink';
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
                    this.startLogoutTimer(this.DIALOG_DISPLAY_TIME);
                }
            } else if (timeLeft <= this.EXPIRATION_WARNING_TIME && !this.hasShownExpiryDialog) {
                this.openSessionExpiryDialog(timeLeft);
                this.hasShownExpiryDialog = true;
            } else if (timeLeft > this.EXPIRATION_WARNING_TIME) {
                this.expirationWarning.next(false);
                this.hasShownExpiryDialog = false;
            }
        }
    }

    private openSessionExpiryDialog(timeLeft: number): void {
        this.sessionExpiryDialogRef = this.dialog.open(SessionExpiryDialogComponent, {
            disableClose: true,
            width: '400px',
            data: {timeLeft}
        });
    }

    getDialogDisplayTime(): number {
        return this.DIALOG_DISPLAY_TIME;
    }

    private startLogoutTimer(duration: number): void {
        this.logoutTimer = timer(duration).subscribe(() => this.logout());
    }

    private stopLogoutTimer(): void {
        this.logoutTimer?.unsubscribe();
    }

    private startExpirationCheck(): void {
        interval(this.REFRESH_INTERVAL).pipe(
            takeUntil(this.destroy$),
            filter(() => !!localStorage.getItem('token_expiration')),
            tap(() => {
                this.checkTokenExpiration();
            })
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.stopLogoutTimer();
        this.sessionExpiryDialogRef?.close();
    }

    login(credentials: any): void {
        this.authenticate(credentials).subscribe(response => {
            const token = response.body as string;
            if (token) {
                this.successfulLogin(token);
            }
        });
    }

    private minutesToMilliseconds(minutes: number): number {
        return minutes * 60 * 1000;
    }
}
