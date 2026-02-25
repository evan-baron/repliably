'use client';

// Libraries imports
import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

// Types for email sending and override
import { PendingEmailData } from '@/types/emailTypes';

interface EmailContextType {
	pendingEmail: PendingEmailData | null;
	setPendingEmail: (data: PendingEmailData | null) => void;
	lastError: any;
	setLastError: (err: any) => void;
	clearEmailContext: () => void;
	resetForm: boolean;
	setResetForm: (callback: boolean) => void;
	selectedSequenceId: number | null;
	setSelectedSequenceId: (sequenceId: number | null) => void;
	selectedSequenceEndDate: Date | null;
	setSelectedSequenceEndDate: (endDate: Date | null) => void;
	emailSentId: number | null;
	setEmailSentId: (id: number | null) => void;
	originalBodyContent: string;
	setOriginalBodyContent: (content: string) => void;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const EmailContextProvider = ({ children }: { children: ReactNode }) => {
	const queryClient = useQueryClient();
	const pathname = usePathname();
	const [pendingEmail, setPendingEmail] = useState<PendingEmailData | null>(
		null,
	);
	const [lastError, setLastError] = useState<any>(null);
	const [resetForm, setResetForm] = useState<boolean>(false);
	const [selectedSequenceId, setSelectedSequenceId] = useState<number | null>(
		null,
	);
	const [selectedSequenceEndDate, setSelectedSequenceEndDate] =
		useState<Date | null>(null);
	const [emailSentId, setEmailSentId] = useState<number | null>(null);
	const [originalBodyContent, setOriginalBodyContent] =
		useState<string>('<p></p>');

	// Reset originalBodyContent when route changes
	useEffect(() => {
		setOriginalBodyContent('<p></p>');
	}, [pathname]);

	useEffect(() => {
		if (emailSentId === null) return;

		(async () => {
			try {
				const result = await fetch(`/api/messages/${emailSentId}/generate`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: emailSentId }),
				});

				if (!result.ok) {
					console.error(
						'Failed to trigger follow-up generation:',
						await result.text(),
					);
					return;
				}

				const body = await result.json();

				const {
					result: { contactId },
				} = body;

				if (!contactId) {
					console.error(
						'No contactId returned from follow-up generation. Nothing to invalidate.',
					);
					return;
				}

				// Invalidate contact data to refresh any changes
				queryClient.invalidateQueries({
					queryKey: ['contact-get-unique', contactId],
				});
				queryClient.invalidateQueries({ queryKey: ['contacts-get-all'] });
				queryClient.invalidateQueries({
					queryKey: ['sequences-by-contact-id', contactId],
				});
				queryClient.invalidateQueries({
					queryKey: ['all-messages-by-contact-id', contactId],
				});
				queryClient.invalidateQueries({
					queryKey: ['pending-messages-get-all'],
				});
			} catch (error) {
				console.error('Error triggering follow-up generation:', error);
			} finally {
				setEmailSentId(null);
			}
		})();
		setEmailSentId(null);
	}, [emailSentId]);

	const clearEmailContext = () => {
		setPendingEmail(null);
		setLastError(null);
		setResetForm(true);
	};

	return (
		<EmailContext.Provider
			value={{
				pendingEmail,
				setPendingEmail,
				lastError,
				setLastError,
				clearEmailContext,
				resetForm,
				setResetForm,
				selectedSequenceId,
				setSelectedSequenceId,
				selectedSequenceEndDate,
				setSelectedSequenceEndDate,
				emailSentId,
				setEmailSentId,
				originalBodyContent,
				setOriginalBodyContent,
			}}
		>
			{children}
		</EmailContext.Provider>
	);
};

export const useEmailContext = (): EmailContextType => {
	const context = useContext(EmailContext);
	if (!context) {
		throw new Error(
			'useEmailContext must be used within an EmailContextProvider',
		);
	}
	return context;
};
