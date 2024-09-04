import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {API_CONFIG} from '../config/api.config';
import {UserSettings} from "../models/userSettings";

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    private baseUrl: string = `${API_CONFIG.baseUrl}/pessoas/me`;

    constructor(private http: HttpClient) {
    }

    getUserSettings(): Observable<UserSettings> {
        return this.http.get<UserSettings>(this.baseUrl);
    }

    updateUserSettings(settings: UserSettings): Observable<UserSettings> {
        return this.http.put<UserSettings>(this.baseUrl, settings);
    }
}
