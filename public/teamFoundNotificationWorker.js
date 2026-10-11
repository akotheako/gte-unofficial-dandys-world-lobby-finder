// Service worker that shows the "Team found!" notification, since phones only allow notifications
// from a service worker. Clicking the notification opens the team's server in Roblox.
self.addEventListener('notificationclick', (event) => {
	event.notification.close()
	const teamServerLink = event.notification.data?.teamServerLink
	if (teamServerLink) event.waitUntil(self.clients.openWindow(teamServerLink))
})
