import SwiftUI

@main
struct SpocoiApp: App {
    @State private var authStore = AuthStore()

    init() {
        PoppinsFont.registerAll()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(authStore)
        }
    }
}
