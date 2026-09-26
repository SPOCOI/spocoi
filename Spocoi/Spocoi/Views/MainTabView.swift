import SwiftUI

/// Root screen once authenticated. Home is the real landing point (mood
/// check-in, matches the web app's own /chat header area) — not a
/// marketing homepage, which only exists for logged-out visitors on
/// spocoi.com.
struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(selectedTab: $selectedTab)
                .tabItem { Label("Acasă", systemImage: "moon.stars.fill") }
                .tag(0)

            ChatView()
                .tabItem { Label("Chat", systemImage: "bubble.left.and.bubble.right.fill") }
                .tag(1)

            AccountView()
                .tabItem { Label("Cont", systemImage: "person.fill") }
                .tag(2)
        }
        .tint(Color.spocoiBrand)
    }
}

#Preview {
    MainTabView().environment(AuthStore())
}
