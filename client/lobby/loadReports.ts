import type { Report } from '../../shared/reports.ts'

// Fills the Reports window with every message of the Contact/Report window, newest first
export async function loadReports({
	setReports,
	setReportsError,
}: {
	setReports: (reports: Report[]) => void
	setReportsError: (reportsError: string) => void
}) {
	const res = await fetch('/api/reports')
	const data = await res.json()
	setReportsError(res.ok ? '' : data.error)
	if (res.ok) setReports(data)
}
