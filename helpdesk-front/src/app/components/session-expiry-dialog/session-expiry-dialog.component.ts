import {Component, OnInit, OnDestroy, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {AuthService} from 'src/app/services/auth.service';
import {Router} from '@angular/router';
import {Subscription, timer} from 'rxjs';

@Component({
    selector: 'app-session-expiry-dialog',
    templateUrl: './session-expiry-dialog.component.html',
    styleUrls: ['./session-expiry-dialog.component.css']
})
export class SessionExpiryDialogComponent implements OnInit, OnDestroy {
    private countdownTimerSubscription?: Subscription;
    private displayTimerSubscription?: Subscription;
    timeLeft: number;
    timeLeftDisplay: string = '';
    sessionExpired = false;
    private dialogOpened = false;
    private readonly TEMPO_EXIBICAO_DIALOGO_MINUTOS: number;

    constructor(
        private authService: AuthService,
        public dialogRef: MatDialogRef<SessionExpiryDialogComponent>,
        private router: Router,
        @Inject(MAT_DIALOG_DATA) public data: { timeLeft: number }
    ) {
        this.TEMPO_EXIBICAO_DIALOGO_MINUTOS = this.authService.getDialogDisplayTime();
        const remainingTime = Math.floor(data.timeLeft / 1000) * 1000;
        this.timeLeft = Math.floor(Math.min(this.TEMPO_EXIBICAO_DIALOGO_MINUTOS, remainingTime) / 1000);
    }

    ngOnInit() {
        if (!this.dialogOpened) {
            this.dialogOpened = true;
            this.startCountdownTimer();
            this.startDisplayTimer();
        }
    }

    refreshSession() {
        this.authService.refreshToken().subscribe(
            (authToken: string) => {
                if (authToken) {
                    sessionStorage.clear();
                    this.authService.successfulLogin(authToken);
                    this.closeDialog();
                } else {
                    this.logout();
                }
            },
            () => this.logout()
        );
    }

    logout() {
        this.authService.logout();
        sessionStorage.clear();
        this.closeDialog();
        this.router.navigate(['/login']);
    }

    navigateToLogin() {
        sessionStorage.clear();
        this.closeDialog();
        this.router.navigate(['/login']);
    }

    private startCountdownTimer() {
        this.countdownTimerSubscription = timer(0, 1000).subscribe(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateTimeDisplay();
            } else if (!this.sessionExpired) {
                this.sessionExpired = true;
                sessionStorage.clear();
            }
        });
    }

    private startDisplayTimer() {
        this.displayTimerSubscription = timer(this.TEMPO_EXIBICAO_DIALOGO_MINUTOS).subscribe();
    }

    private updateTimeDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeLeftDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    private closeDialog() {
        this.dialogRef.close();
        this.dialogOpened = false;
    }

    ngOnDestroy() {
        this.countdownTimerSubscription?.unsubscribe();
        this.displayTimerSubscription?.unsubscribe();
        this.dialogOpened = false;
    }
}
