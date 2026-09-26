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

                    Text("Bună!")
                        .font(.title.bold())
                        .foregroundStyle(Color.spocoiInk)

                    PhaseIndicator(phase: moodState?.phase ?? 0)

                    if let moodState {
                        if !moodState.checkedInToday {
                            moodCheckinCard
                        } else {
                            Text(trendLabel(moodState.trend))
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
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

    private func trendLabel(_ trend: String?) -> String {
        switch trend {
        case "better": "ascultă · în creștere"
        case "worse": "ascultă · în scădere"
        default: "ascultă"
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

/// Simplified stand-in for the web's two-circle "moon phase" SVG (0...6) —
/// a row of dots filled up to the current phase.
private struct PhaseIndicator: View {
    let phase: Int

    var body: some View {
        HStack(spacing: 6) {
            ForEach(0..<7, id: \.self) { i in
                Circle()
                    .fill(i <= phase ? Color.spocoiBrand : Color(.systemGray5))
                    .frame(width: 10, height: 10)
            }
        }
    }
}

#Preview {
    HomeView(selectedTab: .constant(0)).environment(AuthStore())
}
