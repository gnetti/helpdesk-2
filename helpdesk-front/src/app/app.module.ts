import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxMaskModule} from 'ngx-mask';
import {CoolDialogsModule} from '@angular-cool/dialogs';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatRadioModule} from '@angular/material/radio';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatSortModule} from '@angular/material/sort';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {LoadingInterceptor} from './interceptors/loading.interceptor';
import {AuthInterceptorProvider} from './interceptors/auth.interceptor';
import {NavComponent} from './components/nav/nav.component';
import {HomeComponent} from './components/home/home.component';
import {HeaderComponent} from './components/header/header.component';
import {TecnicoListComponent} from './components/tecnico/tecnico-list/tecnico-list.component';
import {LoginComponent} from './components/login/login.component';
import {TecnicoCreateComponent} from './components/tecnico/tecnico-create/tecnico-create.component';
import {TecnicoUpdateComponent} from './components/tecnico/tecnico-update/tecnico-update.component';
import {TecnicoDeleteComponent} from './components/tecnico/tecnico-delete/tecnico-delete.component';
import {ClienteCreateComponent} from './components/cliente/cliente-create/cliente-create.component';
import {ClienteDeleteComponent} from './components/cliente/cliente-delete/cliente-delete.component';
import {ClienteListComponent} from './components/cliente/cliente-list/cliente-list.component';
import {ClienteUpdateComponent} from './components/cliente/cliente-update/cliente-update.component';
import {ChamadoListComponent} from './components/chamado/chamado-list/chamado-list.component';
import {ChamadoCreateComponent} from './components/chamado/chamado-create/chamado-create.component';
import {ChamadoUpdateComponent} from './components/chamado/chamado-update/chamado-update.component';
import {ChamadoReadComponent} from './components/chamado/chamado-read/chamado-read.component';
import {SpinnerComponent} from './components/loading/spinner.component';
import {ToastrModule} from 'ngx-toastr';
import {SpinnerService} from './services/spinner.service';
import {SessionExpiryDialogComponent} from "./components/session-expiry-dialog/session-expiry-dialog.component";
import {RefreshTokenComponent} from "./components/refresh-token/refresh-token.component";
import {MatDialogModule} from "@angular/material/dialog";
import {UserProfileMenuComponent} from "./components/user-profile-menu/user-profile-menu.component";
import {_MatMenuDirectivesModule, MatMenuModule} from "@angular/material/menu";
import {AvatarModule} from "ngx-avatar";
import {SettingsComponent} from "./components/settings/settings.component";
import {ThemeService} from "./services/theme.service";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTooltipModule} from "@angular/material/tooltip";
import {AuthInitService} from "./services/AuthInitService";

export function initializeApp(authInitService: AuthInitService) {
    return () => authInitService.initializeApp();
}

@NgModule({
    declarations: [
        AppComponent,
        NavComponent,
        HomeComponent,
        HeaderComponent,
        TecnicoListComponent,
        LoginComponent,
        TecnicoCreateComponent,
        TecnicoUpdateComponent,
        TecnicoDeleteComponent,
        ClienteCreateComponent,
        ClienteDeleteComponent,
        ClienteListComponent,
        ClienteUpdateComponent,
        ChamadoListComponent,
        ChamadoCreateComponent,
        ChamadoUpdateComponent,
        ChamadoReadComponent,
        SpinnerComponent,
        SessionExpiryDialogComponent,
        RefreshTokenComponent,
        UserProfileMenuComponent,
        SettingsComponent,
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatFormFieldModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatSnackBarModule,
        MatToolbarModule,
        MatSidenavModule,
        MatButtonModule,
        MatSelectModule,
        MatInputModule,
        MatRadioModule,
        MatTableModule,
        MatIconModule,
        MatListModule,
        MatCardModule,
        MatSortModule,
        AvatarModule,
        MatSlideToggleModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        NgxMaskModule.forRoot(),
        CoolDialogsModule.forRoot(),
        ToastrModule.forRoot({
            timeOut: 4000,
            closeButton: true,
            progressBar: true
        }),
        MatDialogModule,
        _MatMenuDirectivesModule,
        MatMenuModule,
        MatTooltipModule
    ],
    providers: [
        SpinnerService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoadingInterceptor,
            multi: true
        },
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [AuthInitService],
            multi: true
        },
        AuthInterceptorProvider,
        ThemeService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
