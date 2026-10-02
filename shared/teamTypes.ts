// Options of the dropdown in the Player column of Find a Team
export type PlayerChoice =
	| 'findPlayer'
	| 'findVerifiedPlayer'
	| 'me'
	| 'unverifiedFriend'
	| 'invitedFriend'

// Row of the white table in the middle of Find a Team
export type TeamTableRow = {
	toonPicture: string
	trinketAPicture: string
	trinketBPicture: string
	badgeNames: string[]
	roleNames: string[]
	playerChoice: PlayerChoice
	isLeftEmpty: boolean
}

// Player who fills a row, either by their Roblox username, which is empty when they did not verify,
// or as an unverified friend of a player
export type PlayerInRow = { robloxUsername: string } | { unverifiedFriendOf: string }

// What the server answers to the check-in that every page sends every few seconds
export type CheckInAnswer = {
	onThisPageCount: number
	findingPlayersCount: number
	// Reason why the server stopped the search or the invite, or empty
	error: string
	// Team that an invite link brought this page into, which the page shows instead of its own
	invitingTeam: {
		teamTableRows: TeamTableRow[]
		isDandyRun: boolean
		isEarlyDyle: boolean
		region: string
		floorGoal: string
		hostRobloxUsername: string
	} | null
	// Who is in each row of the team that the page shows, and whether the team was found
	shownTeamStatus: {
		playersInRows: (PlayerInRow | null)[]
		isSearching: boolean
		hasJoinedATeam: boolean
		hostRobloxUsername: string
		// Empty until players got together
		teamServerLink: string
	} | null
}
