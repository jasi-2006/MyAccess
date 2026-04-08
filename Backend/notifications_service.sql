create database notifications_service;
use notifications_service;



create table notifications(
id_notifications int primary key auto_increment,
id_user integer,
tipe varchar (30),
category varchar(30),
affair varchar (30),
messaje text,

stated_send varchar(20) default 'pendiente',
send_date timestamp,
reading_date timestamp,

created_date timestamp default current_timestamp,
id_config int,
foreign key (id_config) references config (id_config)
);
drop table notifications;

create table config (
id_config int primary key auto_increment,
clue varchar (50) unique,
value text,
description text,
modified_by integer,
modified_date timestamp default current_timestamp
);

create table templates_notification(
id_template int primary key auto_increment,
id_notifications int,
code varchar (50),
name varchar(100),
affair varchar(200),
message text,
asset boolean default true,
foreign key (id_notifications) references notifications (id_notifications)
);

drop table templates_notification;

create table queue_notifications (
id_queue int primary key auto_increment,
id_notifications int,
priority integer default 5,
chanel varchar (10),
foreign key (id_notifications)references notifications (id_notifications)
);