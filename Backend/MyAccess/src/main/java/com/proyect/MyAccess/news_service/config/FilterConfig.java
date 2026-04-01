package com.proyect.MyAccess.news_service.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.proyect.MyAccess.news_service.filter.JwtValidationFilter;

@Configuration("newsFilterConfig")
public class FilterConfig {

    @Bean
    FilterRegistrationBean<JwtValidationFilter> newsJwtFilter(JwtValidationFilter jwtValidationFilter) {
        FilterRegistrationBean<JwtValidationFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(jwtValidationFilter);
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }
}
