import SwiftUI

struct ChatView: View {
    @Environment(AuthStore.self) private var authStore
    @State private var conversationId: String?
    @State private var messages: [ChatMessage] = []
    @State private var draft = ""
    @State private var isSending = false
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                SpocoiHeader()

                if isLoading {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else {
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(alignment: .leading, spacing: 12) {
                                ForEach(messages) { message in
                                    MessageBubble(message: message)
                                        .id(message.id)
                                }
                            }
                            .padding()
                        }
                        .onChange(of: messages) { _, newValue in
                            if let last = newValue.last {
                                withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                            }
                        }
                    }
                }

                if let errorMessage {
                    Text(errorMessage)
                        .font(.footnote)
                        .foregroundStyle(.red)
                        .padding(.horizontal)
                }

                HStack(spacing: 8) {
                    TextField("Scrie ce simți...", text: $draft, axis: .vertical)
                        .padding(10)
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20))
                        .lineLimit(1...4)

                    Button {
                        Task { await send() }
                    } label: {
                        if isSending {
                            ProgressView()
                        } else {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.title)
                        }
                    }
                    .foregroundStyle(Color.spocoiBrand)
                    .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isSending)
                }
                .padding()
            }
            .navigationBarHidden(true)
            .task { await load() }
        }
    }

    private func load() async {
        isLoading = true
        errorMessage = nil
        do {
            let active: ActiveConversationResponse = try await authStore.authorizedGet("conversation/active")
            conversationId = active.conversationId
            let list: MessagesListResponse = try await authStore.authorizedGet("conversation/\(active.conversationId)/messages")
            messages = list.messages
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription ?? "Nu am putut încărca conversația."
        }
        isLoading = false
    }

    private func send() async {
        guard let conversationId else { return }
        let content = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !content.isEmpty else { return }
        draft = ""
        isSending = true
        errorMessage = nil

        do {
            let body = SendMessageBody(content: content, locale: "ro")
            let response: SendMessageResponse = try await authStore.authorizedPost(
                "conversation/\(conversationId)/messages",
                body: body
            )
            if response.status == "ok", let userMessage = response.userMessage, let assistantMessage = response.assistantMessage {
                messages.append(userMessage)
                messages.append(assistantMessage)
            } else if response.status == "rate-limited" {
                errorMessage = "Ai atins limita de mesaje pentru moment — încearcă din nou peste puțin timp."
            } else {
                errorMessage = "Mesajul nu a putut fi trimis."
            }
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription ?? "Mesajul nu a putut fi trimis."
        }
        isSending = false
    }
}

private struct MessageBubble: View {
    let message: ChatMessage

    var isUser: Bool { message.role == "user" }

    var body: some View {
        HStack {
            if isUser { Spacer(minLength: 40) }
            Text(message.content)
                .padding(12)
                .background(isUser ? Color.spocoiBrand : Color(.secondarySystemBackground))
                .foregroundStyle(isUser ? Color.spocoiInk : Color.primary)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            if !isUser { Spacer(minLength: 40) }
        }
    }
}

#Preview {
    ChatView().environment(AuthStore())
}
