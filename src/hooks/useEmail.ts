import { useMutation } from './api';
import { emailAPI } from '@/services/api';

interface EmailData {
	to: string;
	subject: string;
	body: string;
}

interface EmailResponse {
	success: boolean;
	messageId: string;
	threadId: string;
}

export const useEmailSend = () => {
	return useMutation<EmailResponse, EmailData>(emailAPI.send, {
		onSuccess: (response) => {
			alert(`Email sent successfully! Message ID: ${response.messageId}`);
		},
		onError: (error) => {
			alert(`Failed to send email: ${error.message}`);
		},
	});
};
