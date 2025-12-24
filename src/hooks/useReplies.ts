import { useQuery, useMutation } from './api';
import { repliesAPI } from '@/services/api';

interface Reply {
	id: number;
	replySubject: string;
	replyContent: string;
	date: string;
	contact: {
		email: string;
		firstName?: string;
		lastName?: string;
	};
}

export const useReplies = () => {
	return useQuery<Reply[]>('replies', repliesAPI.getAll, {
		immediate: true,
		onError: (error) => {
			console.error('Error fetching replies:', error);
		},
	});
};

export const useCheckReplies = () => {
	return useMutation(() => repliesAPI.checkForNew(), {
		onSuccess: () => {
			alert('Checked for replies successfully!');
		},
		onError: (error) => {
			console.error('Error:', error);
			alert('Error checking for replies');
		},
	});
};
