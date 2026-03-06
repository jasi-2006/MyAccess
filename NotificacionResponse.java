import java.time.LocalDateTime;
public class NotificacionResponse {

    private Long id;
    private String titulo;
    private String mensaje;
    private Boolean leida;
    private LocalDateTime fechaCreacion;

    public Long getId() {return id;}

    public void setId(Long id) {this.id = id;}

    public String getTitulo() {return titulo;}

    public void setTitulo(String titulo) {this.titulo = titulo;}

    public String getMensaje() {return mensaje;}

    public void setMensaje(String mensaje) {this.mensaje = mensaje;}

    public Boolean getLeida() {return leida;}

    public void setLeida(Boolean leida) {this.leida = leida;}

    public LocalDateTime getFechaCreacion() {return fechaCreacion;}

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;}
}