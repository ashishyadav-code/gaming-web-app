/**
 * Browser Push Notification Wrapper
 */

export async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notifications.");
        return false;
    }

    if (Notification.permission === "granted") return true;

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
}

export function sendBrowserNotification(title, options = {}) {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
        new Notification(title, {
            icon: '/logo.png',
            badge: '/logo.png',
            ...options
        });
    }
}
