import SwiftUI

struct AccountView: View {
    @Environment(AuthStore.self) private var authStore
    @AppStorage(AppearanceMode.storageKey) private var appearanceModeRaw = AppearanceMode.system.rawValue
    @State private var legalScreen: LegalDocument?

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack(spacing: 12) {
                        Circle()
                            .fill(Color.spocoiBrand.opacity(0.2))
                            .frame(width: 44, height: 44)
                            .overlay(
                                Image(systemName: "person.fill")
                                    .foregroundStyle(Color.spocoiInk)
                            )
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Contul tău")
                                .font(.subheadline.bold())
                            Text("spocoi")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }

                Section("Abonament") {
                    HStack {
                        Text("Tier curent")
                        Spacer()
                        Text("FREE")
                            .foregroundStyle(.secondary)
                    }
                    Link("Vezi planurile", destination: URL(string: "https://spocoi.com/pricing")!)
                }

                Section("Aspect") {
                    Picker("Temă", selection: $appearanceModeRaw) {
                        ForEach(AppearanceMode.allCases) { mode in
                            Text(mode.label).tag(mode.rawValue)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Confidențialitate") {
                    Button("Termeni și condiții") { legalScreen = .terms }
                    Button("Politica de confidențialitate") { legalScreen = .privacy }
                }

                Section {
                    Button(role: .destructive) {
                        authStore.signOut()
                    } label: {
                        Text("Ieși din cont")
                    }
                }
            }
            .navigationTitle("Cont")
            .sheet(item: $legalScreen) { document in
                LegalWebScreen(title: document.title, url: document.url)
            }
        }
    }
}

enum LegalDocument: String, Identifiable {
    case terms, privacy

    var id: String { rawValue }

    var title: String {
        switch self {
        case .terms: "Termeni și condiții"
        case .privacy: "Confidențialitate"
        }
    }

    var url: URL {
        switch self {
        case .terms: URL(string: "https://www.spocoi.com/ro/legal/terms")!
        case .privacy: URL(string: "https://www.spocoi.com/ro/legal/privacy")!
        }
    }
}

#Preview {
    AccountView().environment(AuthStore())
}
