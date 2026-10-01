// A friend who opens an invite link lands in Find a Team, which shows the team that invited them
export function openFindATeamFromInviteLink() {
	if (new URLSearchParams(location.search).has('invite')) {
		document.getElementById('team-icon')?.click()
	}
}
