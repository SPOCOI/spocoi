import SwiftUI

struct ContentView: View {
    @Environment(AuthStore.self) private var authStore
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
    }
}

#Preview {
    ContentView().environment(AuthStore())
}
