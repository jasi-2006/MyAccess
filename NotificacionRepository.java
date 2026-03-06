import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface NotificacionRepository 
    extends JpaRepository<Notificacion, Long>, 
            JpaSpecificationExecutor<Notificacion> {
}