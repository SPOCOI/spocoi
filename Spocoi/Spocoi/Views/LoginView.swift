import SwiftUI

struct LoginView: View {
    @Environment(AuthStore.self) private var authStore
    @State private var email = ""
    @State private var password = ""
    @State private var showSignup = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Spacer()

                VStack(spacing: 4) {
                    Circle()
                        .fill(Color.spocoiBrand)
                        .frame(width: 40, height: 40)
                        .overlay(
                            Circle()
                                .fill(.white)
                                .frame(width: 30, height: 30)
                                .offset(x: 10, y: -3)
                        )
                        .clipShape(Circle())
                    Text("spocoi")
                        .font(.title2.bold())
                        .foregroundStyle(Color.spocoiInk)
                }
                .padding(.bottom, 16)

                VStack(spacing: 12) {
                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .padding()
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))

                    SecureField("Parolă", text: $password)
                        .textContentType(.password)
                        .padding()
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
                }

                if let error = authStore.errorMessage {
                    Text(error)
                        .font(.footnote)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                }

                Button {
                    Task { await authStore.signIn(email: email, password: password) }
                } label: {
                    if authStore.isLoading {
                        ProgressView().tint(Color.spocoiInk)
                    } else {
                        Text("Intră în cont").fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.spocoiBrand, in: RoundedRectangle(cornerRadius: 12))
                .foregroundStyle(Color.spocoiInk)
                .disabled(email.isEmpty || password.isEmpty || authStore.isLoading)

                Button("Nu ai cont? Creează unul") {
                    showSignup = true
                }
                .font(.footnote)

                Spacer()
                Spacer()
            }
            .padding(24)
            .navigationDestination(isPresented: $showSignup) {
                SignupView()
            }
        }
    }
}

#Preview {
    LoginView().environment(AuthStore())
}
