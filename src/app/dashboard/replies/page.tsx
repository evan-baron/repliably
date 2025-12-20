'use client';

import { useState, useEffect } from 'react';
import styles from './repliesPage.module.scss';

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

export default function RepliesPage() {
	const [replies, setReplies] = useState<Reply[]>([]);
	const [loading, setLoading] = useState(false);
	const [checking, setChecking] = useState(false);

	const fetchReplies = async () => {
		try {
			const response = await fetch('/api/replies');
			const data = await response.json();
			setReplies(data);
			console.log(data);
		} catch (error) {
			console.error('Error fetching replies:', error);
		}
	};

	const checkForNewReplies = async () => {
		setChecking(true);
		try {
			const response = await fetch('/api/check-replies', { method: 'POST' });
			const result = await response.json();

			if (result.success) {
				alert('Checked for replies successfully!');
				// Refresh the replies list
				await fetchReplies();
			} else {
				alert('Error checking for replies: ' + result.error);
			}
		} catch (error) {
			console.error('Error:', error);
			alert('Error checking for replies');
		} finally {
			setChecking(false);
		}
	};

	useEffect(() => {
		fetchReplies();
	}, []);

	return (
		<div className={styles.repliesPage}>
			<div className={styles.header}>
				<h1>Email Replies</h1>
				<button
					onClick={checkForNewReplies}
					disabled={checking}
					className={styles.checkButton}
				>
					{checking ? 'Checking...' : 'Check for New Replies'}
				</button>
			</div>

			{replies.length === 0 ? (
				<div className={styles.emptyState}>
					<p>No replies yet. Send some emails and check back!</p>
				</div>
			) : (
				<div className={styles.repliesGrid}>
					{replies.map((reply) => (
						<div key={reply.id} className={styles.replyCard}>
							<div className={styles.replyHeader}>
								<h3>{reply.contact.firstName || reply.contact.email}</h3>
								<span className={styles.date}>
									{new Date(reply.date).toLocaleDateString()}
								</span>
							</div>
							<div className={styles.subject}>{reply.replySubject}</div>
							<div
								className={styles.content}
								style={{ whiteSpace: 'pre-wrap' }}
							>
								{reply.replyContent}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
