package com.proyect.user_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserRegisterEventsResponseDTO {
    private Long id;
    private String tipeEvent;
    private Boolean processed;
    private LocalDateTime eventDate;
    private String descriptions;
    private Long idUser;
}




package com.Proyecto.Nas.Service;

import com.Proyecto.Nas.Entity.*;
        import com.Proyecto.Nas.Repository.*;
        import com.Proyecto.Nas.dto.*;

        import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.*;
        import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EntrenamientoService {

    private final JugadorRepository jugadorRepository;
    private final EntrenamientoRepository entrenamientoRepository;
    private final ResultadoEntrenamientoRepository resultadoRepository;

    public EntrenamientoResponseDto guardarEntrenamiento(EntrenamientoRequestDto requestDto) {
        Entrenamiento entrenamiento = new Entrenamiento();
        entrenamiento.setNumero(requestDto.getNumero());
        entrenamientoRepository.save(entrenamiento);

        for (JugadorRequestDto jugadorDto : requestDto.getJugadores()) {

            Jugador jugador = jugadorRepository.findByNombre(jugadorDto.getNombre());
            if (jugador == null) {
                jugador = new Jugador();
                jugador.setNombre(jugadorDto.getNombre());
                jugadorRepository.save(jugador);
            }

            double puntaje = (jugadorDto.getPotenciaTiro() * 0.20)
                    + (jugadorDto.getVelocidad() * 0.30)
                    + (jugadorDto.getPasesEfectivos() * 0.50);
            puntaje = Math.round(puntaje * 100.0) / 100.0;

            ResultadoEntrenamiento resultado = new ResultadoEntrenamiento();
            resultado.setJugador(jugador);
            resultado.setEntrenamiento(entrenamiento);
            resultado.setPotenciaTiro(jugadorDto.getPotenciaTiro());
            resultado.setVelocidad(jugadorDto.getVelocidad());
            resultado.setPasesEfectivos(jugadorDto.getPasesEfectivos());
            resultado.setPuntaje(puntaje);
            resultadoRepository.save(resultado);
        }

        EntrenamientoResponseDto responseDto = new EntrenamientoResponseDto();
        responseDto.setMensaje("Entrenamiento #" + requestDto.getNumero() + " guardado correctamente.");

        return responseDto;
    }

    public Object obtenerTitulares() {
        long totalEntrenamientos = entrenamientoRepository.count();

        List<Jugador> jugadores = jugadorRepository.findAll();
        List<JugadorResponseDto> titulares = new ArrayList<>();

        for (Jugador jugador : jugadores) {
            List<ResultadoEntrenamiento> resultados = resultadoRepository.findByJugador(jugador);

            double sumaPuntajes = 0;
            for (ResultadoEntrenamiento r : resultados) {
                sumaPuntajes += r.getPuntaje();
            }

            double promedio = resultados.isEmpty() ? 0 : sumaPuntajes / resultados.size();
            promedio = Math.round(promedio * 100.0) / 100.0;

            JugadorResponseDto jugadorDto = new JugadorResponseDto();
            jugadorDto.setNombre(jugador.getNombre());
            jugadorDto.setPuntaje(promedio);
            titulares.add(jugadorDto);
        }

        titulares.sort((a, b) -> Double.compare(b.getPuntaje(), a.getPuntaje()));

        return titulares.subList(0, Math.min(5, titulares.size()));
    }

    public List<EntrenamientoResponseDto> mostrar() {
        List<Entrenamiento> entrenamiento = entrenamientoRepository.findAll();
        List<EntrenamientoResponseDto> list = new ArrayList<>();

        for (Entrenamiento entrenamientos : entrenamiento) {
            EntrenamientoResponseDto responseDto = new EntrenamientoResponseDto();
            responseDto.setId(entrenamientos.getId());
            responseDto.setNumero(entrenamientos.getNumero());
            list.add(responseDto);
        }
        return list;
    }
}