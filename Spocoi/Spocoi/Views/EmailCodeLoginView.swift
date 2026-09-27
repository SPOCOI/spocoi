import SwiftUI

/// Passwordless login: request a 6-digit code by email, then exchange it
/// for a session. Existing users only — see auth/otp/request/route.ts.
struct EmailCodeLoginView: View {
    @Environment(AuthStore.self) private var authStore
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var code = ""
    @State private var codeSent = false

    var body: some View {
        VStack(spacing: 20) {
            Text("Login cu cod pe email")
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
                .disabled(codeSent)

            if codeSent {
                TextField("Codul din email", text: $code)
                    .textContentType(.oneTimeCode)
                    .keyboardType(.numberPad)
                    .padding()
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))

                Text("Am trimis un cod pe \(email). Verifică și emailurile nedorite.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            if let error = authStore.errorMessage {
                Text(error)
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
            }

            Button {
                Task {
                    if codeSent {
                        await authStore.verifyEmailCode(email: email, code: code)
                    } else {
                        codeSent = await authStore.requestEmailCode(email: email)
                    }
                }
            } label: {
                if authStore.isLoading {
                    ProgressView().tint(Color.spocoiInk)
                } else {
                    Text(codeSent ? "Confirmă codul" : "Trimite codul")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.spocoiBrand, in: RoundedRectangle(cornerRadius: 12))
            .foregroundStyle(Color.spocoiInk)
            .disabled(
                authStore.isLoading || email.isEmpty || (codeSent && code.isEmpty)
            )

            Spacer()
        }
        .padding(24)
        .onChange(of: authStore.isAuthenticated) { _, isAuthenticated in
            if isAuthenticated { dismiss() }
        }
    }
}

#Preview {
    EmailCodeLoginView().environment(AuthStore())
}
