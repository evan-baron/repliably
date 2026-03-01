'use client';

// Library imports
import { useState } from 'react';

// Hooks imports
import { useMessageUpdate } from '@/hooks/useMessages';
import { useMessageApprove } from '@/hooks/useMessages';

// Styles imports
import styles from './pendingMessagesTable.module.scss';

// MUI imports
import { Edit, SwapVert } from '@mui/icons-material';

// Helper functions imports
import {
	parseEmailContent,
	parseTinyMceContent,
} from '@/lib/helpers/emailHelpers';

// Validation imports
import { messageUpdateSchema } from '@/lib/validation';

// Types imports
import { MessageWithContact } from '@/types/messageTypes';

// Components imports
import TinyEditor from '../../tinyEditor/TinyEditor';
import Paginator from '../../paginator/Paginator';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const PendingMessagesTable = ({
	parentDiv,
	messages,
	nested,
}: {
	parentDiv?: string;
	messages: MessageWithContact[];
	nested?: boolean;
}) => {
	const { setErrors, setModalType, setSelectedEmail, setModalTitle } =
		useAppContext();
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
	const [editorContent, setEditorContent] = useState<string>('');
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [subjectContent, setSubjectContent] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(0);
	const { mutateAsync: updateMessage } = useMessageUpdate();
	const { mutateAsync: approveMessage } = useMessageApprove();

	const handleSort = () => {
		setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
	};

	const handleClick = (messageId: number) => {
		if (isEditing) {
			if (selectedMessage === messageId) return;

			setIsEditing(false);
			setSelectedMessage(messageId);
			return;
		}

		const selection =
			typeof window !== 'undefined' ? window.getSelection?.()?.toString() : '';
		if (selection && selection.length > 0) return;

		if (selectedMessage === messageId) {
			setSelectedMessage(null);
		} else {
			setSelectedMessage(messageId);
		}
	};

	const handleEdit = (
		e: React.MouseEvent<HTMLButtonElement>,
		messageId: number,
	) => {
		e.stopPropagation();
		if (messageId !== selectedMessage) {
			setSelectedMessage(messageId);
		}
		if (!selectedMessage) {
			setSelectedMessage(messageId);
		}
		setIsEditing(true);
	};

	const handleApprove = (messageId: number) => {
		if (isEditing) return;
		approveMessage(messageId);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setSelectedMessage(null);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSubjectContent(e.target.value);
	};

	const handleSaveAndApprove = async () => {
		if (!selectedMessage || !isEditing) return;

		const currentMessage = messages.find((m) => m.id === selectedMessage);

		const rawContents = (
			editorContent ??
			currentMessage?.contents ??
			''
		).trim();

		const strippedContents = rawContents
			.replace(/<[^>]*>/g, '')
			.replace(/&nbsp;/g, '')
			.trim();

		const result = messageUpdateSchema.safeParse({
			subject: (subjectContent ?? currentMessage?.subject ?? '').trim(),
			contents: strippedContents,
		});

		if (!result.success) {
			setErrors(result.error.issues.map((issue) => issue.message));
			setModalType('error');
			return;
		}

		try {
			await updateMessage({
				messageId: selectedMessage,
				subject: result.data.subject,
				contents: parseTinyMceContent(rawContents),
			});
			if (currentMessage?.needsApproval) {
				await approveMessage(selectedMessage);
			}
			setIsEditing(false);
			setSelectedMessage(null);
		} catch {
			setErrors(['Failed to save message. Please try again.']);
			setModalType('error');
		}
	};

	const sortedMessages = [...messages].sort((a, b) => {
		const dateA = new Date(a.createdAt).getTime();
		const dateB = new Date(b.createdAt).getTime();
		return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
	});

	const paginatedData = sortedMessages.reduce(
		(result: MessageWithContact[][], message, index) => {
			const chunkIndex = Math.floor(index / 15);
			if (!result[chunkIndex]) {
				result[chunkIndex] = [];
			}
			result[chunkIndex].push(message);
			return result;
		},
		[],
	);

	if (!messages.length) {
		return (
			<div className={styles.activity} role='status'>
				<p>No pending emails</p>
			</div>
		);
	}

	return (
		<div className={styles.tableContainer}>
			<table
				className={styles.table}
				role='table'
				aria-label='Pending messages table'
				aria-rowcount={paginatedData[currentPage]?.length + 1}
			>
				<thead
					className={`${styles.tableHeader} ${parentDiv === 'DashboardClient' ? styles.dashboardTableHeader : ''}`}
				>
					<tr role='row'>
						<th className={styles.md} role='columnheader' scope='col'>
							Contact Name
						</th>
						<th className={styles.lrg} role='columnheader' scope='col'>
							Email
						</th>
						<th className={styles.sm} role='columnheader' scope='col'>
							Status
						</th>
						<th
							className={styles.sm}
							onClick={() => handleSort()}
							role='columnheader'
							aria-sort={sortOrder === 'asc' ? 'ascending' : 'descending'}
							scope='col'
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleSort();
								}
							}}
						>
							<button
								type='button'
								className={styles.sort}
								aria-label='Sort by scheduled date'
							>
								<span>
									{parentDiv === 'DashboardClient' ? 'Date' : 'Scheduled Date'}
								</span>
								<SwapVert
									fontSize='small'
									aria-hidden='true'
									focusable='false'
								/>
							</button>
						</th>
						{parentDiv !== 'DashboardClient' && (
							<th
								colSpan={2}
								className={`${styles.sm} ${styles.center}`}
								role='columnheader'
								scope='col'
							>
								Actions
							</th>
						)}
					</tr>
				</thead>
				<tbody
					className={
						parentDiv === 'DashboardClient' ? styles.dashboardTableBody : ''
					}
				>
					{paginatedData[currentPage]?.map((message, rowIndex) => {
						const messageDateDay =
							message.scheduledAt && new Date(message.scheduledAt);
						const passedScheduledAt =
							messageDateDay ? new Date() >= messageDateDay : false;
						const parsedContent = parseEmailContent(message.contents);
						const emailContent = [`${message.subject}`, ...parsedContent];
						const messageStatus =
							(
								message.status === 'pending' ||
								(message.status === 'scheduled' &&
									message.needsApproval &&
									!message.approved)
							) ?
								parentDiv === 'DashboardClient' ?
									'Pending'
								:	'Pending Approval'
							:	'Scheduled';
						const messageNeedsApproval = message.needsApproval;
						const contactName =
							message.contact?.firstName ?
								message.contact.firstName + ' ' + message.contact?.lastName
							:	'Unknown';

						return (
							<tr
								key={message.id}
								onClick={() => {
									if (parentDiv === 'DashboardClient') {
										setSelectedEmail(message);
										setModalType('editMessage');
										setModalTitle(`Edit Email to ${contactName}`);
									} else {
										handleClick(message.id);
									}
								}}
								className={`${nested ? styles.nested : ''} ${
									selectedMessage === message.id ? styles.selectedMessage : ''
								} ${isEditing ? styles.editing : ''}`}
								role='row'
								aria-rowindex={rowIndex + 2}
								aria-expanded={selectedMessage === message.id}
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										if (parentDiv === 'DashboardClient') {
											setSelectedEmail(message);
											setModalType('editMessage');
											setModalTitle(`Edit Email to ${contactName}`);
										} else {
											handleClick(message.id);
										}
									}
								}}
							>
								<td className={styles.md} role='cell'>
									{contactName}
								</td>
								<td
									className={`${styles.lrg} ${styles['content-cell']}`}
									role='cell'
								>
									{isEditing && selectedMessage === message.id ?
										<div className={styles['rte-wrapper']}>
											{/* Subject Field */}
											<div className={styles['input-group']}>
												<div className={styles.input}>
													<label htmlFor='subject'>Subject:</label>
													<input
														type='text'
														id='subject'
														defaultValue={message.subject}
														onChange={(e) => handleChange(e)}
														aria-label={`Edit subject for message to ${contactName}`}
													/>
												</div>
											</div>

											{/* RTE */}
											<TinyEditor
												height={300}
												initialValue={message.contents}
												setEditorContent={setEditorContent}
												editorId={`edit-message-${message.id}-editor`}
												aria-label={`Edit content for message to ${contactName}`}
											/>
											<div className={styles.buttons}>
												<button
													type='button'
													className={styles.button}
													onClick={handleSaveAndApprove}
													aria-label={
														messageNeedsApproval ?
															`Save and approve message to ${contactName}`
														:	`Save changes to message for ${contactName}`
													}
												>
													{messageNeedsApproval ?
														'Save and Approve'
													:	'Save Changes'}
												</button>
												<button
													type='button'
													className={styles.button}
													onClick={handleCancel}
													aria-label={`Cancel editing message for ${contactName}`}
												>
													Cancel
												</button>
											</div>
										</div>
									:	<div className={styles['parsed-content']}>
											<span className={styles['message-preview']}>
												{emailContent[0]}
											</span>
											{selectedMessage === message.id &&
												emailContent.length > 1 &&
												emailContent
													.slice(1)
													.map((text, index) => (
														<span key={index}>{text || '\u00A0'}</span>
													))}
										</div>
									}
								</td>
								<td
									className={`${styles.sm} ${
										(
											message.status === 'pending' ||
											(message.status === 'scheduled' &&
												message.needsApproval &&
												!message.approved)
										) ?
											styles.important
										: message.status === 'scheduled' ? styles.approved
										: ''
									}`}
									role='cell'
								>
									{messageStatus}
								</td>
								<td
									className={`${styles.sm} ${styles.right} ${
										passedScheduledAt ? styles.important : ''
									}`}
									role='cell'
								>
									<time dateTime={messageDateDay!.toISOString()}>
										{messageDateDay!.toLocaleDateString()}
									</time>
								</td>
								{parentDiv !== 'DashboardClient' && (
									<td
										colSpan={2}
										className={styles.buttonBox}
										style={{
											verticalAlign:
												isEditing || selectedMessage === message.id ?
													'top'
												:	'middle',
											paddingTop:
												isEditing || selectedMessage === message.id ?
													'.25rem'
												:	'0',
										}}
										role='cell'
									>
										<div className={styles.buttons}>
											<button
												type='button'
												className={`${styles.action} ${
													isEditing ? styles.disabled : ''
												}`}
												onClick={(e) => handleEdit(e, message.id)}
												disabled={isEditing}
												aria-disabled={isEditing}
												aria-label={`Edit message to ${contactName}`}
											>
												<Edit className={styles.icon} />
												Edit
											</button>
											<button
												type='button'
												className={`${styles.action} ${
													isEditing || !messageNeedsApproval ?
														styles.disabled
													:	''
												}`}
												disabled={isEditing || !messageNeedsApproval}
												aria-disabled={isEditing || !messageNeedsApproval}
												onClick={() => handleApprove(message.id)}
												aria-label={`Approve message to ${contactName}`}
											>
												Approve
											</button>
										</div>
									</td>
								)}
							</tr>
						);
					})}
				</tbody>
			</table>
			{paginatedData.length > 1 && (
				<Paginator
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
					pages={paginatedData}
				/>
			)}
		</div>
	);
};

export default PendingMessagesTable;
