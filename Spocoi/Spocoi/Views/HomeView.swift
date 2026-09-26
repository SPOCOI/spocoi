import SwiftUI

/// The authenticated app's actual landing screen — mirrors the web app's
/// /chat header area (mood check-in "luna" + trend), not a marketing
/// homepage (that only exists for logged-out visitors on spocoi.com).
struct HomeView: View {
    @Environment(AuthStore.self) private var authStore
    @Binding var selectedTab: Int
    @State private var moodState: MoodState?
    @State private var isSubmitting = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    SpocoiHeader()

                    Text(greeting)
                        .font(.title.bold())
                        .foregroundStyle(Color.spocoiInk)

                    VStack(spacing: 6) {
                        MoonPhaseView(phase: moodState?.phase ?? 0, size: 72)
                        if let moodState {
                            Text("faza \(moodState.phase) din 6" + (moodState.trend != nil ? " · \(trendWord(moodState.trend))" : ""))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity)

                    if let moodState {
                        if !moodState.checkedInToday {
                            moodCheckinCard
                        } else {
                            statusCard(trendLabel(moodState.trend))
                        }
                    }

                    Button {
                        selectedTab = 1
                    } label: {
                        Text("Continuă conversația")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                    }
                    .padding()
                    .background(Color.spocoiBrand, in: RoundedRectangle(cornerRadius: 12))
                    .foregroundStyle(Color.spocoiInk)
                }
                .padding()
            }
            .navigationBarHidden(true)
            .task { await load() }
        }
    }

    private var moodCheckinCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Cum te simți azi, față de ieri?")
                .font(.subheadline.bold())
                .foregroundStyle(Color.spocoiInk)
            HStack(spacing: 8) {
                moodButton("Mai greu", value: "worse")
                moodButton("La fel", value: "same")
                moodButton("Mai bine", value: "better")
            }
        }
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private func moodButton(_ title: String, value: String) -> some View {
        Button {
            Task { await submit(value) }
        } label: {
            Text(title)
                .font(.footnote.weight(.medium))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
        }
        .background(Color.spocoiBrand.opacity(0.2), in: RoundedRectangle(cornerRadius: 10))
        .foregroundStyle(Color.spocoiInk)
        .disabled(isSubmitting)
    }

    @ViewBuilder
    private func statusCard(_ text: String) -> some View {
        HStack {
            Text(text)
                .font(.subheadline)
                .foregroundStyle(Color.spocoiInk)
            Spacer()
        }
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Bună dimineața"
        case 12..<18: return "Bună ziua"
        default: return "Bună seara"
        }
    }

    private func trendWord(_ trend: String?) -> String {
        switch trend {
        case "better": "în creștere"
        case "worse": "în scădere"
        default: "stabil"
        }
    }

    private func trendLabel(_ trend: String?) -> String {
        switch trend {
        case "better": "Ai spus că te simți mai bine azi — ascultă, în creștere."
        case "worse": "Ai spus că te simți mai greu azi — suntem aici."
        default: "Ai făcut deja check-in-ul de azi."
        }
    }

    private func load() async {
        moodState = try? await authStore.authorizedGet("mood")
    }

    private func submit(_ value: String) async {
        isSubmitting = true
        if let updated: MoodState = try? await authStore.authorizedPost("mood", body: MoodCheckinBody(value: value)) {
            moodState = updated
        }
        isSubmitting = false
    }
}

#Preview {
    HomeView(selectedTab: .constant(0)).environment(AuthStore())
}
