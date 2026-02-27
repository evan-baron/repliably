'use client';

// Library imports
import React, { useState } from 'react';

// Hooks imports
import { useMessageUpdate } from '@/hooks/useMessages';
import { useMessageApprove } from '@/hooks/useMessages';

// Validation imports
import { messageUpdateSchema } from '@/lib/validation';

// Helper functions imports
import { parseTinyMceContent } from '@/lib/helpers/emailHelpers';

// Styles imports
import styles from './editMessageModal.module.scss';

// Components imports
import TinyEditor from '@/app/components/tinyEditor/TinyEditor';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const EditMessageModal = () => {
	const { selectedEmail, setSelectedEmail, setModalType } = useAppContext();
	const [editorContent, setEditorContent] = useState<string | null>(null);
	const [subjectContent, setSubjectContent] = useState<string | null>(null);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [editorResetKey, setEditorResetKey] = useState<number>(0);
	const { mutateAsync: updateMessage } = useMessageUpdate();
	const { mutateAsync: approveMessage } = useMessageApprove();

	if (!selectedEmail) {
		return null;
	}

	const {
		contact: { firstName, lastName },
		subject,
		contents,
	} = selectedEmail;
	const contactName = firstName ? `${firstName} ${lastName}` : 'Unknown';

	const handleSaveAndApprove = async () => {
		if (!selectedEmail) return;

		const rawContents = (editorContent ?? selectedEmail.contents ?? '').trim();
		const strippedContents = rawContents
			.replace(/<[^>]*>/g, '')
			.replace(/&nbsp;/g, '')
			.trim();

		const result = messageUpdateSchema.safeParse({
			subject: (subjectContent ?? selectedEmail.subject ?? '').trim(),
			contents: strippedContents,
		});

		if (!result.success) {
			const failedFields = result.error.issues.map((issue) => issue.path[0]);
			if (failedFields.includes('subject')) setSubjectContent(null);
			if (failedFields.includes('contents')) {
				setEditorContent(null);
				setEditorResetKey((prev) => prev + 1);
			}
			setValidationErrors(result.error.issues.map((issue) => issue.message));
			return;
		}

		try {
			setValidationErrors([]);
			await updateMessage({
				messageId: selectedEmail.id,
				subject: result.data.subject,
				contents: parseTinyMceContent(rawContents),
			});
			if (selectedEmail.needsApproval) {
				await approveMessage(selectedEmail.id);
			}
			setSelectedEmail(null);
			setModalType(null);
		} catch {
			setValidationErrors(['Failed to save message. Please try again.']);
		}
	};

	const handleCancel = () => {
		setSelectedEmail(null);
		setModalType(null);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSubjectContent(e.target.value);
		if (validationErrors.length > 0) setValidationErrors([]);
	};

	const messageNeedsApproval = selectedEmail.needsApproval;

	return (
		<div className={styles['rte-wrapper']}>
			{/* Subject Field */}
			<div className={styles['input-group']}>
				<div className={styles.input}>
					<label htmlFor='subject'>Subject:</label>
					<input
						type='text'
						id='subject'
						value={subjectContent ?? subject}
						onChange={(e) => handleChange(e)}
						aria-label={`Edit subject for message to ${contactName}`}
					/>
				</div>
			</div>

			{/* RTE */}
			<TinyEditor
				key={editorResetKey}
				height={300}
				width={672}
				initialValue={contents}
				setEditorContent={(content) => {
					setEditorContent(content);
					if (validationErrors.length > 0) setValidationErrors([]);
				}}
				editorId={`edit-message-${selectedEmail.id}-editor`}
				aria-label={`Edit content for message to ${contactName}`}
			/>
			{validationErrors.length > 0 && (
				<ul className={styles.errors} role='alert'>
					{validationErrors.map((error) => (
						<li key={error}>{error}</li>
					))}
				</ul>
			)}
			<div className={styles.buttons}>
				<button
					type='button'
					className={'button login'}
					onClick={handleSaveAndApprove}
					aria-label={
						messageNeedsApproval ?
							`Save and approve message to ${contactName}`
						:	`Save changes to message for ${contactName}`
					}
				>
					{messageNeedsApproval ? 'Save and Approve' : 'Save Changes'}
				</button>
				<button
					type='button'
					className={'button cancel'}
					onClick={handleCancel}
					aria-label={`Cancel editing message for ${contactName}`}
				>
					Cancel
				</button>
			</div>
		</div>
	);
};

export default EditMessageModal;
