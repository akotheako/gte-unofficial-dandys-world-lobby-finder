// Every text that the page shows, grouped by the window that shows it, including the errors that
// the server sends to the page. A text that holds a value, such as a count or a username, is a
// function that fills it in. Dropdown options, badge names and role names live in the code that
// saves and compares them, since saved settings and the server depend on their exact spelling.
export const visibleTexts = {

	// Title bar of every window
	windowTitleBar: {
		// Grey × button at the right end of the title bar
		closeButton: '×',
		// What a screen reader says for the × button
		closeButtonLabel: 'Close',
	},

	// Labels under the desktop icons along the top of the screen, which are also the titles of the
	// windows that the icons open
	desktopIcons: {
		robloxVerification: 'Roblox Verification',
		findATeam: 'Find a Team',
		browseTeams: 'Browse Teams',
		upvotePlayers: 'Upvote Players',
		fanProject: 'This is a fan project',
		contactReport: 'Contact/Report',
		options: 'Options',
		// Only the owner of the site sees this icon
		reports: 'Reports',
	},

	// Two counters at the bottom middle of the screen, which show "…" until the first answer of the
	// server arrives
	counters: {
		online: (count: number | null) => `${count ?? '…'} online`,
		lookingForATeam: (count: number | null) => `${count ?? '…'} looking for a team`,
	},

	// Red line that any window shows when the server crashed while it answered
	serverCrashError: 'Something went wrong on the server, try again in a minute',

	// Roblox Verification window
	robloxVerification: {
		// Instructions before verifying, where "Roblox profile" is a link
		instructionsFirstLine: 'Verify your Roblox account to get access to all the features!',
		instructionsBeforeProfileLink: 'First, go to your',
		profileLink: 'Roblox profile',
		instructionsAfterProfileLink: ',',
		instructionsCodeLine: 'then click on About to change your bio and paste this emoji-code:',
		// Read-only field with the code that the user pastes into their Roblox bio
		emojiCode: (emojis: string) => `This is my verification code for DW Team Finder! ${emojis}`,
		// Button next to the code, which reads "Copied!" after a click
		copyButton: 'Copy',
		copiedButton: 'Copied!',
		// Line above the username field
		checkInstructions: 'Then enter your username below and click [Check]:',
		usernameFieldPlaceholder: 'Roblox username',
		checkButton: 'Check',
		// Red lines below the username field
		codeExpiredError: 'The code expired, reload the page',
		robloxBusyError: 'Roblox is busy right now, try again in a minute',
		usernameNotFoundError: 'No Roblox account has that username',
		codeNotInProfileError: 'The code is not in your profile description yet',

		// Line at the top once verified
		verifiedAs: (username: string) => `Verified as ${username}`,
		// Line in place of the badge checklist while it loads
		badgeChecklistLoading: 'Loading badges...',
		// Marks in front of each badge of the checklist
		ownedBadgeMark: '✅',
		missingBadgeMark: '⬜',
		updateBadgesButton: 'Update Badges',
		logOutButton: 'Log out',
		// Lines in place of the checklist, or in red below it after Update Badges
		notVerifiedError: 'Verify your Roblox account first',
		privateInventoryError: 'Make your Roblox inventory public to show your badges',
	},

	// Usernames and names of players, as the Player column, the Reserved Slots chips and the tables
	// of found teams show them
	playerNames: {
		robloxUsername: (username: string) => `@${username}`,
		// Grey name in a Player cell, inside brackets
		inBrackets: (name: string) => `(${name})`,
		me: 'Me',
		// The host's "Me" chips, as an invited friend of an unverified host sees them
		host: 'Host',
		unverifiedPlayer: 'Unverified player',
		friendOf: (username: string) => `Friend of @${username}`,
		unverifiedFriend: 'Unverified friend',
		numberedUnverifiedFriend: (number: string) => `Unverified friend #${number}`,
		verifiedFriendWhoLeft: (username: string) => `@${username} (left the team)`,
		// Player cell of a row without a chip, during a search
		findVerifiedPlayer: 'Find verified player',
		findAnyPlayer: 'Find any player',
		// The user's own row in "Team found!"
		you: '(You)',
		// A row without a player in "Team found!"
		freeSlot: 'Free slot',
		// A row that nobody took in Upvote Players
		nobody: 'Nobody',
	},

	// Tables and narrow-screen cards of Find a Team, YOUR SLOT, Team Details, "Team found!" and
	// Upvote Players
	teamTable: {
		// Mark behind a toon or trinket of a "Me" row that the user does not own
		missingForMeMark: '❌',
		// Column headers, which are also the labels of the boxes of the cards
		toonColumn: 'Toon',
		trinketAColumn: 'Trinket A',
		trinketBColumn: 'Trinket B',
		badgesColumn: 'Badges',
		roleColumn: 'Role',
		playerColumn: 'Player',
		upvoteColumn: 'Upvote',
		// Tooltip of the Player header in Find a Team
		playerColumnTooltip: `A row without a chip is left for a player to find, and so is every extra row that shares a chip.
"Verified only" lets only verified players take it.`,
		// Bold title above each card on a narrow screen
		playerSlotCardTitle: (slotNumber: number) => `Player Slot #${slotNumber}`,
		yourSlotCardTitle: 'YOUR SLOT',
		// Grey text in an empty Toon or Trinket cell
		any: '(Any)',
		// Grey cell across a row that is left empty, and the tile that leaves a row empty
		leaveEmpty: '(Leave Empty)',
		// Grey text in an empty Badges or Role cell
		noneRequired: '(none required)',
		// Tooltips of the Badges cell
		badgesCellTooltip: 'Click to modify required badges',
		badgesCellUnverifiedOnlyTooltip: 'Only verified players can require badges.',
		// Tooltip of a crossed-out "Solar Support"
		solarSupportTooltip: 'Only Bobette can help with Solar Distracting',
		// Grey text in the Player box of a card that holds no name
		findAPlayer: '(Find a player)',
		// Checkbox below the chip in a Player cell, for a verified host
		verifiedOnlyCheckbox: 'Verified only',
		verifiedOnlyCheckboxTooltip: 'Allow only verified players into this player slot.',
		// Player cell during a search, followed by blinking dots
		findingPlayer: 'Finding player',
		// Line above the name of a player who joined through Browse Teams
		playerFound: 'Player found!',
	},

	// Toons and Trinkets side windows around Find a Team and Browse Teams, and the pick window that a
	// box of a card opens on a narrow screen
	sideWindows: {
		toonsTitle: 'Toons',
		trinketsTitle: 'Trinkets',
		// Grey line below the titles
		dragHint: 'Drag onto the table',
		// Buttons right of the drag hint, which open My Toons or My Trinkets
		ownedToonsButton: ({
			ownedCount,
			totalCount,
		}: {
			ownedCount: number
			totalCount: number
		}) => `${ownedCount}/${totalCount} Toons`,
		ownedTrinketsButton: ({
			ownedCount,
			totalCount,
		}: {
			ownedCount: number
			totalCount: number
		}) => `${ownedCount}/${totalCount} Trinkets`,
		// Tooltip of those buttons while they are greyed out
		ownedPicturesButtonsTooltip: 'Cancel the search to change which toons and trinkets you own',
		// Section titles above the tiles, in Find a Team only
		ownedSection: 'Owned',
		missingSection: 'Missing',
		// Tooltips of the "(Any)" and "(Leave Empty)" tiles of the pick window
		anyTileTooltip: 'Empty the box',
		leaveEmptyTileTooltip: 'Leave the whole card empty',
	},

	// Reserved Slots side window below Trinkets, and the Reserved Slots pick window on a narrow screen
	reservedSlots: {
		title: 'Reserved Slots',
		// Grey line below the title
		dragHint: 'Drag onto the Player column',
		// Titles of the group boxes
		meGroupBox: 'ME',
		verifiedFriendsGroupBox: 'VERIFIED FRIENDS',
		unverifiedFriendsGroupBox: 'UNVERIFIED FRIENDS',
		// Button in the VERIFIED FRIENDS box, which reads "Copied!" after a click
		copyInviteLinkButton: 'Copy invite link',
		copiedInviteLinkButton: 'Copied!',
		addUnverifiedFriendButton: '+ Add unverified friend',
		// What a screen reader says for the × after a friend's chip
		removeFriendButtonLabel: 'Remove friend',
	},

	// My Toons and My Trinkets windows, which the "N/N" buttons open
	ownedPicturesWindow: {
		toonsTitle: 'My Toons',
		trinketsTitle: 'My Trinkets',
		// Grey line below the title
		hint: 'Click to mark as missing or owned',
		// Mark behind an owned toon's picture in My Toons
		ownedToonMark: '🟩',
		// Mark behind an owned trinket's picture in My Trinkets
		ownedTrinketMark: '🟢',
		// Mark behind a missing tile's picture
		missingMark: '❌',
		// Category titles of My Toons
		mainCharacters: 'Main Characters',
		secondaryCharacters: 'Secondary Characters',
		christmasToons: 'Christmas Toons',
		halloweenToons: 'Halloween Toons',
		easterToons: 'Easter Toons',
		// Category titles of My Trinkets
		skillcheck: 'Skillcheck',
		moveSpeed: 'Move Speed',
		stamina: 'Stamina',
		stealth: 'Stealth',
		extractionSpeed: 'Extraction Speed',
		abilityCooldown: 'Ability Cooldown',
		hitPrevention: 'Hit Prevention',
		itemFindingAndUsage: 'Item Finding & Usage',
		toonSpecificTrinkets: 'Toon-specific Trinkets',
		tapeTrinkets: 'Tape Trinkets',
		researchAndHolidayCurrencyTrinkets: 'Research & Holiday Currency Trinkets',
		visibilityTrinkets: 'Visibility Trinkets',
		// Last category, only when a picture fits no other one
		more: 'More',
	},

	// Badges and Roles windows, which a Badges or Role cell opens
	checklistWindows: {
		badgesTitle: 'Badges',
		rolesTitle: 'Roles',
		// Buttons at the bottom, which read "Copied!" or "Pasted!" for 3 seconds after a click
		copyButton: 'Copy',
		copiedButton: 'Copied!',
		pasteButton: 'Paste',
		pastedButton: 'Pasted!',
	},

	// TEAM SETTINGS group box of Find a Team and Browse Teams, and the tags of the team settings
	// on the Browse Teams cards, in Team Details, in "Team found!" and in Upvote Players
	teamSettings: {
		title: 'TEAM SETTINGS',
		dandyRunLabel: 'Dandy Run:',
		earlyDyleLabel: 'Early Dyle:',
		regionLabel: 'Region:',
		floorGoalLabel: 'Floor goal:',
		// Browse Teams only
		playersLabel: 'Players:',
		// Word between the "from" and "to" dropdowns of Floor goal and Players
		fromToSeparator: 'to',
		// Tooltips of Dandy Run and Early Dyle, both on the labels and on the tags
		dandyRunTooltip: 'Don\'t buy anything in Dandy\'s shop!!',
		noDandyRunTooltip: 'Buying things in Dandy\'s shop is fine',
		earlyDyleTooltip: 'Vote the special "TIME\'S UP" card as soon as it appears',
		noEarlyDyleTooltip: 'Don\'t vote the special "TIME\'S UP" card',
		// Tags
		dandyRunTag: 'Dandy Run',
		noDandyRunTag: 'No Dandy Run',
		earlyDyleTag: 'Early Dyle',
		noEarlyDyleTag: 'No Early Dyle',
		floorGoalTag: (floorGoal: string) => `Floor Goal: ${floorGoal}`,
		floorGoalRange: ({
			fromFloor,
			toFloor,
		}: {
			fromFloor: string
			toFloor: string
		}) => `${fromFloor} to ${toFloor}`,
	},

	// Find a Team window
	findATeam: {
		// Line at the top for a friend who opened an invite link
		joiningInvitingTeam: 'Joining the team that invited you...',
		inHostsTeam: (host: string) => `You are in @${host}'s team. Closing this window takes you out of it.`,
		inUnverifiedHostsTeam: 'You are in your friend\'s team. Closing this window takes you out of it.',
		verifyToJoin: `Verify your Roblox account in Roblox Verification to join the team that invited you.`,

		// "Server link (recommended):" field below the table
		serverLinkLabelStart: 'Server link',
		serverLinkRecommended: '(recommended)',
		serverLinkLabelEnd: ':',
		serverLinkRecommendedTooltip: `A match needs at least one server link, so if you share yours, it's more probable to find a team faster`,
		// Blue "?" right of the field, and the window with screenshots that it opens
		serverLinkHelpLink: '?',
		serverLinkHelpTitle: 'How do I get a server link?',
		// What a screen reader says for the two screenshots
		serverLinkHelpFirstScreenshot: `Dandy's World page: open Servers, then Create Private Server, or Configure on an existing one`,
		serverLinkHelpSecondScreenshot: `Configure Private Server page: turn on Allow Joining, then copy the Private Server Link`,

		// Button at the bottom right
		findPlayersButton: 'Find Players',
		findingPlayersButton: 'Finding Players (Click to Cancel)',
		// Tooltips of Find Players while it is greyed out
		cancelJoinFirstTooltip: 'Cancel the join in Browse Teams first.',
		meNotInTableTooltip: `"Me" from the Reserved window has to be on at least 1 row that is not "(Leave Empty)".`,
		noRowLeftToFindTooltip: `At least 1 row has to be left for a player to find.
That is a row without a chip, or an extra row that shares a chip.`,
		verifiedFriendLeftTooltip: `A verified friend in the table left the team. Drag their name out of the table.`,
		missingPictureInMyRowTooltip: 'Your row requires a toon, trinket, or badge you marked as missing.',
		// Red lines below Find Players
		invalidServerLinkError: 'The server link is invalid!',
		inviteLinkExpiredError: 'This invite link expired',
		ownInviteLinkError: 'This invite link is for your friends, send it to them',
		removedByHostError: 'The host took you out of the team',
		joinedInAnotherTabError: 'You already joined this team in another tab',
		teamAlreadySearchingError: 'The team already started finding players',
		// Grey line with a warning sign during a search without a server link
		warningSign: '⚠',
		findingWithoutServerLinkHint: `Without a server link, your team needs someone who has one. Adding yours finds a team faster.`,
	},

	// "Team found!" window, and the browser notification that comes with it
	teamFound: {
		title: 'Team found!',
		// What a screen reader says for the picture above the window
		elevatorPicture: 'All of the toons waiting together at the elevator',
		// Text below the title, depending on who reads it, where the host's username is a link
		playersJoinedYourTeam: 'Players joined your team! Everyone meets in your server:',
		playersJoinedTheTeam: 'Players joined the team! Everyone meets in this server:',
		playersJoinedBeforeHost: 'Players joined ',
		playersJoinedAfterHost: '\'s team! Everyone meets in this server:',
		hostIsBeforeHost: 'The host is ',
		hostIsAfterHost: '. Everyone, join their server!',
		youJoinedATeam: 'You joined a team! Join its server:',
		yourTeamJoinedATeam: 'Your team joined a team! Join its server:',
		joinServerButton: 'Click to join server',
		// Body of the browser notification, whose title is the title above
		notificationBody: 'Click to join the server',
	},

	// Browse Teams window
	browseTeams: {
		// Line above the list of teams
		lookingForTeams: 'Looking for teams...',
		noTeamsMatch: 'No teams match these settings right now.',
		listIntro: 'Teams that are looking for players and have a slot for you. Click one to see it.',
		// First tag on the card of the team that the user joined
		joinedTag: 'Joined',
		// Grey line at the end of the list
		loadingMoreTeams: 'Loading more teams...',
	},

	// Team Details window, which a team of Browse Teams opens
	teamDetails: {
		title: 'Team Details',
		// Line above the table
		hostsTeam: (host: string) => `@${host}'s team`,
		unverifiedHostsTeam: 'Team of an unverified host',
		// Red line in place of the team when it disappeared
		teamGone: 'This team stopped searching, filled up, or has no slot for you anymore.',
		// Player column
		joinButton: 'Join',
		joinedThisSlot: 'Joined this slot',
		slotFilled: '(Slot filled)',
		requirementsIncompatible: '(Requirements incompatible with you)',
		// Tooltips of a greyed-out Join button
		cancelFindPlayersFirstTooltip: 'Cancel Find Players in Find a Team first.',
		inInvitingTeamTooltip: 'You are in the team of the friend who invited you.',
		// Bottom right while a join waits, followed by blinking dots
		lookingForPlayers: 'Looking for players',
		// Red lines below the table
		teamStoppedError: 'This team stopped searching or filled up',
		noSlotAnymoreError: 'This team has no slot for you anymore',
	},

	// Upvote Players window
	upvotePlayers: {
		// Line at the top
		verifyToUpvote: `Only players with a verified Roblox account can upvote, so that every player can only upvote someone once.
Verify your account in Roblox Verification, and the players of the last team that you find show up here.`,
		loadingLastTeam: 'Loading your last team...',
		noTeamYet: 'You\'ll be able to upvote other players here after you find a team!',
		lastTeamIntro: `Your last team. Upvote the players who kept to the plan, played well and were nice!`,
		// Upvote column
		upvoteButton: 'Upvote',
		upvotedButton: 'Upvoted ✓',
		upvotedButtonTooltip: 'Click to take the upvote back',
		cannotUpvoteUnverified: '(You cannot upvote unverified players)',
		cannotUpvoteYourself: '(You cannot upvote yourself)',
		cannotUpvoteInvitedFriends: '(You cannot upvote your invited friends)',
		cannotUpvoteInvitingFriend: '(You cannot upvote the friend who invited you)',
		// Errors that the server sends on an upvote
		notVerifiedError: 'Verify your Roblox account to upvote players',
		notYourTeamError: 'You can only upvote players from a team that you found',
	},

	// This is a fan project window
	fanProject: {
		text: 'This project was made by fans for fans, and not made by Blushcrunch.',
		// Second paragraph, where the game name is a link to its Roblox page
		madeByBeforeLink: 'The game ',
		gameLink: `Dandy's World`,
		madeByAfterLink: ` on ROBLOX is made by Blushcrunch, and all the images and icons in the website, too.`,
		// Description of the Blushcrunch logo below the second paragraph
		logoDescription: 'Blushcrunch logo',
		// Line below the Blushcrunch logo
		thankYou: 'Thank you Blushcrunch for an amazing game!!',
	},

	// Contact/Report window
	contactReport: {
		// Options of the topic dropdown, which the server also checks
		bugInTheWebsiteTopic: 'Report a bug in the website',
		bugInTheGameTopic: 'Report a bug in the game',
		playerTopic: 'Report a player',
		otherTopic: 'Other',
		// Red line below the dropdown for the game and player topics, where the server name is a link
		discordLineBeforeLink: (topic: string) => `To ${topic.toLowerCase()}, join the `,
		discordLink: 'Blushcrunch official discord server',
		discordLineAfterLink: `. This form is only for issues about this website, not the game itself or its players. Thank you!`,
		messagePlaceholder: 'Your message',
		sendButton: 'Send',
		// Line right of Send
		sending: 'Sending...',
		sent: 'Sent!',
		// Errors right of Send
		onlyForThisWebsiteError: 'This form is only for issues about this website',
		emptyMessageError: 'Write a message first',
		messageTooLongError: 'The message is longer than 2000 characters',
		tooManyReportsError: 'You can only send one report per minute. Please try again soon.',
	},

	// Options window
	options: {
		darkModeCheckbox: 'Dark mode',
		teamFoundGroupBox: 'WHEN A TEAM IS FOUND',
		bellSoundCheckbox: 'Play a "bell!" sound',
		notificationCheckbox: 'Show a notification',
		// Grey or red lines below "Show a notification"
		notificationHint: 'Clicking the notification joins the server directly',
		notificationPermissionPending: `Click "Allow" in the browser's popup.
If no popup appeared, click the bell icon at the right end of the address bar and allow notifications.`,
		notificationsUnsupported: `This browser cannot show notifications here.
On an iPhone, add this site to the Home Screen first.`,
		notificationsBlockedError: 'Notifications are blocked for this site in the browser settings.',
		joinAutomaticallyCheckbox: 'Join the server automatically',
		// Grey line below "Join the server automatically"
		joinAutomaticallyHint: 'Opens up the server link automatically to join',
	},

	// Reports window, which only the owner of the site sees
	reports: {
		// Line at the top
		loading: 'Loading reports...',
		noReports: 'No reports yet.',
		reportCount: (count: number) => `${count} reports, newest first`,
		// Bold title of each report
		reportTitle: ({
			topic,
			sentAt,
			sender,
		}: {
			topic: string
			sentAt: string
			sender: string
		}) => `${topic} · ${sentAt} · ${sender}`,
		unverifiedSender: 'Unverified sender',
		notOwnerError: 'Only the owner of the site can read the reports',
	},
}
