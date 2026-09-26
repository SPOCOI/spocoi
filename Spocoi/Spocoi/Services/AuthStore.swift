import Foundation
import Observation

@Observable
final class AuthStore {
    private(set) var accessToken: String?
    private var refreshToken: String?
    var errorMessage: String?
    var isLoading = false

    var isAuthenticated: Bool { accessToken != nil }

    private let accessTokenKey = "spocoi.accessToken"
    private let refreshTokenKey = "spocoi.refreshToken"

    init() {
        accessToken = KeychainStore.get(accessTokenKey)
        refreshToken = KeychainStore.get(refreshTokenKey)
    }

    /// Called once at app launch — the stored access token may already be
    /// expired (Supabase access tokens last ~1h), so get a fresh one right
    /// away rather than waiting for the first API call to fail with 401.
    func bootstrap() async {
        guard accessToken != nil else { return }
        _ = await refreshSession()
    }

    func signUp(email: String, password: String, ageConfirmed: Bool, specialCategoryConsent: Bool) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let body = SignupBody(
                email: email,
                password: password,
                ageConfirmed: ageConfirmed,
                specialCategoryConsent: specialCategoryConsent
            )
            let response: AuthResponse = try await APIClient.shared.post("auth/signup", body: body)
            handle(response)
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription ?? "A apărut o eroare."
        }
    }

    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let body = SigninBody(email: email, password: password)
            let response: AuthResponse = try await APIClient.shared.post("auth/signin", body: body)
            handle(response)
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription ?? "A apărut o eroare."
        }
    }

    func signOut() {
        accessToken = nil
        refreshToken = nil
        KeychainStore.remove(accessTokenKey)
        KeychainStore.remove(refreshTokenKey)
    }

    /// True if a fresh access token was obtained. False (and signed out)
    /// means the refresh token is also no longer valid — the user has to
    /// log in again.
    @discardableResult
    private func refreshSession() async -> Bool {
        guard let refreshToken else { return false }
        do {
            let response: AuthResponse = try await APIClient.shared.post(
                "auth/refresh",
                body: RefreshBody(refreshToken: refreshToken)
            )
            guard response.status == "ok", let access = response.accessToken, let refresh = response.refreshToken else {
                signOut()
                return false
            }
            accessToken = access
            self.refreshToken = refresh
            KeychainStore.set(access, for: accessTokenKey)
            KeychainStore.set(refresh, for: refreshTokenKey)
            return true
        } catch {
            signOut()
            return false
        }
    }

    private func handle(_ response: AuthResponse) {
        switch response.status {
        case "ok":
            guard let access = response.accessToken, let refresh = response.refreshToken else {
                errorMessage = "Răspuns invalid de la server."
                return
            }
            accessToken = access
            refreshToken = refresh
            KeychainStore.set(access, for: accessTokenKey)
            KeychainStore.set(refresh, for: refreshTokenKey)
        case "confirm-email":
            errorMessage = "Verifică-ți emailul pentru a confirma contul."
        case "consent-required":
            errorMessage = "Trebuie să confirmi vârsta și consimțământul."
        case "rate-limited":
            errorMessage = "Prea multe încercări. Încearcă din nou mai târziu."
        default:
            errorMessage = response.message ?? "A apărut o eroare."
        }
    }

    // MARK: - Authenticated requests (auto-refresh once on 401)

    func authorizedGet<T: Decodable>(_ path: String) async throws -> T {
        guard let token = accessToken else { throw APIError.unauthorized }
        do {
            return try await APIClient.shared.get(path, token: token)
        } catch APIError.unauthorized {
            guard await refreshSession(), let newToken = accessToken else {
                throw APIError.unauthorized
            }
            return try await APIClient.shared.get(path, token: newToken)
        }
    }

    func authorizedPost<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        guard let token = accessToken else { throw APIError.unauthorized }
        do {
            return try await APIClient.shared.post(path, body: body, token: token)
        } catch APIError.unauthorized {
            guard await refreshSession(), let newToken = accessToken else {
                throw APIError.unauthorized
            }
            return try await APIClient.shared.post(path, body: body, token: newToken)
        }
    }
}
