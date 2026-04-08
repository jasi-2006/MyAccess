create database card_service;
use card_service;
create table card(
id_card int primary key auto_increment,
id_user int not null,

photo_url  varchar (255),
valid_photo boolean default false,

digital_state varchar (20) default "pendiente",
physical_state varchar (20) default "no solicitado",

digital_issue_date timestamp,
physical_state_date timestamp,
expiration_date timestamp,

reprints integer default 0,
reason_for_last_reprints text
);
drop table carnets;
create table request_card(
id_request int  primary key auto_increment,
id_user integer not null,

request_tipe varchar (20) not null,
card_tipe varchar(20) not null,

state varchar(20) default "pendiente",
reason_rejection text,

approbed_by integer,
printed_by integer,
registration_date timestamp default current_timestamp,
id_card int,
foreign key (id_card)references card(id_card)
);