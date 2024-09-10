import {Injectable} from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HTTP_INTERCEPTORS
} from '@angular/common/http';
import {Observable, throwError, BehaviorSubject} from 'rxjs';
import {catchError, switchMap, filter, take, finalize} from 'rxjs/operators';
import {AuthService} from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    constructor(private authService: AuthService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let authToken = sessionStorage.getItem('token');

        if (authToken) {
            const clonedRequest = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            return next.handle(clonedRequest).pipe(
                catchError(error => {
                    if (error.status === 401 && !request.url.includes('/auth/refresh-token')) {
                        return this.handleAuthError(request, next);
                    }
                    return throwError(error);
                })
            );
        } else {
            return next.handle(request);
        }
    }

    private handleAuthError(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);
            return this.authService.refreshToken().pipe(
                switchMap(response => {
                    this.isRefreshing = false;
                    this.refreshTokenSubject.next(response);
                    this.authService.successfulLogin(response);
                    const updatedRequest = request.clone({
                        setHeaders: {
                            Authorization: `Bearer ${response}`
                        }
                    });
                    return next.handle(updatedRequest);
                }),
                catchError(err => {
                    this.isRefreshing = false;
                    this.authService.logout();
                    return throwError(err);
                }),
                finalize(() => {
                    this.isRefreshing = false;
                })
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(token => {
                    const updatedRequest = request.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    return next.handle(updatedRequest);
                })
            );
        }
    }
}

export const AuthInterceptorProvider = [
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
    }
];
