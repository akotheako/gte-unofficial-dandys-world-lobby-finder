/* eslint-disable @typescript-eslint/no-explicit-any */
export type ValueOf<T> = T[keyof T]

type OmitUndefined<T> = {
	[K in keyof T]: T[K] extends undefined ? never : K
}[keyof T]

export const removeEmptyProperties = <T>(obj: T): { [K in OmitUndefined<T>]: T[K] } => {
	const result: any = {}
	for (const key in obj) {
		if (obj[key] != null) {
			result[key] = obj[key]
		}
	}
	return result
}

export type DeepPartial<T> = T extends object ? {
	[P in keyof T]?: DeepPartial<T[P]>
} : T

export type NeverizeOtherProps<T, U> = {
	[K in Exclude<keyof (U), keyof T>]: never
}

export type Combine<T, U> =
	| (T & Partial<NeverizeOtherProps<T, U>>)
	| (U & Partial<NeverizeOtherProps<U, T>>)

export type DeepReadonly<T> =
	T extends (infer R)[] ? DeepReadonlyArray<R> :
		T extends (...args: any[]) => any ? T :
			T extends object ? DeepReadonlyObject<T> :
				T

type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>

type DeepReadonlyObject<T> = {
	readonly [P in keyof T]: DeepReadonly<T[P]>
}
