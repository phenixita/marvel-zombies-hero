/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

interface ImportMetaEnv {
	readonly VITE_FIREBASE_API_KEY?: string
	readonly VITE_FIREBASE_AUTH_DOMAIN?: string
	readonly VITE_FIREBASE_PROJECT_ID?: string
	readonly VITE_FIREBASE_STORAGE_BUCKET?: string
	readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
	readonly VITE_FIREBASE_APP_ID?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}