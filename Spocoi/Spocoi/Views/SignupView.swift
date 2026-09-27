import SwiftUI

struct SignupView: View {
    @Environment(AuthStore.self) private var authStore
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var birthDate = Date()
    @State private var birthDateSelected = false
    @State private var specialCategoryConsent = false
    @State private var legalScreen: LegalDocument?

    private static let minimumAge = 16

    private var age: Int {
        Calendar.current.dateComponents([.year], from: birthDate, to: Date()).year ?? 0
    }

    private var isOldEnough: Bool { age >= Self.minimumAge }
    private var passwordsMatch: Bool { !password.isEmpty && password == confirmPassword }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                Text("Creează cont")
                    .font(.title2.bold())
                    .foregroundStyle(Color.spocoiInk)
                    .frame(maxWidth: .infinity, alignment: .leading)

                TextField("Email", text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .padding()
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))

                SecureField("Parolă (minim 8 caractere)", text: $password)
                    .textContentType(.newPassword)
                    .padding()
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))

                SecureField("Confirmă parola", text: $confirmPassword)
                    .textContentType(.newPassword)
                    .padding()
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))

                if !confirmPassword.isEmpty && !passwordsMatch {
                    Text("Parolele nu coincid.")
                        .font(.footnote)
                        .foregroundStyle(.red)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Data nașterii")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                    DatePicker(
                        "Data nașterii",
                        selection: $birthDate,
                        in: ...Date(),
                        displayedComponents: .date
                    )
                    .environment(\.locale, Locale(identifier: "ro_RO"))
                    .labelsHidden()
                    .datePickerStyle(.compact)
                    .onChange(of: birthDate) { _, _ in birthDateSelected = true }

                    if birthDateSelected && !isOldEnough {
                        Text("Trebuie să ai cel puțin \(Self.minimumAge) ani pentru a folosi spocoi.")
                            .font(.footnote)
                            .foregroundStyle(.red)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))

                // Required — explicit Art. 9(2)(a) consent for
                // health-adjacent data. See CONSENT_POLICY_VERSION in
                // src/app/api/ios/auth/signup/route.ts.
                Toggle(isOn: $specialCategoryConsent) {
                    Text("Sunt de acord ca spocoi să proceseze date despre starea mea emoțională, conform Politicii de Confidențialitate.")
                        .font(.footnote)
                }

                Button("Vezi Termenii și Politica de Confidențialitate") {
                    legalScreen = .terms
                }
                .font(.footnote)
                .frame(maxWidth: .infinity, alignment: .leading)

                if let error = authStore.errorMessage {
                    Text(error)
                        .font(.footnote)
                        .foregroundStyle(.red)
                }

                Button {
                    Task {
                        await authStore.signUp(
                            email: email,
                            password: password,
                            birthDate: birthDate,
                            specialCategoryConsent: specialCategoryConsent
                        )
                    }
                } label: {
                    if authStore.isLoading {
                        ProgressView().tint(Color.spocoiInk)
                    } else {
                        Text("Creează cont").fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.spocoiBrand, in: RoundedRectangle(cornerRadius: 12))
                .foregroundStyle(Color.spocoiInk)
                .disabled(
                    email.isEmpty || password.count < 8 || !passwordsMatch
                        || !birthDateSelected || !isOldEnough || !specialCategoryConsent
                        || authStore.isLoading
                )
            }
            .padding(24)
        }
        .onChange(of: authStore.isAuthenticated) { _, isAuthenticated in
            if isAuthenticated { dismiss() }
        }
        .sheet(item: $legalScreen) { document in
            LegalWebScreen(title: document.title, url: document.url)
        }
    }
}

#Preview {
    SignupView().environment(AuthStore())
}
