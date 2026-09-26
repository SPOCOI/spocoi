import SwiftUI

/// Two overlapping circles, like the brand mark — but here the shadow
/// circle's offset actually varies with `phase` (0...6), so the moon visibly
/// grows from a thin crescent (phase 0, matches the plain logo mark) toward
/// a full circle (phase 6). The previous static dot row didn't encode this
/// at all; a fixed crescent regardless of phase has the same problem.
struct MoonPhaseView: View {
    let phase: Int
    var size: CGFloat = 56

    private var progress: CGFloat {
        CGFloat(min(max(phase, 0), 6)) / 6
    }

    // Phase 0 lands exactly on the brand mark's own crescent (never a blank
    // circle); phase 6 fully separates the shadow, revealing a full moon.
    // A wide range keeps each of the 7 steps visually distinct — a narrow
    // one made adjacent phases nearly indistinguishable.
    private var shadowOffset: CGFloat {
        let minOffset = size * 0.5
        let maxOffset = size * 1.4
        return minOffset + (maxOffset - minOffset) * progress
    }

    var body: some View {
        ZStack {
            Circle()
                .fill(Color.spocoiBrand)
            Circle()
                .fill(Color(.systemBackground))
                .offset(x: shadowOffset)
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
    }
}

#Preview {
    HStack(spacing: 16) {
        ForEach(0...6, id: \.self) { phase in
            MoonPhaseView(phase: phase, size: 40)
        }
    }
    .padding()
}
