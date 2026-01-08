export const sequenceType = (type: string, startDate: Date) => {
	const sequenceTypes: { [key: string]: string } = {
		'3day': 'Every 3 days',
		'31day': 'Every 3 days then 1 day',
		weekly: `Weekly (on ${startDate.toLocaleDateString('en-US', {
			weekday: 'long',
		})}s)`,
		biweekly: `Bi-weekly (on ${startDate.toLocaleDateString('en-US', {
			weekday: 'long',
		})}s)`,
		monthly: `Every 4 weeks (on ${startDate.toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
		})}s)`,
	};

	return sequenceTypes[type] || 'Custom';
};
