import {Injectable} from '@angular/core';
import {HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import {SpinnerService} from '../services/spinner.service';
import {finalize} from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

    constructor(private spinnerService: SpinnerService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler) {
        this.spinnerService.show();

        return next.handle(request).pipe(
            finalize(() => this.spinnerService.hide())
        );
    }
}
