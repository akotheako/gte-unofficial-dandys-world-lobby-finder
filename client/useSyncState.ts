/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react'
import type { DeepPartial } from '../shared/genericTypes.ts'

export const useSyncState = <T>(initialState: T | (() => T)) => {
	const [state, setState] = useState(initialState)
	const stateRef = useRef(state)
	// Created once, so effects can list these functions as dependencies without re-running
	const [functions] = useState(() => ({
		/** Use getSyncState() in functions */
		getSyncState: () => stateRef.current,
		setState: (arg: Partial<T>) => {
			const newState = {
				...stateRef.current,
				...arg,
			}
			stateRef.current = newState
			setState(newState)
		},
		setStateDeepPartial: (arg: DeepPartial<T>) => {
			const setObjDeepPartial = (obj: any, changes: any) => {
				if (!obj || typeof obj !== 'object' || !changes || typeof changes !== 'object') {
					return obj
				}

				const newObj = { ...obj }

				Object.keys(changes).forEach(key => {
					if (!Array.isArray(changes[key]) && typeof changes[key] === 'object' && changes[key] !== null) {
						newObj[key] = setObjDeepPartial(newObj[key], changes[key])
					} else {
						newObj[key] = changes[key]
					}
				})

				return newObj
			}
			const newState = setObjDeepPartial(stateRef.current, arg)
			stateRef.current = newState
			setState(newState)
		},
		mutateState: (func: (currentState: T) => any) => {
			const setObjDeepPartial = (obj: any, changes: any) => {
				if (!obj || typeof obj !== 'object' || !changes || typeof changes !== 'object') {
					return obj
				}

				const newObj = { ...obj }

				Object.keys(changes).forEach(key => {
					if (!Array.isArray(changes[key]) && typeof changes[key] === 'object' && changes[key] !== null) {
						newObj[key] = setObjDeepPartial(newObj[key], changes[key])
					} else {
						newObj[key] = changes[key]
					}
				})

				return newObj
			}

			func(stateRef.current as any) // mutates the state directly

			const newState = setObjDeepPartial(stateRef.current, stateRef.current)
			stateRef.current = newState
			setState(newState)
		},
	}))

	return {
		/** Use asyncState in component props */
		asyncState: state,
		...functions,
	}
}
