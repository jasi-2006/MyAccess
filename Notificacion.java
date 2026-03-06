public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String mensaje;
    private Boolean leida = false;
    private DateTime fechaCreacion;

    private Long usuarioId;

    @PrePersist
    public void prePersist() {this.fechaCreacion = DateTime.now();}



    public Long getId() { return id; }

    public String getTitulo() { return titulo; }

    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getMensaje() { return mensaje; }

    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public Boolean getLeida() { return leida; }

    public void setLeida(Boolean leida) { this.leida = leida; }

    public DateTime getFechaCreacion() { return fechaCreacion; }

    public Long getUsuarioId() { return usuarioId; }

    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
};