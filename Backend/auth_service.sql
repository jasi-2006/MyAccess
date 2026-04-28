CREATE DATABASE IF NOT EXISTS auth_service;
USE auth_service;

CREATE TABLE roles (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    name_role     VARCHAR(40) ,
    description   TEXT,
    asset         BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    permission_code VARCHAR(50) ,
    permission_name VARCHAR(100) ,
    description     TEXT,
    module          VARCHAR(50),
    id_role         INT,
    FOREIGN KEY (id_role) REFERENCES roles(id)
);

CREATE TABLE user_auth (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    email          VARCHAR(100) ,
    password       VARCHAR(255) ,
    id_role        INT,
    verified_email BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_role) REFERENCES roles(id)
);

CREATE TABLE audit (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    id_user     INT ,
    acction     VARCHAR(50),
    module      VARCHAR(50),
    description TEXT,
    audit_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES user_auth(id)
);

CREATE TABLE sessions_active (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    id_user      INT ,
    token        VARCHAR(255),
    ip_addr      VARCHAR(255),
    active       BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES user_auth(id)
);

select * from user_auth;