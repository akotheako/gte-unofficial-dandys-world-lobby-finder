import type { DesktopWindowName } from './useLogic.ts'

// Only one window is open at a time, so any other window shrinks back into its icon
export function openWindowFromIcon({
	getOpenDesktopWindowName,
	setOpenDesktopWindowName,
	closeFindATeamWindow,
	desktopWindowName,
}: {
	getOpenDesktopWindowName: () => DesktopWindowName | null
	setOpenDesktopWindowName: (openDesktopWindowName: DesktopWindowName) => void
	closeFindATeamWindow: () => void
	desktopWindowName: DesktopWindowName
}) {
	const openDesktopWindowName = getOpenDesktopWindowName()
	if (openDesktopWindowName === desktopWindowName) return
	if (openDesktopWindowName === 'Find a Team') closeFindATeamWindow()
	setOpenDesktopWindowName(desktopWindowName)
}
