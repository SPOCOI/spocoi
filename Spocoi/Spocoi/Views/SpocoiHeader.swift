import SwiftUI

/// Logo mark + wordmark, reused at the top of Home and Chat — mirrors the
/// small header used on the web app's own /chat page.
struct SpocoiHeader: View {
    var body: some View {
        HStack(spacing: 8) {
            Image("BrandMark")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 19, height: 22)
            Text("spocoi")
                .font(.poppins(.bold, size: 20))
                .foregroundStyle(Color.spocoiInk)
            Spacer()
        }
        .padding(.horizontal)
        .padding(.top, 8)
        .padding(.bottom, 4)
    }
}

#Preview {
    SpocoiHeader()
}
