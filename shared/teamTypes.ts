// Chip from the Reserved side window that a Player cell of Find a Team holds, or '' when the row
// is left for a player to find. "Unverified friend #N" keeps its number, and a verified friend is
// known by their Roblox username.
export type ReservedFor = '' | 'me' | `unverifiedFriend:${number}` | `verifiedFriend:${string}`

// Row of the white table in the middle of Find a Team
export type TeamTableRow = {
	toonPicture: string
	trinketAPicture: string
	trinketBPicture: string
	badgeNames: string[]
	roleNames: string[]
	// "Verified only" checkbox of the Player cell, which counts for a found player in the row
	isVerifiedPlayerRequired: boolean
	reservedFor: ReservedFor
	isLeftEmpty: boolean
}

// Slot of a merged search in Browse Teams, as the row of each of its searches in that slot, so
// that any of these searches finds the slot again, even after others left
export type ChosenSlot = {
	teamId: string
	rowIndex: number
}[]

// TEAM SETTINGS of a whole merged team, which hold the most specific choice of its searches
export type MergedTeamSettings = {
	dandyRun: string
	earlyDyle: string
	region: string
	floorGoal: string
}

// Player who fills a row, either by their Roblox username, which is empty when they did not verify,
// or as an unverified friend of a player
export type PlayerInRow = { robloxUsername: string } | { unverifiedFriendOf: string }

// Last team that the user's search found, which Upvote Players shows as a record: the user's own
// table with the players in its rows, the TEAM SETTINGS, and every other verified player
export type LastFoundTeam = {
	teamTableRows: TeamTableRow[]
	playersInRows: (PlayerInRow | null)[]
	serverLink: string
	dandyRun: string
	earlyDyle: string
	region: string
	floorGoal: string
	verifiedPlayers: {
		robloxUserId: string
		robloxUsername: string
		// False for a player who did not verify, and between a player and a friend who opened their
		// invite link
		canBeUpvoted: boolean
		// How the player and the user are linked by an invite link, which is why they cannot upvote
		// each other
		inviteLinkSide: 'friend whom the user invited' | 'friend who invited the user' | null
		isUpvoted: boolean
	}[]
}

// What the server answers to the check-in that every page sends every few seconds
export type CheckInAnswer = {
	onThisPageCount: number
	findingPlayersCount: number
	// Reason why the server stopped the search or the invite, or empty
	error: string
	// The page opened an invite link without a verified Roblox account, and it joins the team on
	// its first check-in after the user verifies
	isVerificationNeededToJoin: boolean
	// Team that an invite link brought this page into, which the page shows instead of its own
	invitingTeam: {
		teamTableRows: TeamTableRow[]
		dandyRun: string
		earlyDyle: string
		region: string
		floorGoal: string
		hostRobloxUsername: string
	} | null
	// Who is in each row of the team that the page shows, and whether the team was found
	shownTeamStatus: {
		playersInRows: (PlayerInRow | null)[]
		// Row of the shown team's host, who is the page's own player unless an invite link brought
		// the page in, or -1
		hostRowIndex: number
		// Rows whose player clicked their Join button in Browse Teams, while the team searches
		browseTeamsPlayerRowIndexes: number[]
		// Verified friends who opened the invite link of the shown team
		verifiedFriendRobloxUsernames: string[]
		isSearching: boolean
		hasJoinedATeam: boolean
		hostRobloxUsername: string
		// Empty until every row of the merged team has a player
		teamServerLink: string
		teamSettings: MergedTeamSettings
		// What each row of the shown table asks for once the rows of every table that share its
		// slot in the merged team count together
		slotRows: TeamTableRow[]
	} | null
	// Searching teams that Browse Teams lists as cards, oldest first, led by the team that the user
	// joined there. Empty while Browse Teams is closed.
	browsedTeams: {
		hostTeamId: string
		hostRobloxUsername: string
		// TEAM SETTINGS of the whole merged team, which hold the most specific choice of its
		// searches
		dandyRun: string
		earlyDyle: string
		region: string
		floorGoal: string
		// The host's table, where each row asks for what its slot asks for once the rows of every
		// table of the merged team that share it count together, with the players in its rows
		teamTableRows: TeamTableRow[]
		playersInRows: (PlayerInRow | null)[]
		// Free rows that the user fits, whose Player cell shows a Join button
		joinableRowIndexes: number[]
		// Searches of the merged team, by which the page finds the team again once its host changed
		searchIds: string[]
		// What the Join button of each row sends
		chosenSlotsByRow: ChosenSlot[]
		// Row that the page's own Browse Teams join takes in this team, or -1
		joinedRowIndex: number
	}[]
	// More teams fit than Browse Teams asked for, so scrolling to the end of its list loads more
	hasMoreBrowsedTeams: boolean
}
