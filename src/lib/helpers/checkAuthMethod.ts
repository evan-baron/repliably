export interface Auth0Identity {
	connection: string;
	provider: string;
	user_id: string;
	isSocial: boolean;
}

export function hasPasswordAuth(identities: Auth0Identity[] = []): boolean {
	// Check if user has Username-Password-Authentication connection
	return identities.some(
		(identity) =>
			identity.connection === 'Username-Password-Authentication' ||
			identity.provider === 'auth0',
	);
}

export function isGoogleAuth(identities: Auth0Identity[] = []): boolean {
	return identities.some((identity) => identity.provider === 'google-oauth2');
}

export function getAuthProvider(identities: Auth0Identity[] = []): string {
	if (!identities.length) return 'unknown';

	const provider = identities[0].provider;

	switch (provider) {
		case 'google-oauth2':
			return 'Google';
		case 'auth0':
			return 'Email/Password';
		default:
			return provider;
	}
}
