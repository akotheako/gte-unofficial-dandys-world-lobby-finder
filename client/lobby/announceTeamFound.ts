import { robloxServerLinkPattern } from '../../shared/robloxServerLinkPattern.ts'
import { visibleTexts } from '../../shared/visibleTexts.ts'

// Plays the bell, shows the notification and joins the server, as far as the Options window
// turned them on
export function announceTeamFound({
	teamServerLink,
	isDingSoundCheckboxChecked,
	isNotificationCheckboxChecked,
	isJoinAutomaticallyCheckboxChecked,
}: {
	teamServerLink: string
	isDingSoundCheckboxChecked: boolean
	isNotificationCheckboxChecked: boolean
	isJoinAutomaticallyCheckboxChecked: boolean
}) {
	// Only a real Roblox server link is ever opened without a click on the page
	const isRobloxServerLink = robloxServerLinkPattern.test(teamServerLink)

	// One of the four bell sounds, picked at random. The browser only plays it once the page was
	// clicked, which Find Players or the invite link's page always was.
	if (isDingSoundCheckboxChecked) {
		new Audio(`/bell${Math.floor(Math.random() * 4) + 1}.wav`).play().catch(() => {})
	}

	if (
		isNotificationCheckboxChecked
		&& 'Notification' in window
		&& Notification.permission === 'granted'
	) {
		// showNotification throws until the worker is active, which takes a moment after the first
		// registration
		navigator.serviceWorker.register('/teamFoundNotificationWorker.js')
			.then(() => navigator.serviceWorker.ready)
			.then((registration) => registration.showNotification(visibleTexts.teamFound.title, {
				body: isRobloxServerLink ? visibleTexts.teamFound.notificationBody : '',
				icon: '/pixelated/Everyone_at_elevator.webp',
				tag: 'team-found',
				// Without it, a notification that replaces an earlier one with the same tag pops up
				// silently in the notification center only
				renotify: true,
				data: { teamServerLink: isRobloxServerLink ? teamServerLink : '' },
			} as NotificationOptions))
			.catch(() => {})
	}

	// Browsers block a new tab that no click opened, until the user allows pop-ups for the site
	if (isJoinAutomaticallyCheckboxChecked && isRobloxServerLink) {
		open(teamServerLink, '_blank', 'noreferrer')
	}
}
