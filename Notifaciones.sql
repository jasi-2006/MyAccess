create table novedades(
    id_notificacion int primary key auto_increment, 
    FOREIGN KEY (id_novedad) REFERENCES novedad(id_novedad) 
    fecha_notificacion datetime, 
    FOREIGN KEY (id_user) REFERENCES user(id_user) 

)