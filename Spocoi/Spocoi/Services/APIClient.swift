import Foundation

enum APIError: Error, LocalizedError {
    case network
    case decoding
    case server(String)
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .network: return "Problemă de rețea. Verifică conexiunea."
        case .decoding: return "Răspuns neașteptat de la server."
        case .server(let message): return message
        case .unauthorized: return "Sesiune expirată."
        }
    }
}

private struct EmptyBody: Encodable {}

/// Talks to src/app/api/ios/** — see that folder for the exact route
/// contracts. No cookie session (native app), so every authenticated call
/// carries `Authorization: Bearer <supabase-access-token>` instead.
final class APIClient {
    static let shared = APIClient()
    // www, not the apex domain — spocoi.com 308-redirects to www.spocoi.com,
    // and URLSession's default redirect handling drops the Authorization
    // header on a cross-host redirect (standard security behavior), which
    // silently turned every authenticated call into an anonymous one.
    private let baseURL = URL(string: "https://www.spocoi.com/api/ios")!
    private init() {}

    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return decoder
    }()

    func get<T: Decodable>(_ path: String, token: String) async throws -> T {
        try await send(path, method: "GET", body: Optional<EmptyBody>.none, token: token)
    }

    func post<T: Decodable, B: Encodable>(_ path: String, body: B, token: String? = nil) async throws -> T {
        try await send(path, method: "POST", body: body, token: token)
    }

    private func send<T: Decodable, B: Encodable>(
        _ path: String,
        method: String,
        body: B?,
        token: String?
    ) async throws -> T {
        let url = baseURL.appendingPathComponent(path)
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw APIError.network
        }

        guard let http = response as? HTTPURLResponse else { throw APIError.network }
        if http.statusCode == 401 { throw APIError.unauthorized }
        guard (200..<300).contains(http.statusCode) else {
            let message = String(data: data, encoding: .utf8) ?? "Eroare necunoscută (\(http.statusCode))."
            throw APIError.server(message)
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decoding
        }
    }
}
