import SwiftUI

@main
struct SpocoiApp: App {
    @State private var authStore = AuthStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(authStore)
        }
    }
}
