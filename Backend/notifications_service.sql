CREATE DATABASE IF NOT EXISTS notifications_service;
USE notifications_service;

-- config debe crearse antes que notifications por la FK
CREATE TABLE config (
    id_config     INT PRIMARY KEY AUTO_INCREMENT,
    clue          VARCHAR(50) UNIQUE,
    value         TEXT,
    description   TEXT,
    modified_by   INTEGER,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id_notifications INT PRIMARY KEY AUTO_INCREMENT,
    id_user          INTEGER,
    tipe             VARCHAR(30),
    category         VARCHAR(30),
    affair           VARCHAR(30),
    messaje          TEXT,
    stated_send      VARCHAR(20) DEFAULT 'pendiente',
    send_date        TIMESTAMP,
    reading_date     TIMESTAMP,
    created_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_config        INT,
    FOREIGN KEY (id_config) REFERENCES config(id_config)
);
select * from notifications;
CREATE TABLE templates_notification (
    id_template      INT PRIMARY KEY AUTO_INCREMENT,
    id_notifications INT,
    code             VARCHAR(50),
    name             VARCHAR(100),
    affair           VARCHAR(200),
    message          TEXT,
    asset            BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_notifications) REFERENCES notifications(id_notifications)
);


CREATE TABLE queue_notifications (
    id_queue         INT PRIMARY KEY AUTO_INCREMENT,
    id_notifications INT,
    priority         INTEGER DEFAULT 5,
    chanel           VARCHAR(10),
    FOREIGN KEY (id_notifications) REFERENCES notifications(id_notifications)
);


