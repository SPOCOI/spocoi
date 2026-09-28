import SwiftUI

/// The authenticated app's actual landing screen — mirrors the web app's
/// /chat header area (mood check-in "luna" + trend), not a marketing
/// homepage (that only exists for logged-out visitors on spocoi.com).
struct HomeView: View {
    @Environment(AuthStore.self) private var authStore
    @Binding var selectedTab: Int
    @State private var moodState: MoodState?
    @State private var recap: DailyRecap?
    @State private var isSubmitting = false
    @State private var isDismissingRecap = false

    var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(
                    colors: [Color.spocoiBrandTertiary.opacity(0.7), Color(.systemBackground)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 420)
                .frame(maxHeight: .infinity, alignment: .top)
                .ignoresSafeArea(edges: .top)

                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        SpocoiHeader()

                        if let recap {
                            recapCard(recap)
                        }

                        moonCard

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
                                .font(.poppins(.semibold, size: 17))
                                .frame(maxWidth: .infinity)
                        }
                        .padding()
                        .background(Color.spocoiBrand, in: RoundedRectangle(cornerRadius: 14))
                        .foregroundStyle(Color.spocoiInk)

                        reassurance
                    }
                    .padding()
                    .padding(.bottom, 24)
                }
            }
            .navigationBarHidden(true)
            .task { await load() }
        }
    }

    private var moonCard: some View {
        VStack(spacing: 10) {
            Text(greeting)
                .font(.poppins(.semibold, size: 26))
                .foregroundStyle(Color.spocoiInk)
                .frame(maxWidth: .infinity, alignment: .leading)

            MoonPhaseView(phase: moodState?.phase ?? 0, size: 84)
                .padding(.top, 4)

            if let moodState {
                Text("faza \(moodState.phase) din 6" + (moodState.trend != nil ? " · \(trendWord(moodState.trend))" : ""))
                    .font(.poppins(size: 13))
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(Color.spocoiBrandSecondary.opacity(0.35))
        )
    }

    private func recapCard(_ recap: DailyRecap) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Recapitulare de ieri")
                .font(.poppins(.semibold, size: 13))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
            Text(recap.summary)
                .font(.poppins(size: 15))
                .foregroundStyle(Color.spocoiInk)
            Button {
                Task { await dismissRecap(recap) }
            } label: {
                Text("Am văzut")
                    .font(.poppins(.medium, size: 13))
            }
            .foregroundStyle(Color.spocoiInk)
            .disabled(isDismissingRecap)
        }
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private var moodCheckinCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Cum te simți azi, față de ieri?")
                .font(.poppins(.semibold, size: 15))
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
                .font(.poppins(.medium, size: 13))
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
                .font(.poppins(size: 15))
                .foregroundStyle(Color.spocoiInk)
            Spacer()
        }
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private var reassurance: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "moon.stars.fill")
                .foregroundStyle(Color.spocoiBrand)
            Text("Oricât de greu ar fi azi, poți vorbi despre asta aici — fără liste de așteptare, fără să fii repezit.")
                .font(.poppins(size: 13))
                .foregroundStyle(.secondary)
        }
        .padding(.top, 4)
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
        async let moodResult: MoodState? = try? await authStore.authorizedGet("mood")
        async let recapResult: RecapResponse? = try? await authStore.authorizedGet("recap/daily")
        moodState = await moodResult
        recap = await recapResult?.recap
    }

    private func dismissRecap(_ recap: DailyRecap) async {
        isDismissingRecap = true
        self.recap = nil
        let _: EmptyResponse? = try? await authStore.authorizedPost("recap/daily", body: DismissRecapBody(id: recap.id))
        isDismissingRecap = false
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
