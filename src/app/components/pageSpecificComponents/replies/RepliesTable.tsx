// Library imports
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// Services imports

// Hooks imports
import { useReplyUpdate } from '@/hooks/useReplies';

// Styles imports
import styles from './repliesTable.module.scss';

// MUI imports
import { SwapVert } from '@mui/icons-material';

// Types imports
import { RepliesFromDB } from '@/types/repliesTypes';

// Helper functions imports
import { parseReplyContent } from '@/lib/helpers/emailHelpers';

const RepliesTable = ({ replies }: { replies: RepliesFromDB[] }) => {
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [selectedReply, setSelectedReply] = useState<number | null>(null);
	const { mutateAsync: updateReply } = useReplyUpdate();

	const clickedRepliesRef = useRef<Set<number>>(new Set());
	const clickedReplies = clickedRepliesRef.current;

	useEffect(() => {
		for (let reply of replies) {
			if (reply.processed) {
				clickedReplies.add(reply.id);
			}
		}
	}, [replies]);

	const handleClick = (replyId: number) => {
		if (selectedReply === replyId) {
			setSelectedReply(null);
			return;
		}

		setSelectedReply(replyId);

		if (!clickedReplies.has(replyId)) {
			handleUpdate(replyId);
			clickedReplies.add(replyId);
		}
	};

	const handleUpdate = (replyId: number) => {
		updateReply(replyId);
	};

	const handleSort = () => {
		setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
	};

	const sortedReplies = [...replies].sort((a, b) => {
		const dateA = new Date(a.createdAt).getTime();
		const dateB = new Date(b.createdAt).getTime();
		return sortOrder === 'desc' ? dateA - dateB : dateB - dateA;
	});

	if (replies && !replies.length) {
		return (
			<div className={styles.activity} role='status'>
				<p>No replies</p>
			</div>
		);
	}

	return (
		<table
			className={styles.table}
			role='table'
			aria-label='Email replies table'
			aria-rowcount={sortedReplies.length + 1}
		>
			<thead className={styles.tableHeader}>
				<tr role='row'>
					<th className={styles.sm} role='columnheader' scope='col'>
						Contact Name
					</th>
					<th className={styles.lrg} role='columnheader' scope='col'>
						Email
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
							aria-label='Sort by reply date'
						>
							<span>Reply Date</span>
							<SwapVert fontSize='small' aria-hidden='true' focusable='false' />
						</button>
					</th>
					<th
						colSpan={2}
						className={`${styles.sm} ${styles.center}`}
						role='columnheader'
						scope='col'
					>
						View Sequence
					</th>
				</tr>
			</thead>
			<tbody>
				{sortedReplies.map((reply, rowIndex) => {
					const replyDateDay = new Date(reply.createdAt);

					const parsedContent = parseReplyContent(reply.replyContent);
					const message = [`${reply.replySubject}`, ...parsedContent];

					const contactName =
						reply.contact?.firstName ?
							reply.contact.firstName + ' ' + reply.contact?.lastName
						:	'Unknown';

					const isUnread = !reply.processed && !clickedReplies.has(reply.id);

					return (
						<tr
							key={reply.id}
							onClick={() => handleClick(reply.id)}
							className={`
								${selectedReply === reply.id ? styles.selectedMessage : ''} 
								${isUnread ? styles.unread : ''} 
								${styles.replies}
							`}
							role='row'
							aria-rowindex={rowIndex + 2}
							aria-expanded={selectedReply === reply.id}
							aria-label={
								isUnread ? `Unread reply from ${contactName}` : undefined
							}
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleClick(reply.id);
								}
							}}
						>
							<td className={`${styles.sm} ${styles.name}`} role='cell'>
								{contactName}
							</td>

							<td
								className={`
									${styles.lrg} 
									${styles['content-cell']} 
									${styles.content}
								`}
								role='cell'
							>
								<div className={styles['parsed-content']}>
									<span className={styles.subject}>{message[0]}</span>
									{selectedReply === reply.id &&
										message.length > 1 &&
										message
											.slice(1)
											.map((text, index) => <span key={index}>{text}</span>)}
								</div>
							</td>

							<td
								className={`${styles.sm} ${styles.right} ${styles.date}`}
								role='cell'
							>
								<time dateTime={replyDateDay.toISOString()}>
									{replyDateDay.toLocaleDateString()}
								</time>
							</td>
							<td className={`${styles.sm} ${styles.right}`} role='cell'>
								<Link
									href={`/dashboard/contacts/${reply.contactId}`}
									className={styles.link}
									onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
										e.stopPropagation()
									}
									aria-label={`View sequence for ${contactName}`}
								>
									Go to Sequence
								</Link>
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

export default RepliesTable;
