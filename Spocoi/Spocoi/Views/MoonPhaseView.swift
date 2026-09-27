import SwiftUI

/// A real lunar-phase silhouette — a fixed half-circle edge plus a variable
/// half-ellipse "terminator", the same construction the brandbook's own
/// moon-phase wheel uses (page 7: navy dark side, brand-yellow lit side on
/// a full disc) — instead of two overlapping full circles, which produced
/// a flat, ellipse-chord "bite" rather than a crescent with proper pointed
/// horns at the poles.
struct MoonPhaseView: View {
    let phase: Int
    var size: CGFloat = 56

    private var progress: CGFloat {
        CGFloat(min(max(phase, 0), 6)) / 6
    }

    // Fraction of the disc that's lit. Starts exactly at the brand mark's
    // own thinness (measured from the brandbook's primary logo: outer
    // radius 150.5, terminator radius 68.5, ratio 0.455 → see
    // BrandCrescent.brandIlluminatedFraction) and grows to a full moon.
    private var illuminatedFraction: CGFloat {
        let start = BrandCrescent.brandIlluminatedFraction
        return start + (1 - start) * progress
    }

    var body: some View {
        ZStack {
            Circle()
                .fill(Color.spocoiBrand)
            MoonShadowShape(illuminatedFraction: illuminatedFraction)
                .fill(Color.spocoiInk)
                // Mirrored so the lit crescent sits on the left at low
                // phases, matching the brand mark's own orientation.
                .scaleEffect(x: -1, y: 1)
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
    }
}

/// The brandbook's primary logo / brandmark crescent (pages 3–5): a pure
/// crescent silhouette, no disc behind it — reuses the exact same
/// terminator-curve shape as MoonPhaseView, just filled once at the
/// brand's fixed thinness instead of animated across phases.
struct BrandCrescent: View {
    /// Measured directly from the brandbook's primary logo (page 4):
    /// outer radius 150.5pt, terminator radius 68.5pt → 68.5/150.5 = 0.455
    /// → illuminated fraction (1 - 0.455) / 2 = 0.2725.
    static let brandIlluminatedFraction: CGFloat = 0.2725
    /// Width/height of the crescent's own bounding box, measured from the
    /// same source (266×301pt) — used to avoid dead space when framing it.
    static let aspectRatio: CGFloat = 266.0 / 301.0

    var body: some View {
        MoonShadowShape(illuminatedFraction: Self.brandIlluminatedFraction)
            .fill(Color.spocoiBrand)
            .scaleEffect(x: -1, y: 1)
            .aspectRatio(Self.aspectRatio, contentMode: .fit)
    }
}

/// The dark (unlit) part of the disc: a fixed right half-circle plus a
/// half-ellipse whose horizontal radius and direction encode how much of
/// the disc is lit — collapsing to nothing at a full moon, growing to a
/// full circle at a new moon.
struct MoonShadowShape: Shape {
    var illuminatedFraction: CGFloat

    func path(in rect: CGRect) -> Path {
        let r = min(rect.width, rect.height) / 2
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let top = CGPoint(x: center.x, y: center.y - r)
        let bottom = CGPoint(x: center.x, y: center.y + r)

        // theta: +1 at new moon (shadow is a full circle), -1 at full moon
        // (shadow collapses to nothing), 0 at half-lit.
        let theta = 1 - 2 * illuminatedFraction
        let rx = r * theta
        let side = CGPoint(x: center.x + rx, y: center.y)
        let kappa: CGFloat = 0.5522847498

        var path = Path()
        path.move(to: top)
        path.addArc(center: center, radius: r, startAngle: .degrees(-90), endAngle: .degrees(90), clockwise: true)
        path.addCurve(
            to: side,
            control1: CGPoint(x: center.x + kappa * rx, y: bottom.y),
            control2: CGPoint(x: side.x, y: side.y + kappa * r)
        )
        path.addCurve(
            to: top,
            control1: CGPoint(x: side.x, y: side.y - kappa * r),
            control2: CGPoint(x: center.x + kappa * rx, y: top.y)
        )
        path.closeSubpath()
        return path
    }
}

#Preview {
    HStack(spacing: 12) {
        ForEach(0...6, id: \.self) { phase in
            MoonPhaseView(phase: phase, size: 40)
        }
    }
    .padding()
}
