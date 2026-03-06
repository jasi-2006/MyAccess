
public class NotificacionController {

    private final NotificacionService service;

    public NotificacionController(NotificacionService service) {
        this.service = service;}


    @GetMapping("/filtrar")
    public List<Notificacion> filtrar(
            @RequestParam Long usuarioId,
            @RequestParam(required = false) Boolean leida,
            @RequestParam(required = false) LocalDateTime desde,
            @RequestParam(required = false) LocalDateTime hasta) {

        return service.filtrar(usuarioId, leida, desde, hasta);}


    @GetMapping("/historial/{usuarioId}")
    public List<HistorialFiltro> historial(
            @PathVariable Long usuarioId) {return service.historialUsuario(usuarioId);}
}