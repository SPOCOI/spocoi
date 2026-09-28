import SwiftUI

struct AccountView: View {
    @Environment(AuthStore.self) private var authStore
    @AppStorage(AppearanceMode.storageKey) private var appearanceModeRaw = AppearanceMode.system.rawValue
    @AppStorage("spocoi.dailyReminderEnabled") private var reminderEnabled = false
    @AppStorage("spocoi.dailyReminderHour") private var reminderHour = 20
    @AppStorage("spocoi.dailyReminderMinute") private var reminderMinute = 0
    @State private var legalScreen: LegalDocument?

    var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(
                    colors: [Color.spocoiBrandTertiary.opacity(0.7), Color(.systemBackground)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 320)
                .frame(maxHeight: .infinity, alignment: .top)
                .ignoresSafeArea(edges: .top)

                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        SpocoiHeader()

                        Text("Cont")
                            .font(.poppins(.semibold, size: 26))
                            .foregroundStyle(Color.spocoiInk)

                        profileCard
                        subscriptionCard
                        appearanceCard
                        reminderCard
                        privacyCard

                        Button(role: .destructive) {
                            authStore.signOut()
                        } label: {
                            Text("Ieși din cont")
                                .font(.poppins(.medium, size: 15))
                                .frame(maxWidth: .infinity)
                        }
                        .padding()
                        .background(Color.red.opacity(0.12), in: RoundedRectangle(cornerRadius: 14))
                        .foregroundStyle(.red)
                    }
                    .padding()
                    .padding(.bottom, 24)
                }
            }
            .navigationBarHidden(true)
            .sheet(item: $legalScreen) { document in
                LegalWebScreen(title: document.title, url: document.url)
            }
        }
    }

    private var profileCard: some View {
        HStack(spacing: 14) {
            Circle()
                .fill(Color.spocoiBrand)
                .frame(width: 52, height: 52)
                .overlay(
                    Image(systemName: "person.fill")
                        .foregroundStyle(Color.spocoiInk)
                        .font(.system(size: 20))
                )
            VStack(alignment: .leading, spacing: 2) {
                Text("Contul tău")
                    .font(.poppins(.semibold, size: 16))
                    .foregroundStyle(Color.spocoiInk)
                Text("spocoi")
                    .font(.poppins(size: 13))
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.spocoiBrandSecondary.opacity(0.35))
        )
    }

    private var subscriptionCard: some View {
        cardSection(title: "Abonament") {
            HStack {
                Text("Tier curent")
                    .font(.poppins(size: 15))
                    .foregroundStyle(Color.spocoiInk)
                Spacer()
                Text("FREE")
                    .font(.poppins(.medium, size: 14))
                    .foregroundStyle(.secondary)
            }
            Divider()
            Button { legalScreen = .pricing } label: {
                HStack {
                    Text("Vezi planurile")
                        .font(.poppins(.medium, size: 15))
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.system(size: 13))
                }
            }
            .foregroundStyle(Color.spocoiInk)
        }
    }

    private var appearanceCard: some View {
        cardSection(title: "Aspect") {
            Picker("Temă", selection: $appearanceModeRaw) {
                ForEach(AppearanceMode.allCases) { mode in
                    Text(mode.label).tag(mode.rawValue)
                }
            }
            .pickerStyle(.segmented)
        }
    }

    private var reminderTimeBinding: Binding<Date> {
        Binding(
            get: {
                Calendar.current.date(bySettingHour: reminderHour, minute: reminderMinute, second: 0, of: Date()) ?? Date()
            },
            set: { newValue in
                let components = Calendar.current.dateComponents([.hour, .minute], from: newValue)
                reminderHour = components.hour ?? 20
                reminderMinute = components.minute ?? 0
                if reminderEnabled {
                    NotificationScheduler.scheduleDailyReminder(hour: reminderHour, minute: reminderMinute)
                }
            }
        )
    }

    private var reminderCard: some View {
        cardSection(title: "Amintiri") {
            Toggle("Amintire zilnică", isOn: Binding(
                get: { reminderEnabled },
                set: { newValue in
                    if newValue {
                        Task {
                            let granted = await NotificationScheduler.requestAuthorizationIfNeeded()
                            if granted {
                                reminderEnabled = true
                                NotificationScheduler.scheduleDailyReminder(hour: reminderHour, minute: reminderMinute)
                            } else {
                                reminderEnabled = false
                            }
                        }
                    } else {
                        reminderEnabled = false
                        NotificationScheduler.cancelDailyReminder()
                    }
                }
            ))
            .font(.poppins(size: 15))
            .foregroundStyle(Color.spocoiInk)

            if reminderEnabled {
                DatePicker("Ora", selection: reminderTimeBinding, displayedComponents: .hourAndMinute)
                    .font(.poppins(size: 15))
                    .foregroundStyle(Color.spocoiInk)
            }

            Text("Poți opri asta oricând. Nu trimitem niciodată mai mult de o notificare pe zi.")
                .font(.poppins(size: 12))
                .foregroundStyle(.secondary)
        }
    }

    private var privacyCard: some View {
        cardSection(title: "Confidențialitate") {
            Button { legalScreen = .terms } label: {
                HStack {
                    Text("Termeni și condiții")
                        .font(.poppins(.medium, size: 15))
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.system(size: 13))
                }
            }
            .foregroundStyle(Color.spocoiInk)
            Divider()
            Button { legalScreen = .privacy } label: {
                HStack {
                    Text("Politica de confidențialitate")
                        .font(.poppins(.medium, size: 15))
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.system(size: 13))
                }
            }
            .foregroundStyle(Color.spocoiInk)
        }
    }

    @ViewBuilder
    private func cardSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.poppins(.semibold, size: 13))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
                .padding(.horizontal, 4)
            VStack(spacing: 12) {
                content()
            }
            .padding(16)
            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
        }
    }
}

enum LegalDocument: String, Identifiable {
    case terms, privacy, pricing

    var id: String { rawValue }

    var title: String {
        switch self {
        case .terms: "Termeni și condiții"
        case .privacy: "Confidențialitate"
        case .pricing: "Planuri și prețuri"
        }
    }

    var url: URL {
        switch self {
        case .terms: URL(string: "https://www.spocoi.com/ro/legal/terms")!
        case .privacy: URL(string: "https://www.spocoi.com/ro/legal/privacy")!
        case .pricing: URL(string: "https://www.spocoi.com/ro/pricing")!
        }
    }
}

#Preview {
    AccountView().environment(AuthStore())
}
