'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './GmailConnection.module.scss';

interface GmailStatus {
	connected: boolean;
	email: string | null;
	connectedAt: string | null;
}

export default function GmailConnection() {
	const [status, setStatus] = useState<GmailStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [disconnecting, setDisconnecting] = useState(false);
	const [message, setMessage] = useState<{
		type: 'success' | 'error';
		text: string;
	} | null>(null);
	const searchParams = useSearchParams();

	useEffect(() => {
		// Check for success/error in URL params
		const gmailConnected = searchParams.get('gmail_connected');
		const gmailError = searchParams.get('gmail_error');

		if (gmailConnected === 'true') {
			setMessage({ type: 'success', text: 'Gmail connected successfully!' });
			// Clean up URL
			window.history.replaceState({}, '', '/dashboard/settings');
		} else if (gmailError) {
			setMessage({
				type: 'error',
				text: `Failed to connect Gmail: ${gmailError}`,
			});
			window.history.replaceState({}, '', '/dashboard/settings');
		}

		fetchStatus();
	}, [searchParams]);

	const fetchStatus = async () => {
		try {
			const response = await fetch('/api/google/status');
			if (response.ok) {
				const data = await response.json();
				setStatus(data);
			}
		} catch (error) {
			console.error('Error fetching Gmail status:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleConnect = () => {
		// Redirect to OAuth flow
		window.location.href = '/api/google/authorize';
	};

	const handleDisconnect = async () => {
		if (
			!confirm(
				'Are you sure you want to disconnect your Gmail account? You will not be able to send emails until you reconnect.'
			)
		) {
			return;
		}

		setDisconnecting(true);
		try {
			const response = await fetch('/api/google/disconnect', {
				method: 'POST',
			});

			if (response.ok) {
				setStatus({ connected: false, email: null, connectedAt: null });
				setMessage({ type: 'success', text: 'Gmail disconnected successfully' });
			} else {
				const data = await response.json();
				setMessage({
					type: 'error',
					text: data.error || 'Failed to disconnect Gmail',
				});
			}
		} catch (_error) {
			setMessage({ type: 'error', text: 'Failed to disconnect Gmail' });
		} finally {
			setDisconnecting(false);
		}
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return '';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (loading) {
		return (
			<div className={styles.container}>
				<h2 className={styles.title}>Gmail Connection</h2>
				<div className={styles.loading}>Loading...</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<h2 className={styles.title}>Gmail Connection</h2>
			<p className={styles.description}>
				Connect your Gmail account to send and receive emails through this
				application.
			</p>

			{message && (
				<div
					className={`${styles.message} ${styles[message.type]}`}
					onClick={() => setMessage(null)}
				>
					{message.text}
				</div>
			)}

			<div className={styles.statusCard}>
				<div className={styles.statusHeader}>
					<div
						className={`${styles.statusIndicator} ${status?.connected ? styles.connected : styles.disconnected}`}
					/>
					<span className={styles.statusText}>
						{status?.connected ? 'Connected' : 'Not Connected'}
					</span>
				</div>

				{status?.connected && status.email && (
					<div className={styles.details}>
						<div className={styles.detailRow}>
							<span className={styles.label}>Email:</span>
							<span className={styles.value}>{status.email}</span>
						</div>
						{status.connectedAt && (
							<div className={styles.detailRow}>
								<span className={styles.label}>Connected:</span>
								<span className={styles.value}>
									{formatDate(status.connectedAt)}
								</span>
							</div>
						)}
					</div>
				)}

				<div className={styles.actions}>
					{status?.connected ? (
						<button
							className={styles.disconnectButton}
							onClick={handleDisconnect}
							disabled={disconnecting}
						>
							{disconnecting ? 'Disconnecting...' : 'Disconnect Gmail'}
						</button>
					) : (
						<button className={styles.connectButton} onClick={handleConnect}>
							Connect Gmail
						</button>
					)}
				</div>
			</div>

			{!status?.connected && (
				<div className={styles.info}>
					<h3>Why connect Gmail?</h3>
					<ul>
						<li>Send emails directly from your Gmail account</li>
						<li>Track replies automatically</li>
						<li>Maintain your sender reputation</li>
					</ul>
					<p className={styles.note}>
						We only request the permissions needed to send and read emails. Your
						credentials are encrypted and stored securely.
					</p>
				</div>
			)}
		</div>
	);
}
