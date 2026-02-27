public class NotificacionService{private final NotificacionRepository repository; 
                                 public NotificacionService(NotificacionRepository reposiory){this.repository=reposiory;}}
public Notificacion crear (Notificacion notificacion){return repository.save(notificacion);}
public List<Notificacion> listarPorUsuario(Long usuarioid){return repository.findByUsuarioId(usuarioId);}
public void marcarComoLeida(Long id){Notificacion notificacion=repository-findById(id).orElseThrow(()->RuntimeException("notificacion no encontrada"));
    notificacion.setLeida(true);
    repository.save(notificacion);
}
public void eliminar(Long id){repository.deletById(id);}