// Checking the box asks the browser for permission first, and the box stays unchecked when the
// user or the browser refuses
export async function toggleNotificationCheckbox({
	setIsChecked,
	setNotificationCheckboxError,
	isChecked,
}: {
	setIsChecked: (isChecked: boolean) => void
	setNotificationCheckboxError: (notificationCheckboxError: string) => void
	isChecked: boolean
}) {
	setNotificationCheckboxError('')
	if (isChecked && await Notification.requestPermission() !== 'granted') {
		setNotificationCheckboxError('Notifications are blocked for this site in the browser settings.')
		return
	}
	localStorage.setItem('notification', String(isChecked))
	setIsChecked(isChecked)
}
