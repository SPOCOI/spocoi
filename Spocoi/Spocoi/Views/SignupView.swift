import SwiftUI

struct SignupView: View {
    @Environment(AuthStore.self) private var authStore
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var password = ""
    @State private var ageConfirmed = false
    @State private var specialCategoryConsent = false

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

                // Both required — see CONSENT_POLICY_VERSION in
                // src/app/api/ios/auth/signup/route.ts: age attestation and
                // explicit Art. 9(2)(a) consent for health-adjacent data.
                Toggle(isOn: $ageConfirmed) {
                    Text("Confirm că am cel puțin vârsta minimă necesară.")
                        .font(.footnote)
                }
                Toggle(isOn: $specialCategoryConsent) {
                    Text("Sunt de acord ca spocoi să proceseze date despre starea mea emoțională, conform Politicii de Confidențialitate.")
                        .font(.footnote)
                }

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
                            ageConfirmed: ageConfirmed,
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
                    email.isEmpty || password.count < 8 || !ageConfirmed || !specialCategoryConsent
                        || authStore.isLoading
                )
            }
            .padding(24)
        }
        .onChange(of: authStore.isAuthenticated) { _, isAuthenticated in
            if isAuthenticated { dismiss() }
        }
    }
}

#Preview {
    SignupView().environment(AuthStore())
}
