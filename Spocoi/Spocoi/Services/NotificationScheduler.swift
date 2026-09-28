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
    static let reminderIdentifier = "daily-mood-reminder"

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
        center.removePendingNotificationRequests(withIdentifiers: [reminderIdentifier])

        let content = UNMutableNotificationContent()
        content.title = "spocoi"
        content.body = "O clipă pentru tine, când vrei — fără grabă."
        content.sound = .default

        var dateComponents = DateComponents()
        dateComponents.hour = hour
        dateComponents.minute = minute

        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        let request = UNNotificationRequest(identifier: reminderIdentifier, content: content, trigger: trigger)
        center.add(request)
    }

    static func cancelDailyReminder() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [reminderIdentifier])
    }
}
