CREATE DATABASE IF NOT EXISTS card_service;
USE card_service;

CREATE TABLE card (
    id_card                 INT PRIMARY KEY AUTO_INCREMENT,
    id_user                 INT NOT NULL,
    photo_url               VARCHAR(255),
    valid_photo             BOOLEAN DEFAULT FALSE,
    digital_state           VARCHAR(20) DEFAULT 'pendiente',
    physical_state          VARCHAR(20) DEFAULT 'no solicitado',
    digital_issue_date      TIMESTAMP,
    physical_state_date     TIMESTAMP,
    expiration_date         TIMESTAMP,
    reprints                INTEGER DEFAULT 0,
    reason_for_last_reprints TEXT
);

CREATE TABLE request_card (
    id_request        INT PRIMARY KEY AUTO_INCREMENT,
    id_user           INTEGER NOT NULL,
    request_tipe      VARCHAR(20) NOT NULL,
    card_tipe         VARCHAR(20) NOT NULL,
    state             VARCHAR(20) DEFAULT 'pendiente',
    reason_rejection  TEXT,
    approbed_by       INTEGER,
    printed_by        INTEGER,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_card           INT,
    FOREIGN KEY (id_card) REFERENCES card(id_card)
);
