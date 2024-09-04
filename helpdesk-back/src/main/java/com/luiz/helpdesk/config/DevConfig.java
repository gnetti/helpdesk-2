package com.luiz.helpdesk.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.luiz.helpdesk.services.DBService;

@Configuration
@Profile("dev")
public class DevConfig {

    private final DBService dbService;

    private final String value;

    public DevConfig(DBService dbService, @Value("${spring.jpa.hibernate.ddl-auto}") String value) {
        this.dbService = dbService;
        this.value = value;
    }

    @Bean
    public boolean instanciaDB() {
        if (value.equals("create")) {
            this.dbService.instanciaDB();
            return true;
        }
        return false;
    }
}
