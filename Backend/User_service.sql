CREATE DATABASE IF NOT EXISTS user_service;
USE user_service;

CREATE TABLE user_profile (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    document        VARCHAR(29) NOT NULL UNIQUE,
    type_document   VARCHAR(12),
    full_name       VARCHAR(100) NOT NULL,
    trainingProgram VARCHAR(250),
    trainingCenter  VARCHAR(100),
    regional        VARCHAR(50),
    bloodType       VARCHAR(5),
    nameRole        VARCHAR(50),
    ficha           VARCHAR(20),
    email           VARCHAR(100) UNIQUE
);

CREATE TABLE user_events (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    tipeEvent    VARCHAR(50),
    idUser       INTEGER NOT NULL,
    processed    BOOLEAN DEFAULT FALSE,
    eventDate    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descriptions VARCHAR(255),
    FOREIGN KEY (idUser) REFERENCES user_profile(id)
);
