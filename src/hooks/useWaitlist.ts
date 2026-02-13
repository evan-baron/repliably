import { waitlistAPI } from '@/services/api';

// Tanstack React Query
import { useMutation } from '@tanstack/react-query';

export const useJoinWaitlist = () => {
	return useMutation({
		mutationFn: waitlistAPI.joinWaitlist,
		onSuccess: () => {
			// Optionally, you can show a success message or perform other actions here
			console.log('Successfully joined the waitlist!');
		},
	});
};
