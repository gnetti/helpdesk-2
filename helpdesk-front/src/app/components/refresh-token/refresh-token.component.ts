import {Component, OnInit, OnDestroy} from '@angular/core';
import {AuthService} from 'src/app/services/auth.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {SessionExpiryDialogComponent} from '../session-expiry-dialog/session-expiry-dialog.component';

@Component({
    selector: 'app-refresh-token',
    templateUrl: './refresh-token.component.html',
    styleUrls: ['./refresh-token.component.css']
})
export class RefreshTokenComponent implements OnInit, OnDestroy {
    isVisible = false;
    private expirationCheckSubscription: Subscription | undefined;

    constructor(
        private authService: AuthService,
        private router: Router,
        private dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        this.checkTokenExpiration();
    }

    ngOnDestroy(): void {
        if (this.expirationCheckSubscription) {
            this.expirationCheckSubscription.unsubscribe();
        }
    }

    checkTokenExpiration() {
        this.expirationCheckSubscription = this.authService.getTokenExpirationWarning().subscribe(warning => {
            this.isVisible = warning;
            if (this.isVisible) {
                this.openSessionExpiryDialog();
            }
        }, error => {
        });
    }

    openSessionExpiryDialog() {
        const dialogRef = this.dialog.open(SessionExpiryDialogComponent, {
            width: '300px',
            height: '200px',
            disableClose: true,
            autoFocus: false,
            panelClass: 'custom-dialog-container'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'refresh') {
                this.authService.refreshToken().subscribe(
                    (authToken: string) => {
                        if (authToken) {
                            this.authService.successfulLogin(authToken);
                            this.isVisible = false;
                        } else {
                            this.logout();
                        }
                    },
                    (error) => {
                        this.logout();
                    }
                );
            } else {
                this.logout();
            }
        }, error => {
        });
    }

    logout() {
        this.authService.logout();
        this.isVisible = false;
        this.router.navigate(['/login']).then(() => {
        }).catch(error => {
        });
    }
}
