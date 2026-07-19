// Sarkar Service Worker
// Listens for push events from the server and shows native browser notifications

self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body || 'New message from SARKAR HQ',
            icon: '/logo.png',
            badge: '/logo.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2'
            }
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'SARKAR Alert', options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    // Analytics or handling logic when the user clicks the notification
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
