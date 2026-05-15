CREATE DATABASE IF NOT EXISTS news_service;
USE news_service;

CREATE TABLE kind_novently (
    id_novently       INT PRIMARY KEY AUTO_INCREMENT,
    name              VARCHAR(50) NOT NULL,
    category          VARCHAR(30),
    requires_approval BOOLEAN DEFAULT FALSE,
    description       TEXT,
    activo            BOOLEAN DEFAULT TRUE
);

CREATE TABLE novently (
    id_novently       INT PRIMARY KEY AUTO_INCREMENT,
    id_user           INTEGER NOT NULL,
    fk_id_novently    INTEGER,
    register_by       INTEGER,
    title             VARCHAR(200),
    description       TEXT NOT NULL,
    evidences_url     VARCHAR(255),
    stated            VARCHAR(20) DEFAULT 'activo',
    priority          VARCHAR(10) DEFAULT 'media',
    register_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolution_date   TIMESTAMP,
    follow_date       TIMESTAMP,
    notification_send BOOLEAN DEFAULT FALSE,
    notification_date TIMESTAMP,
    FOREIGN KEY (fk_id_novently) REFERENCES kind_novently(id_novently)
);

CREATE TABLE activity_traking (
    id_traking    BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_novently   INT,
    novently_type VARCHAR(30),
    description   TEXT,
    made_by       INTEGER,
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_novently) REFERENCES novently(id_novently)
);

CREATE TABLE novently_notifly (
    id_novently INTEGER,
    id_user     INTEGER NOT NULL,
    chanel      VARCHAR(10),
    send        BOOLEAN DEFAULT FALSE,
    reading     BOOLEAN DEFAULT FALSE,
    send_date   TIMESTAMP,
    PRIMARY KEY (id_novently, id_user, chanel),
    FOREIGN KEY (id_novently) REFERENCES novently(id_novently)
);
