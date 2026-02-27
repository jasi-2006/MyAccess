package com.ejemplo.notificaciones.service;

import com.ejemplo.notificaciones.model.Notificacion;
import com.ejemplo.notificaciones.repository.NotificacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository repository;

    public NotificacionService(NotificacionRepository repository) {
        this.repository = repository;
    }

    public Notificacion crear(Notificacion notificacion) {
        return repository.save(notificacion);
    }

    public List<Notificacion> listarPorUsuario(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId);
    }

    public void marcarComoLeida(Long id) {
        Notificacion notificacion = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));

        notificacion.setLeida(true);
        repository.save(notificacion);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

}

private final NotificacionService service;

    public NotificacionController(NotificacionService service) {
        this.service = service;
    }


    @GetMapping("/filtrar")
    public List<Notificacion> filtrar(
            @RequestParam Long usuarioId,
            @RequestParam(required = false) Boolean leida,
            @RequestParam(required = false) LocalDateTime desde,
            @RequestParam(required = false) LocalDateTime hasta) {

        return service.filtrar(usuarioId, leida, desde, hasta);
    }

    @GetMapping("/historial/{usuarioId}")
    public List<HistorialFiltro> historial(
            @PathVariable Long usuarioId) {

        return service.historialUsuario(usuarioId);
    }
}
