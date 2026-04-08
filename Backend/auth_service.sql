create database auth_service;
use auth_service;
drop database auth_service;
create table roles(
id int primary key auto_increment,
name_role varchar (40),
description text (40),
access_level integer default 1 ,
assest boolean default true,
date_creation timestamp default current_timestamp
);

drop table roles;
drop table permissions;


create table permissions(
id int primary key auto_increment,
permission_code varchar (50) not null unique,
permission_name varchar (100) not null,
description text,
module varchar (50),
id_role int,
foreign key (id_role) references roles (id)
);



drop table role_permission;
create table user_auth(
id int primary key auto_increment,
document_tipe varchar(20) unique,
number_document varchar(20) unique,
email varchar (40),
password varchar (255),
id_role int, 
verified_email boolean default false,
foreign key (id_role) references roles(id)
);

drop table user_auth;
create table audit(
id int  primary key auto_increment,
id_user int,
acction varchar(50),
module varchar (50),
description text,
foreign key (id_user) references user_auth (id)
);

drop table audit;
create table sesions_actives(
id int primary key auto_increment,
id_user int,
tocken varchar (255),
ip_addre varchar(255),
active boolean default false,
foreign key (id_user) references user_auth (id)
);

drop table sesions_actives;

drop database auth_service;
