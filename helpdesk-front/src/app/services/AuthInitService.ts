import { Injectable } from '@angular/core';
import { TokenTempoService } from './tokenTempo.service';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthInitService {
    constructor(
        private authService: AuthService,
        private tokenTempoService: TokenTempoService
    ) {}

    initializeApp(): Promise<void> {
        return new Promise<void>((resolve) => {
            const userRole = this.authService.getUserAdminRole();
            if (userRole) {
                const roleName = this.authService.getRoleName(userRole);
                this.tokenTempoService.getConvertedTokenTempo(roleName).subscribe(() => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}
