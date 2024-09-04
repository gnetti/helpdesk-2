import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {Endereco} from "../models/endereco";


@Injectable({
    providedIn: 'root'
})
export class CepService {

    private apiUrl = 'https://viacep.com.br/ws';

    constructor(private http: HttpClient) { }

    buscarEndereco(cep: string): Observable<Endereco> {
        const url = `${this.apiUrl}/${cep}/json/`;
        return this.http.get<Endereco>(url).pipe(
            catchError(this.handleError<Endereco>('buscarEndereco'))
        );
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(`${operation} failed: ${error.message}`);
            return new Observable<T>();
        };
    }
}
