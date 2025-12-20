'use client';

// Library imports
import React, { useState } from 'react';

interface TestButtonProps {
	emailText?: String;
	emailTo: String;
	emailSubject?: String;
}

const TestButton = ({ emailText, emailTo, emailSubject }: TestButtonProps) => {
	const [sending, setSending] = useState(false);
	const [message, setMessage] = useState('');

	const handleClick = async () => {
		setSending(true);

		try {
			const response = await fetch('/api/send-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					to: emailTo,
					subject: emailSubject || 'Test Email from Application',
					body:
						emailText ||
						'This is a test email from the application automation system.',
				}),
			});

			const result = await response.json();

			if (response.ok) {
				alert('Email sent successfully!');
				setMessage(''); // Clear the message after successful send
			} else {
				alert(`Failed to send email: ${result.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Error sending email:', error);
			alert('Error sending email. Check console for details.');
		} finally {
			setSending(false);
		}
	};

	return (
		<button onClick={handleClick} disabled={sending}>
			{sending ? 'Sending...' : 'Send Test Email'}
		</button>
	);
};

export default TestButton;
