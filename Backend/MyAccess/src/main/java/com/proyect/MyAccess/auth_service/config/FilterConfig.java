package com.proyect.MyAccess.auth_service.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.proyect.MyAccess.auth_service.filter.JwtValidationFilter;

@Configuration("authFilterConfig")
public class FilterConfig {

    @Bean
    FilterRegistrationBean<JwtValidationFilter> authJwtFilter(JwtValidationFilter jwtValidationFilter) {
        FilterRegistrationBean<JwtValidationFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(jwtValidationFilter);
        registrationBean.addUrlPatterns("/*");

        registrationBean.setOrder(1);
        return registrationBean;
    }
}