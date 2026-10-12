import { visibleTexts } from '../../shared/visibleTexts.ts'

// Sends the message of the Contact/Report window, and empties the message box once it arrived
export async function sendReport({
	topic,
	message,
	setReportMessage,
	setReportStatusText,
}: {
	topic: string
	message: string
	setReportMessage: (reportMessage: string) => void
	setReportStatusText: (reportStatusText: string) => void
}) {
	setReportStatusText(visibleTexts.contactReport.sending)
	const res = await fetch('/api/reports', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			topic,
			message,
		}),
	})
	if (!res.ok) {
		setReportStatusText((await res.json()).error)
		return
	}
	setReportMessage('')
	setReportStatusText(visibleTexts.contactReport.sent)
}
