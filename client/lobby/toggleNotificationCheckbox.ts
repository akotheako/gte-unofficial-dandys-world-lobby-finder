import { visibleTexts } from '../../shared/visibleTexts.ts'

// Checking the box asks the browser for permission first, and the box stays unchecked when the
// user or the browser refuses. Chrome can show its request as a small bell icon in the address bar
// instead of a popup, and the request then stays unanswered until the user finds that icon.
export async function toggleNotificationCheckbox({
	setIsChecked,
	setNotificationCheckboxError,
	setIsNotificationPermissionPending,
	isChecked,
}: {
	setIsChecked: (isChecked: boolean) => void
	setNotificationCheckboxError: (notificationCheckboxError: string) => void
	setIsNotificationPermissionPending: (isNotificationPermissionPending: boolean) => void
	isChecked: boolean
}) {
	setNotificationCheckboxError('')
	if (isChecked) {
		setIsNotificationPermissionPending(true)
		const permission = await Notification.requestPermission()
		setIsNotificationPermissionPending(false)
		if (permission !== 'granted') {
			setNotificationCheckboxError(visibleTexts.options.notificationsBlockedError)
			return
		}
	}
	localStorage.setItem('notification', String(isChecked))
	setIsChecked(isChecked)
}
