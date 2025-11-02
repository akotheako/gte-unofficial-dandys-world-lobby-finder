import { browser } from '$app/environment'
import { initializeApp } from 'firebase/app'
import {
	getFunctions,
	httpsCallable,
	connectFunctionsEmulator,
	type HttpsCallable,
} from 'firebase/functions'
import {
	getFirestore,
	getDoc as gteGetDoc,
	doc as gteDoc,
	connectFirestoreEmulator,
} from 'firebase/firestore'

const app = initializeApp({
	apiKey: 'AIzaSyAzv2yATCAmAOVJgoOMS_56vDUv8Mb8gX8',
	authDomain: 'storytect-e77d1.firebaseapp.com',
	projectId: 'storytect-e77d1',
	storageBucket: 'storytect-e77d1.firebasestorage.app',
	messagingSenderId: '178947771962',
	appId: '1:178947771962:web:6b76776633435433b56f03',
	measurementId: 'G-X4HHEM6BEF',
})

const functions = getFunctions(app)
const db = getFirestore(app)

if (browser && location.hostname === 'localhost') {
	connectFunctionsEmulator(functions, 'localhost', 5001)
	connectFirestoreEmulator(db, 'localhost', 8080)
}

export { app, functions, db, httpsCallable, gteDoc, gteGetDoc }

export async function saveUserProfile(args: { handle: string; privateServerUrl: string }) {
	const call: HttpsCallable<{ handle: string; privateServerUrl: string }, any> =
		httpsCallable(functions, 'saveUserProfile')
	const res = await call(args)
	if (!res.data?.ok) throw new Error(res.data?.error || 'Save failed')
}

export async function sendFeedbackEmail(args: { category: string; message: string; contact?: string }) {
	const call: HttpsCallable<{ category: string; message: string; contact?: string }, any> =
		httpsCallable(functions, 'sendFeedbackEmail')
	const res = await call(args)
	if (!res.data?.ok) throw new Error(res.data?.error || 'Send failed')
}
