import { robloxServerLinkPattern } from '../../shared/robloxServerLinkPattern.ts'

// Plays the Ding!, flashes the tab title, shows the notification and joins the server, as far as
// the Options window turned them on. Returns a function that stops the flashing.
export function announceTeamFound({
	teamServerLink,
	isDingSoundCheckboxChecked,
	isFlashTabCheckboxChecked,
	isNotificationCheckboxChecked,
	isJoinAutomaticallyCheckboxChecked,
}: {
	teamServerLink: string
	isDingSoundCheckboxChecked: boolean
	isFlashTabCheckboxChecked: boolean
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
		navigator.serviceWorker.register('/teamFoundNotificationWorker.js')
			.then((registration) => registration.showNotification('Team found!', {
				body: isRobloxServerLink ? 'Click to join the server' : '',
				icon: '/pixelated/Everyone_at_elevator.webp',
				tag: 'team-found',
				data: { teamServerLink: isRobloxServerLink ? teamServerLink : '' },
			}))
			.catch(() => {})
	}

	// Browsers block a new tab that no click opened, until the user allows pop-ups for the site
	if (isJoinAutomaticallyCheckboxChecked && isRobloxServerLink) {
		open(teamServerLink, '_blank', 'noreferrer')
	}

	// The tab title switches between "Team found!" and the page's title every second until the user
	// comes back to the page
	if (!isFlashTabCheckboxChecked || document.hasFocus()) return () => {}
	const pageTitle = document.title
	const flashInterval = setInterval(() => {
		document.title = document.title === pageTitle ? 'Team found!' : pageTitle
	}, 1000)
	const stopFlashing = () => {
		clearInterval(flashInterval)
		document.title = pageTitle
		removeEventListener('focus', stopFlashing)
	}
	addEventListener('focus', stopFlashing)
	return stopFlashing
}
