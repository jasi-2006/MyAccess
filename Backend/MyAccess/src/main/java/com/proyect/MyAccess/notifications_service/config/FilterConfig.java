package com.proyect.MyAccess.notifications_service.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.proyect.MyAccess.notifications_service.filter.JwtValidationFilter;

@Configuration("notificationsFilterConfig")
public class FilterConfig {

    @Bean
    FilterRegistrationBean<JwtValidationFilter> notificationsJwtFilter(JwtValidationFilter jwtValidationFilter) {
        FilterRegistrationBean<JwtValidationFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(jwtValidationFilter);
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }
}
