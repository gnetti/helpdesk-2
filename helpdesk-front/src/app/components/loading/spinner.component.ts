import { Component } from '@angular/core';
import { SpinnerService } from 'src/app/services/spinner.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent {
    isLoading$: Observable<boolean>;

    constructor(private spinnerService: SpinnerService) {
        this.isLoading$ = this.spinnerService.loading$;
    }
}
