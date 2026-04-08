create database news_service;
use news_service;


create table kind_novently(
id_novently int primary key auto_increment, 
name varchar (50),
category varchar(30),
requires_approval boolean default false,
description text,
activo boolean default true
);

create table novently(
id_novently int primary key auto_increment,
id_user integer not null,
fk_id_novently integer,
register_by integer,


title varchar (200),
description text not null,
evidences_url varchar (255),
stated varchar (20) default "activo",
priority varchar (10) default "media",
register_date timestamp default current_timestamp,
resolution_date timestamp,
follow_date timestamp,

notification_send boolean default false,
notification_date timestamp,
foreign key (fk_id_novently) references kind_novently(id_novently)
);

create table activity_traking(
id_traking bigint primary key auto_increment,
id_novently int,
novently_type varchar (30),
description text,
made_by integer,
activity_date timestamp default current_timestamp,
foreign key (id_novently) references novently (id_novently)
);
drop table activity_traking;

create table novently_notifly(
id_novently integer,
id_user integer not null,
chanel varchar(10),
send boolean default false,
reading boolean  default false,
send_date timestamp,
primary key (id_novently, id_user, chanel),
foreign key (id_novently) references novently(id_novently)
);