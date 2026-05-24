package com.proyect.api_gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class DiagnosticsController {

    private final WebClient webClient;
    private final String userServiceUri;
    private final String authServiceUri;
    private final String cardServiceUri;
    private final String newsServiceUri;
    private final String notificationsServiceUri;

    public DiagnosticsController(
            WebClient.Builder webClientBuilder,
            @Value("${USER_SERVICE_URI:https://myaccess-user.onrender.com}") String userServiceUri,
            @Value("${AUTH_SERVICE_URI:https://myaccess-auth-pzen.onrender.com}") String authServiceUri,
            @Value("${CARD_SERVICE_URI:https://myaccess-card-a4e6.onrender.com}") String cardServiceUri,
            @Value("${NEWS_SERVICE_URI:https://myaccess-news-poqo.onrender.com}") String newsServiceUri,
            @Value("${NOTIFICATIONS_SERVICE_URI:https://myaccess-notification-mjsk.onrender.com}") String notificationsServiceUri) {
        this.webClient = webClientBuilder.build();
        this.userServiceUri = userServiceUri;
        this.authServiceUri = authServiceUri;
        this.cardServiceUri = cardServiceUri;
        this.newsServiceUri = newsServiceUri;
        this.notificationsServiceUri = notificationsServiceUri;
    }

    @GetMapping("/__diag/services")
    public Mono<Map<String, Object>> services() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("userService", service("user", userServiceUri, "/auth/login"));
        response.put("authService", service("auth", authServiceUri, "/role"));
        response.put("cardService", service("card", cardServiceUri, "/cardService/cards"));
        response.put("newsService", service("news", newsServiceUri, "/newsService/novelties"));
        response.put("notificationsService", service("notifications", notificationsServiceUri, "/notificationsService/notifications"));
        return Mono.just(response);
    }

    private Map<String, Object> service(String name, String baseUri, String probePath) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", name);
        data.put("baseUri", baseUri);
        data.put("probeUrl", join(baseUri, probePath));
        data.put("probe", "pending");
        return data;
    }

    @GetMapping("/__diag/probe")
    public Mono<Map<String, Object>> probe() {
        Map<String, String> services = new LinkedHashMap<>();
        services.put("user", join(userServiceUri, "/auth/login"));
        services.put("auth", join(authServiceUri, "/role"));
        services.put("card", join(cardServiceUri, "/cardService/cards"));
        services.put("news", join(newsServiceUri, "/newsService/novelties"));
        services.put("notifications", join(notificationsServiceUri, "/notificationsService/notifications"));

        return Flux.fromIterable(services.entrySet())
                .flatMap(entry -> probeUrl(entry.getValue())
                        .map(result -> Map.entry(entry.getKey(), result)))
                .collectMap(Map.Entry::getKey, Map.Entry::getValue, LinkedHashMap::new)
                .map(LinkedHashMap::new);
    }

    private Mono<Map<String, Object>> probeUrl(String url) {
        long start = System.currentTimeMillis();
        return webClient.get()
                .uri(url)
                .exchangeToMono(clientResponse -> {
                    HttpStatusCode status = clientResponse.statusCode();
                    Map<String, Object> result = new LinkedHashMap<>();
                    result.put("url", url);
                    result.put("status", status.value());
                    result.put("reachable", true);
                    result.put("elapsedMs", System.currentTimeMillis() - start);
                    return Mono.just(result);
                })
                .timeout(Duration.ofSeconds(8))
                .onErrorResume(ex -> {
                    Map<String, Object> result = new LinkedHashMap<>();
                    result.put("url", url);
                    result.put("reachable", false);
                    result.put("elapsedMs", System.currentTimeMillis() - start);
                    result.put("errorType", ex.getClass().getSimpleName());
                    result.put("error", ex.getMessage());
                    return Mono.just(result);
                });
    }

    private String join(String baseUri, String path) {
        String base = baseUri == null ? "" : baseUri.replaceAll("/+$", "");
        return base + path;
    }
}
