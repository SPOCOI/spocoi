import Foundation
import Observation
import AuthenticationServices

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

    private static let birthDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.timeZone = TimeZone(identifier: "UTC")
        return formatter
    }()

    func signUp(email: String, password: String, birthDate: Date, specialCategoryConsent: Bool) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let body = SignupBody(
                email: email,
                password: password,
                birthDate: Self.birthDateFormatter.string(from: birthDate),
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

    /// Passwordless login, step 1: ask Supabase to email a 6-digit code to
    /// an *existing* user (the backend passes shouldCreateUser: false).
    func requestEmailCode(email: String) async -> Bool {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let _: EmptyResponse = try await APIClient.shared.post("auth/otp/request", body: OtpRequestBody(email: email))
            return true
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription ?? "A apărut o eroare."
            return false
        }
    }

    /// Passwordless login, step 2: exchange the emailed code for a session.
    func verifyEmailCode(email: String, code: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let response: AuthResponse = try await APIClient.shared.post(
                "auth/otp/verify",
                body: OtpVerifyBody(email: email, token: code)
            )
            handle(response)
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription ?? "A apărut o eroare."
        }
    }

    func signInWithApple(identityToken: String, nonce: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let response: AuthResponse = try await APIClient.shared.post(
                "auth/apple",
                body: AppleSigninBody(identityToken: identityToken, nonce: nonce)
            )
            handle(response)
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription ?? "A apărut o eroare."
        }
    }

    /// Implicit-flow OAuth: the callback URL carries the finished Supabase
    /// session directly in its fragment, so there's no separate token
    /// exchange call — see the comment on auth/oauth/google/start/route.ts.
    func signInWithGoogle() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let start: OAuthStartResponse = try await APIClient.shared.post("auth/oauth/google/start", body: EmptyEncodable())
            guard start.status == "ok", let urlString = start.url, let url = URL(string: urlString) else {
                errorMessage = "Nu am putut porni conectarea cu Google."
                return
            }

            let callbackURL = try await OAuthWebSession.authenticate(url: url, callbackScheme: "spocoi")

            guard let fragment = callbackURL.fragment else {
                errorMessage = "Răspuns invalid de la Google."
                return
            }
            var params: [String: String] = [:]
            for pair in fragment.split(separator: "&") {
                let parts = pair.split(separator: "=", maxSplits: 1).map(String.init)
                guard parts.count == 2 else { continue }
                params[parts[0]] = parts[1].removingPercentEncoding ?? parts[1]
            }

            guard let access = params["access_token"], let refresh = params["refresh_token"] else {
                errorMessage = params["error_description"]?.replacingOccurrences(of: "+", with: " ")
                    ?? "Nu am primit un token valid de la Google."
                return
            }

            accessToken = access
            refreshToken = refresh
            KeychainStore.set(access, for: accessTokenKey)
            KeychainStore.set(refresh, for: refreshTokenKey)
        } catch is CancellationError {
            // User dismissed the browser sheet — not an error.
        } catch {
            let nsError = error as NSError
            if nsError.domain == ASWebAuthenticationSessionErrorDomain,
               nsError.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                return
            }
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
