import Foundation
import UserNotifications

/// Local notifications only — deliberately not APNs/remote push, which would
/// require an Apple Developer Program enrollment (same blocker already hit
/// with Sign in with Apple). A single, calm daily reminder covers this use
/// case fully without that dependency.
///
/// Explicitly no server-side "did they already check in today?" gate — that
/// would need a Notification Service Extension (also gated behind the paid
/// program). The copy is written to stay true either way, instead of
/// claiming something that might not hold ("you haven't checked in").
enum NotificationScheduler {
    static let reminderIdentifierPrefix = "daily-mood-reminder-"

    /// A repeating trigger can only carry ONE fixed body forever, so
    /// variety means scheduling this many individual, non-repeating
    /// notifications ahead of time — one per day, each with a randomly
    /// picked line. Re-run `scheduleDailyReminder` periodically (e.g. on
    /// app launch) to keep the rolling window topped up past this horizon.
    static let rollingWindowDays = 14

    /// Same calm, non-pressuring register throughout — never "you haven't
    /// checked in", never guilt, never urgency.
    static let reminderBodies = [
        "O clipă pentru tine, când vrei — fără grabă.",
        "Dacă ai un gând care te apasă, sunt aici.",
        "Uneori ajută doar să pui în cuvinte ce simți.",
        "Nicio presiune — doar o invitație, dacă ai chef de vorbă.",
        "Cum a fost ziua ta? Poți spune aici, dacă vrei.",
        "Un minut pentru tine, dacă simți nevoia.",
        "Ești binevenit oricând ai nevoie să vorbești.",
        "Nu trebuie să fie ceva anume — poți doar să scrii ce ai pe suflet.",
        "Dacă vrei o pauză să te asculți pe tine, sunt aici.",
        "O seară liniștită începe uneori cu un gând pus deoparte.",
        "Dacă ziua a fost grea, poți lăsa puțin din greutate aici.",
        "Nu e nicio grabă — doar o amintire că poți vorbi oricând.",
        "Câteva minute cu tine însuți, dacă ai chef azi.",
        "Sunt aici, fără așteptări, dacă vrei să spui ceva.",
    ]

    @discardableResult
    static func requestAuthorizationIfNeeded() async -> Bool {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        switch settings.authorizationStatus {
        case .authorized, .provisional, .ephemeral:
            return true
        case .notDetermined:
            return (try? await center.requestAuthorization(options: [.alert, .sound])) ?? false
        case .denied:
            return false
        @unknown default:
            return false
        }
    }

    /// No `.badge` — a red count on the app icon reads as an unresolved
    /// obligation, which is exactly the pressure this feature avoids.
    static func scheduleDailyReminder(hour: Int, minute: Int) {
        let center = UNUserNotificationCenter.current()
        cancelDailyReminder()

        let calendar = Calendar.current
        let now = Date()

        for day in 0..<rollingWindowDays {
            guard let targetDay = calendar.date(byAdding: .day, value: day, to: now) else { continue }
            var components = calendar.dateComponents([.year, .month, .day], from: targetDay)
            components.hour = hour
            components.minute = minute
            components.second = 0

            guard let fireDate = calendar.date(from: components), fireDate > now else { continue }

            let content = UNMutableNotificationContent()
            content.title = "spocoi"
            content.body = reminderBodies.randomElement() ?? reminderBodies[0]
            content.sound = .default

            let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
            let request = UNNotificationRequest(
                identifier: "\(reminderIdentifierPrefix)\(day)",
                content: content,
                trigger: trigger
            )
            center.add(request)
        }
    }

    static func cancelDailyReminder() {
        let identifiers = (0..<rollingWindowDays).map { "\(reminderIdentifierPrefix)\($0)" }
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: identifiers)
    }
}
