import SwiftUI

struct ContentView: View {
    @Environment(AuthStore.self) private var authStore
    @AppStorage(AppearanceMode.storageKey) private var appearanceModeRaw = AppearanceMode.system.rawValue
    @AppStorage("spocoi.dailyReminderEnabled") private var reminderEnabled = false
    @AppStorage("spocoi.dailyReminderHour") private var reminderHour = 20
    @AppStorage("spocoi.dailyReminderMinute") private var reminderMinute = 0
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
            // Keeps the rolling reminder window topped up — a fresh install of
            // the 14-day batch every launch is cheap and idempotent.
            if reminderEnabled {
                NotificationScheduler.scheduleDailyReminder(hour: reminderHour, minute: reminderMinute)
            }
        }
        .preferredColorScheme((AppearanceMode(rawValue: appearanceModeRaw) ?? .system).colorScheme)
    }
}

#Preview {
    ContentView().environment(AuthStore())
}
