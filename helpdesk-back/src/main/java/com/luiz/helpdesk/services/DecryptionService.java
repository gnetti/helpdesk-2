package com.luiz.helpdesk.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class DecryptionService {

    @Value("${crypto.secretKey}")
    private String base64SecretKey;

    @Value("${crypto.secretIv}")
    private String base64SecretIv;

    private SecretKeySpec getKeySpec() {
        byte[] keyBytes = Base64.getDecoder().decode(base64SecretKey);
        if (keyBytes.length != 16 && keyBytes.length != 24 && keyBytes.length != 32) {
            String errorMessage = "Invalid key length: " + keyBytes.length;
            throw new IllegalArgumentException(errorMessage);
        }
        return new SecretKeySpec(keyBytes, "AES");
    }

    private IvParameterSpec getIvSpec() {
        byte[] ivBytes = Base64.getDecoder().decode(base64SecretIv);
        if (ivBytes.length != 16) {
            String errorMessage = "Invalid IV length: " + ivBytes.length;
            throw new IllegalArgumentException(errorMessage);
        }
        return new IvParameterSpec(ivBytes);
    }

    public String decrypt(String encryptedData) throws Exception {
        try {
            byte[] encryptedBytes = Base64.getDecoder().decode(encryptedData);
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, getKeySpec(), getIvSpec());
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            String decryptedData = new String(decryptedBytes, StandardCharsets.UTF_8);
            return decryptedData;
        } catch (Exception e) {
            throw new Exception("Error decrypting data", e);
        }
    }
}
