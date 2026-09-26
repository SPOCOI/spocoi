import SwiftUI

struct ContentView: View {
    @Environment(AuthStore.self) private var authStore
    @AppStorage(AppearanceMode.storageKey) private var appearanceModeRaw = AppearanceMode.system.rawValue
    @State private var didBootstrap = false

    var body: some View {
        Group {
            if !didBootstrap {
                ProgressView()
            } else if authStore.isAuthenticated {
                MainTabView()
            } else {
                LoginView()
            }
        }
        .task {
            await authStore.bootstrap()
            didBootstrap = true
        }
        .preferredColorScheme((AppearanceMode(rawValue: appearanceModeRaw) ?? .system).colorScheme)
    }
}

#Preview {
    ContentView().environment(AuthStore())
}
