import Foundation

struct ChatMessage: Codable, Identifiable, Equatable {
    let id: String
    let role: String // "user" | "assistant"
    let modality: String
    let content: String
    let createdAt: String
}

struct AuthResponse: Codable {
    let status: String
    let accessToken: String?
    let refreshToken: String?
    let message: String?
}

struct ActiveConversationResponse: Codable {
    let conversationId: String
}

struct MessagesListResponse: Codable {
    let messages: [ChatMessage]
}

struct SendMessageResponse: Codable {
    let status: String
    let userMessage: ChatMessage?
    let assistantMessage: ChatMessage?
    let reason: String?
}

// Request bodies — field names match src/app/api/ios/**/route.ts exactly
// (those routes use camelCase for their own fields, unlike the snake_case
// Supabase session fields in the responses above).
struct SignupBody: Encodable {
    let email: String
    let password: String
    let ageConfirmed: Bool
    let specialCategoryConsent: Bool
}

struct SigninBody: Encodable {
    let email: String
    let password: String
}

struct RefreshBody: Encodable {
    let refreshToken: String

    enum CodingKeys: String, CodingKey {
        case refreshToken = "refresh_token"
    }
}

struct SendMessageBody: Encodable {
    let content: String
    let locale: String
}

struct MoodState: Codable {
    let phase: Int
    let checkedInToday: Bool
    let trend: String? // "worse" | "same" | "better"
}

struct MoodCheckinBody: Encodable {
    let value: String
}
