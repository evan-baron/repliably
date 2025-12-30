import { emailAPI } from '@/services/api';

// Tanstack React Query
import { useMutation } from '@tanstack/react-query';

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
	return useMutation({
		mutationFn: emailAPI.send,
		onSuccess: (response: EmailResponse, emailData: EmailData) => {
			alert(`Email sent successfully! Message ID: ${response.messageId}`);
		},
		onError: (error: Error, emailData: EmailData) => {
			console.error('Error sending email:', error);
			alert(`Failed to send email: ${error.message}`);
		},
	});
};
