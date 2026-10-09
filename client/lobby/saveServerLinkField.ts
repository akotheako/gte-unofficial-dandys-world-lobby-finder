export function saveServerLinkField({
	setServerLink,
	serverLink,
}: {
	setServerLink: (serverLink: string) => void
	serverLink: string
}) {
	localStorage.setItem('serverLink', serverLink)
	setServerLink(serverLink)
}
