import AuthenticationServices
import UIKit

/// Drives Google sign-in's browser step. ASWebAuthenticationSession (not
/// SFSafariViewController) captures the spocoi:// redirect directly without
/// needing the app to register that URL scheme or implement openURL(_:).
final class OAuthWebSession: NSObject, ASWebAuthenticationPresentationContextProviding {
    private var session: ASWebAuthenticationSession?

    static func authenticate(url: URL, callbackScheme: String) async throws -> URL {
        let helper = OAuthWebSession()
        return try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(url: url, callbackURLScheme: callbackScheme) { callbackURL, error in
                if let callbackURL {
                    continuation.resume(returning: callbackURL)
                } else {
                    continuation.resume(throwing: error ?? APIError.network)
                }
            }
            session.presentationContextProvider = helper
            session.prefersEphemeralWebBrowserSession = true
            helper.session = session
            session.start()
        }
    }

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow } ?? ASPresentationAnchor()
    }
}
