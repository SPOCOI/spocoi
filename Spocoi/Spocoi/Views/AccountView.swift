import SwiftUI

/// Mirrors the web /account page — real profile data from
/// src/app/api/ios/account/**, not placeholders. Account deletion lives
/// here too: App Store Review Guideline 5.1.1(v) requires it in-app for
/// any app that lets users create an account.
struct AccountView: View {
    @Environment(AuthStore.self) private var authStore
    @AppStorage(AppearanceMode.storageKey) private var appearanceModeRaw = AppearanceMode.system.rawValue

    @State private var profile: AccountProfile?
    @State private var displayName = ""
    @State private var personalizationEnabled = false
    @State private var memoryEntries: [MemoryEntry] = []
    @State private var errorMessage: String?
    @State private var infoMessage: String?
    @State private var confirmResetHistory = false
    @State private var confirmDeleteAccount = false
    @State private var isWorking = false

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
                            Text(profile?.displayName ?? "Contul tău")
                                .font(.poppins(.semibold, size: 15))
                            Text(profile?.email ?? " ")
                                .font(.poppins(size: 12))
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage)
                            .font(.footnote)
                            .foregroundStyle(.red)
                    }
                }

                if let infoMessage {
                    Section {
                        Text(infoMessage)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }

                Section("Date de bază") {
                    HStack {
                        TextField("Cum vrei să-ți spunem", text: $displayName)
                            .textInputAutocapitalization(.words)
                        Button("Salvează") {
                            Task { await saveDisplayName() }
                        }
                        .disabled(isWorking || profile == nil || trimmedName == (profile?.displayName ?? ""))
                    }
                }

                Section("Abonament") {
                    HStack {
                        Text("Tier curent")
                        Spacer()
                        Text(profile?.tier.uppercased() ?? "—")
                            .foregroundStyle(.secondary)
                    }
                    Link("Vezi planurile", destination: URL(string: "https://www.spocoi.com/ro/pricing")!)
                }

                Section {
                    Toggle("Personalizare", isOn: $personalizationEnabled)
                        .tint(Color.spocoiBrand)
                        .disabled(profile == nil || isWorking)
                        .onChange(of: personalizationEnabled) { _, newValue in
                            guard let profile, newValue != profile.personalizationEnabled else { return }
                            Task { await setPersonalization(newValue) }
                        }

                    if profile != nil {
                        if !personalizationEnabled {
                            Text("Personalizarea e oprită — spocoi nu construiește niciun portret despre tine.")
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        } else if memoryEntries.isEmpty {
                            Text("Încă nu am notat nimic aici — se completează pe măsură ce vorbim.")
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        } else {
                            ForEach(memoryEntries) { entry in
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(categoryLabel(entry.category))
                                        .font(.poppins(.medium, size: 11))
                                        .foregroundStyle(.secondary)
                                    Text(entry.content)
                                        .font(.poppins(size: 14))
                                }
                                .padding(.vertical, 2)
                            }
                            .onDelete { offsets in
                                Task { await deleteMemoryEntries(at: offsets) }
                            }
                        }
                    }
                } header: {
                    Text("Portretul tău spocoi")
                } footer: {
                    Text("spocoi ține minte fapte durabile din conversațiile tale, ca să nu le repeți de fiecare dată. Nu ține minte conversația cuvânt cu cuvânt — doar esențialul. Glisează spre stânga pe un rând ca să-l ștergi.")
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
                    Link("Termeni și condiții", destination: URL(string: "https://www.spocoi.com/ro/legal/terms")!)
                    Link("Politica de confidențialitate", destination: URL(string: "https://www.spocoi.com/ro/legal/privacy")!)
                }

                Section {
                    Button("Ieși din cont") {
                        authStore.signOut()
                    }
                }

                Section("Zonă periculoasă") {
                    Button("Resetează istoricul conversației", role: .destructive) {
                        confirmResetHistory = true
                    }
                    .disabled(isWorking)

                    Button("Șterge contul definitiv", role: .destructive) {
                        confirmDeleteAccount = true
                    }
                    .disabled(isWorking)
                }
            }
            .navigationTitle("Cont")
            .refreshable { await load() }
            .task { await load() }
            .confirmationDialog(
                "Sigur vrei să ștergi tot istoricul conversației? Nu poate fi anulat.",
                isPresented: $confirmResetHistory,
                titleVisibility: .visible
            ) {
                Button("Resetează", role: .destructive) {
                    Task { await resetHistory() }
                }
            }
            .confirmationDialog(
                "Sigur vrei să ștergi definitiv contul? Toate datele tale vor fi șterse ireversibil.",
                isPresented: $confirmDeleteAccount,
                titleVisibility: .visible
            ) {
                Button("Șterge cont", role: .destructive) {
                    Task { await deleteAccount() }
                }
            }
        }
    }

    // MARK: - Actions

    private func load() async {
        do {
            let loaded: AccountProfile = try await authStore.authorizedGet("account")
            profile = loaded
            displayName = loaded.displayName ?? ""
            personalizationEnabled = loaded.personalizationEnabled
            memoryEntries = loaded.memoryEntries
            errorMessage = nil
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription ?? "Nu am putut încărca contul."
        }
    }

    private func saveDisplayName() async {
        isWorking = true
        defer { isWorking = false }
        do {
            let _: StatusResponse = try await authStore.authorizedPatch(
                "account",
                body: AccountUpdateBody(displayName: trimmedName)
            )
            await load()
        } catch {
            errorMessage = "Numele nu a putut fi salvat."
        }
    }

    private func setPersonalization(_ enabled: Bool) async {
        isWorking = true
        defer { isWorking = false }
        do {
            let _: StatusResponse = try await authStore.authorizedPatch(
                "account",
                body: AccountUpdateBody(personalizationEnabled: enabled)
            )
            await load()
        } catch {
            personalizationEnabled = !enabled
            errorMessage = "Setarea nu a putut fi salvată."
        }
    }

    private func deleteMemoryEntries(at offsets: IndexSet) async {
        let targets = offsets.map { memoryEntries[$0] }
        memoryEntries.remove(atOffsets: offsets)
        for entry in targets {
            do {
                let _: StatusResponse = try await authStore.authorizedDelete("account/memory/\(entry.id)")
            } catch {
                errorMessage = "Nu am putut șterge tot — reîncarc lista."
                await load()
                return
            }
        }
    }

    private func resetHistory() async {
        isWorking = true
        defer { isWorking = false }
        do {
            let _: StatusResponse = try await authStore.authorizedDelete("account/history")
            infoMessage = "Istoricul a fost resetat."
            errorMessage = nil
        } catch {
            errorMessage = "Istoricul nu a putut fi resetat."
        }
    }

    private func deleteAccount() async {
        isWorking = true
        defer { isWorking = false }
        do {
            let _: StatusResponse = try await authStore.authorizedDelete("account")
            authStore.signOut()
        } catch {
            errorMessage = "Contul nu a putut fi șters. Scrie-ne la support@spocoi.co."
        }
    }

    private var trimmedName: String {
        displayName.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private func categoryLabel(_ category: String) -> String {
        switch category {
        case "relatii": return "Relații"
        case "job": return "Muncă"
        case "sanatate": return "Sănătate"
        case "obiective": return "Obiective"
        case "stresori_recurenti": return "Stresori recurenți"
        case "preferinte": return "Preferințe"
        default: return "Altele"
        }
    }
}

#Preview {
    AccountView().environment(AuthStore())
}
