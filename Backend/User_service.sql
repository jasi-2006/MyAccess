create database user_service;
use user_service;
drop database user_profile;


create table user_profile (
id int primary key auto_increment,
name varchar(100),
lastName varchar(100),
document varchar(29),
phone varchar(20),
trainingProgram varchar (250),
trainingCenter varchar (100) default "comercio y turismo" ,
regional varchar (50) default "quindio" ,
bloodType varchar(5),
password varchar (255),
email varchar (100),
nameRole varchar(50)
);

drop table user_profile;
select * from user_profile;

CREATE TABLE user_events(
    id int PRIMARY KEY AUTO_INCREMENT,
    tipeEvent VARCHAR(50),
    idUser INTEGER,
    processed BOOLEAN DEFAULT FALSE,
    eventDate    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descriptions varchar(255),
    foreign key (idUser) references user_profile(id)
    );


select E.*, u.* from user_events E
inner join user_profile u on  E.idUser = u.id;

select * from user_events;
drop table user_events;


alter table user_profile
	ADD column verificationCode varchar(6),
    ADD column codeExpiration dateTime,
    ADD COLUMN verified boolean default false
    ;

	
