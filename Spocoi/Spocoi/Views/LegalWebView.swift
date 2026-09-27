import SwiftUI
import WebKit

/// Terms/Privacy stay single-sourced on the website (still "draft, pending
/// legal review" per CLAUDE.md and subject to change) — this renders that
/// same page inside the app instead of duplicating the legal text in Swift,
/// so it never drifts out of sync, while never leaving the app into Safari.
private struct WebViewRepresentable: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        WKWebView()
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        webView.load(URLRequest(url: url))
    }
}

struct LegalWebScreen: View {
    let title: String
    let url: URL
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            WebViewRepresentable(url: url)
                .navigationTitle(title)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Închide") { dismiss() }
                    }
                }
        }
    }
}
