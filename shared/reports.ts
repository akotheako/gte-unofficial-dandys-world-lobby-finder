// Roblox user ID of @akotheakotheako, the only account that sees the Reports window. The server
// compares the ID instead of the username, because a released username can go to someone else.
export const reportsReaderRobloxUserId = 7345524925

// Message from the Contact/Report window, as the Reports window lists it
export type Report = {
	id: number
	topic: string
	message: string
	robloxUsername: string | null
	sentAt: string
}
