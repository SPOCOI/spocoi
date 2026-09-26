import SwiftUI
import CoreText

/// spocoi's brand typeface is Poppins (see brandbook) — the app previously
/// rendered everything in the system font, which is a real brand gap on a
/// screen that's otherwise fully branded (logo, colors). Registered at
/// launch from bundled .ttf files rather than declared via Info.plist's
/// UIAppFonts, so adding/removing weights never needs an Xcode project edit.
enum PoppinsFont {
    static func registerAll() {
        for name in ["Poppins-Light", "Poppins-Regular", "Poppins-Medium", "Poppins-SemiBold", "Poppins-Bold"] {
            guard let url = Bundle.main.url(forResource: name, withExtension: "ttf") else { continue }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }
}

extension Font {
    static func poppins(_ weight: Font.Weight = .regular, size: CGFloat) -> Font {
        let name: String
        switch weight {
        case .light: name = "Poppins-Light"
        case .medium: name = "Poppins-Medium"
        case .semibold: name = "Poppins-SemiBold"
        case .bold, .heavy, .black: name = "Poppins-Bold"
        default: name = "Poppins-Regular"
        }
        return .custom(name, size: size)
    }
}
