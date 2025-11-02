import { writable } from 'svelte/store'

export const errorMsg = writable<string | null>(null)

export function pushError(msg: string) {
	errorMsg.set(msg)
}

export function clearError() {
	errorMsg.set(null)
}
