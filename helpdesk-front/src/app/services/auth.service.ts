import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { API_CONFIG } from '../config/api.config';
import { Credenciais } from '../models/credenciais';
import { BehaviorSubject, interval, Observable, of, Subject, Subscription, timer } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SessionExpiryDialogComponent } from '../components/session-expiry-dialog/session-expiry-dialog.component';
import { Router } from '@angular/router';
import { ThemeService } from './theme.service';
import { UserRole } from "../components/enum/userRole";
import { TokenTempoStateService } from "./TokenTempoStateService";
import { ITokenTempo } from "../models/iTokenTempo";

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy {

    private tokenTempoSubject = new BehaviorSubject<ITokenTempo | null>(null);
    tokenTempo$ = this.tokenTempoSubject.asObservable();

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
        private themeService: ThemeService,
        private tokenTempoStateService: TokenTempoStateService
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
        this.fetchTokenTempo().subscribe(() => {
            this.checkTokenExpiration();
        });
    }

    isAuthenticated(): Observable<boolean> {
        const token = localStorage.getItem('token');
        return of(token ? !this.jwtService.isTokenExpired(token) : false);
    }

    logout(): void {
        if (this.isLogoutInitiated) return;
        this.isLogoutInitiated = true;
        localStorage.clear();
        this.router.navigate(['/login']);
    }

    getUserId(): number | null {
        const token = localStorage.getItem('token');
        return token ? this.jwtService.decodeToken(token)?.id ?? null : null;
    }

    getUserName(): string | null {
        const token = localStorage.getItem('token');
        return token ? this.jwtService.decodeToken(token)?.nome ?? null : null;
    }

    getUserAdminRole(): UserRole | null {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const decodedToken = this.jwtService.decodeToken(token);
        const roles = decodedToken?.roles || [];
        if (roles.includes('ROLE_ADMIN')) {
            return UserRole.ADMIN;
        }
        const roleMap: { [key: string]: UserRole } = {
            'ROLE_CLIENTE': UserRole.CLIENTE,
            'ROLE_TECNICO': UserRole.TECNICO
        };
        for (const role of roles) {
            if (role in roleMap) {
                return roleMap[role];
            }
        }
        return null;
    }

    getRoleName(role: UserRole): string {
        return UserRole[role];
    }

    isUserIdOne(): boolean {
        const userId = this.getUserId();
        return userId === 1;
    }

    refreshToken(): Observable<string> {
        const refreshToken = localStorage.getItem('token')?.replace('Bearer ', '');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${refreshToken}`
        });
        if (!refreshToken) {
            return of('Refresh token não encontrado.');
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
                    this.fetchTokenTempo().subscribe();
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

            const tokenTempo = this.tokenTempoStateService.getTokenTempo();
            if (!tokenTempo) return;

            const EXPIRATION_WARNING_TIME = tokenTempo.tempoTokenExibeDialogoMinutos;
            const DIALOG_DISPLAY_TIME = tokenTempo.tempoExibicaoDialogoAtualizaTokenMinutos;

            if (timeLeft <= 0) {
                if (!this.sessionExpired) {
                    this.sessionExpired = true;
                    this.startLogoutTimer(DIALOG_DISPLAY_TIME);
                }
            } else if (timeLeft <= EXPIRATION_WARNING_TIME && !this.hasShownExpiryDialog) {
                this.openSessionExpiryDialog(timeLeft);
                this.hasShownExpiryDialog = true;
            } else if (timeLeft > EXPIRATION_WARNING_TIME) {
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
        const tokenTempo = this.tokenTempoStateService.getTokenTempo();
        return tokenTempo ? tokenTempo.tempoExibicaoDialogoAtualizaTokenMinutos : 0;
    }

    private startLogoutTimer(duration: number): void {
        this.logoutTimer = timer(duration).subscribe(() => this.logout());
    }

    private stopLogoutTimer(): void {
        this.logoutTimer?.unsubscribe();
    }

    private startExpirationCheck(): void {
        this.tokenTempo$.pipe(
            filter(tokenTempo => !!tokenTempo),
            switchMap(tokenTempo =>
                interval(tokenTempo!.intervaloAtualizacaoTokenMinutos).pipe(
                    takeUntil(this.destroy$),
                    filter(() => !!localStorage.getItem('token_expiration')),
                    tap(() => this.checkTokenExpiration())
                )
            )
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

    fetchTokenTempo(): Observable<ITokenTempo | null> {
        const userId = this.getUserId();
        if (userId === 1) {
            const staticTokenTempo: ITokenTempo = {
                tempoTokenExibeDialogoMinutos: 30 * 60 * 1000,
                tempoExibicaoDialogoAtualizaTokenMinutos: 15 * 60 * 1000,
                intervaloAtualizacaoTokenMinutos: 1 * 60 * 1000
            };
            this.tokenTempoSubject.next(staticTokenTempo);
            this.tokenTempoStateService.setTokenTempo(staticTokenTempo);
            return of(staticTokenTempo);
        }

        const userRole = this.getUserAdminRole();
        if (userRole === null) {
            return of(null);
        }
        const roleName = this.getRoleName(userRole);

        return this.tokenTempoStateService.fetchAndStoreTokenTempo(roleName).pipe(
            map((response: unknown): ITokenTempo | null => {
                if (this.isValidTokenTempo(response)) {
                    return response;
                }
                return null;
            }),
            tap((tokenTempo: ITokenTempo | null) => {
                if (tokenTempo) {
                    this.tokenTempoSubject.next(tokenTempo);
                }
            })
        );
    }

    private isValidTokenTempo(obj: unknown): obj is ITokenTempo {
        return typeof obj === 'object' && obj !== null &&
            'tempoTokenExibeDialogoMinutos' in obj &&
            'tempoExibicaoDialogoAtualizaTokenMinutos' in obj &&
            'intervaloAtualizacaoTokenMinutos' in obj &&
            typeof (obj as ITokenTempo).tempoTokenExibeDialogoMinutos === 'number' &&
            typeof (obj as ITokenTempo).tempoExibicaoDialogoAtualizaTokenMinutos === 'number' &&
            typeof (obj as ITokenTempo).intervaloAtualizacaoTokenMinutos === 'number';
    }
}
