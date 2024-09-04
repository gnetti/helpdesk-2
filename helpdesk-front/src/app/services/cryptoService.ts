import {Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';
import {API_CONFIG} from '../config/api.config';

@Injectable({
    providedIn: 'root'
})
export class CryptoService {

    private readonly key = CryptoJS.enc.Base64.parse(API_CONFIG.secretKey);
    private readonly iv = CryptoJS.enc.Base64.parse(API_CONFIG.secretIv);

    constructor() {

    }

    encrypt(data: string): string {
        const encrypted = CryptoJS.AES.encrypt(data, this.key, {
            keySize: 256 / 32,
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    }
}
