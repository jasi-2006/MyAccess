package com.proyect.news_service.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.Properties;

@Configuration
@EnableJpaRepositories(
        basePackages = "com.proyect.news_service.repository",
        entityManagerFactoryRef = "newsEntityManagerFactory",
        transactionManagerRef = "newsTransactionManager"
)
public class NewsDataSourceConfig {

    @Bean(name = "newsDataSourceProperties")
    @ConfigurationProperties(prefix = "spring.datasource.news-service")
    public DataSourceProperties newsDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "newsDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.news-service.hikari")
    public DataSource dataSource(
            @Qualifier("newsDataSourceProperties") DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    @Bean(name = "newsEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            @Qualifier("newsDataSource") DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean factory = new LocalContainerEntityManagerFactoryBean();
        factory.setDataSource(dataSource);
        factory.setPackagesToScan("com.proyect.news_service.entity");
        factory.setPersistenceUnitName("news");
        factory.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        Properties props = new Properties();
        props.setProperty("hibernate.hbm2ddl.auto", "update");
        factory.setJpaProperties(props);
        return factory;
    }

    @Bean(name = "newsTransactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("newsEntityManagerFactory") LocalContainerEntityManagerFactoryBean factory) {
        return new JpaTransactionManager(factory.getObject());
    }
}
