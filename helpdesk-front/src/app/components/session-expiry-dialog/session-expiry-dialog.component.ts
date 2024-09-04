import {Component, OnInit, OnDestroy} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {AuthService} from 'src/app/services/auth.service';
import {Router} from '@angular/router';
import {Subscription, timer} from 'rxjs';

@Component({
    selector: 'app-session-expiry-dialog',
    templateUrl: './session-expiry-dialog.component.html',
    styleUrls: ['./session-expiry-dialog.component.css']
})
export class SessionExpiryDialogComponent implements OnInit, OnDestroy {
    private countdownTimerSubscription: Subscription | undefined;
    private readonly maxWaitTimeInMinutes = 15;
    private timeLeft = this.maxWaitTimeInMinutes * 60;
    timeLeftDisplay: string = '';
    sessionExpired = false;
    private dialogOpened = false;

    constructor(
        private authService: AuthService,
        public dialogRef: MatDialogRef<SessionExpiryDialogComponent>,
        private router: Router
    ) {
    }

    ngOnInit() {
        if (!this.dialogOpened) {
            this.dialogOpened = true;
            this.startCountdownTimer();
        }
    }

    refreshSession() {
        this.authService.refreshToken().subscribe(
            (authToken: string) => {
                if (authToken) {
                    this.authService.successfulLogin(authToken);
                    this.dialogRef.close();
                    this.dialogOpened = false;
                } else {
                    this.logout();
                }
            },
            (error) => {
                this.logout();
            }
        );
    }

    logout() {
        this.authService.logout();
        this.dialogRef.close();
        this.dialogOpened = false;
        this.router.navigate(['/login']).then(() => {
        }).catch(error => {
        });
    }

    navigateToLogin() {
        this.dialogRef.close();
        this.dialogOpened = false;
        this.router.navigate(['/login']).then(() => {
        }).catch(error => {
        });
    }

    private startCountdownTimer() {
        this.countdownTimerSubscription = timer(0, 1000).subscribe(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateTimeDisplay();
            } else {
                if (!this.sessionExpired) {
                    this.sessionExpired = true;
                    localStorage.clear()
                }
            }
        });
    }

    private updateTimeDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeLeftDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    ngOnDestroy() {
        if (this.countdownTimerSubscription) {
            this.countdownTimerSubscription.unsubscribe();
        }
        this.dialogOpened = false;
    }
}
