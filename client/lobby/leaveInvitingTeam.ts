import type { CheckInAnswer } from '../../shared/teamTypes.ts'

// A friend who opened an invite link leaves the team by closing Find a Team
export function leaveInvitingTeam({
	setInviteFromLink,
	setInvitingTeam,
}: {
	setInviteFromLink: (inviteFromLink: null) => void
	setInvitingTeam: (invitingTeam: CheckInAnswer['invitingTeam']) => void
}) {
	if (!new URLSearchParams(location.search).has('invite')) return
	history.replaceState(null, '', location.pathname)
	setInviteFromLink(null)
	setInvitingTeam(null)
}
