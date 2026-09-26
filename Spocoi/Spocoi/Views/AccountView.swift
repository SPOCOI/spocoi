import SwiftUI

struct AccountView: View {
    @Environment(AuthStore.self) private var authStore

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

                Section {
                    Button(role: .destructive) {
                        authStore.signOut()
                    } label: {
                        Text("Ieși din cont")
                    }
                }
            }
            .navigationTitle("Cont")
        }
    }
}

#Preview {
    AccountView().environment(AuthStore())
}
