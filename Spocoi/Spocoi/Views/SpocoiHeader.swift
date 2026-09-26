import SwiftUI

/// Logo mark + wordmark, reused at the top of Home and Chat — mirrors the
/// small header used on the web app's own /chat page.
struct SpocoiHeader: View {
    var body: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(Color.spocoiBrand)
                .frame(width: 22, height: 22)
                .overlay(
                    Circle()
                        .fill(.white)
                        .frame(width: 16, height: 16)
                        .offset(x: 5, y: -2)
                )
                .clipShape(Circle())
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
