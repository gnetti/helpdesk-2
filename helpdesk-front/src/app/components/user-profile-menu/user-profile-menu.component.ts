import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-user-profile-menu',
    templateUrl: './user-profile-menu.component.html',
    styleUrls: ['./user-profile-menu.component.css']
})
export class UserProfileMenuComponent implements OnInit {

    userName: string | null = null;

    constructor(
        private authService: AuthService,
        private router: Router,
        private toast: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.userName = this.authService.getUserName();
    }

    getInitials(name: string): string {
        const parts = name.split(' ');
        if (parts.length < 2) {
            return (parts[0][0] || '').toUpperCase();
        }
        const firstInitial = parts[0][0] || '';
        const lastInitial = parts[1][0] || '';
        return (firstInitial + lastInitial).toUpperCase();
    }

    getUserInitials(): string {
        return this.userName ? this.getInitials(this.userName) : '';
    }

    logout() {
        localStorage.clear()
        this.router.navigate(['login'])
        this.authService.logout();
    }
}
