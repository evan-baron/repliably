// Services imports
import { getApiUser } from './getUserService';

export async function getUserSettings() {
	const { user, error } = await getApiUser();

	if (error || !user) {
		console.error('Error fetching user or user not found:', error);
		return { settings: {} };
	}

	const cadenceTypeMapping: { [key: number]: string } = {
		1: '1day',
		3: '3day',
		31: '31day',
		7: 'weekly',
		14: 'biweekly',
		28: 'monthly',
	};

	const cadenceDurationMapping: { [key: number]: string | null } = {
		15: '15',
		30: '30',
		60: '60',
		90: '90',
		NaN: 'indefinite',
	};

	const autoSendDelayMapping: { [key: number]: string | null } = {
		1: '1',
		2: '2',
		999: 'never',
	};

	const defaults = {
		followUpCadence:
			cadenceTypeMapping[user?.defaultSequenceType || 0] || '3day',
		autoSend: user?.defaultRequireApproval || false,
		autoSendDelay: autoSendDelayMapping[user?.defaultSendDelay || NaN] || '',
		cadenceDuration:
			cadenceDurationMapping[user?.defaultSequenceDuration || NaN] || '30',
		referencePreviousEmail: user?.defaultReferencePrevious || false,
		alterSubjectLine: user?.defaultAlterSubjectLine || false,
	};

	return { defaults };
}
