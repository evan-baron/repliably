// Library imports
import Link from 'next/link';

// Styles imports
import styles from './navigationItem.module.scss';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

interface NavigationItemProps {
	href: string;
	label: string;
	isActive?: boolean;
	notifications?: boolean;
	icon?: React.ReactNode;
	emailConnectionStatus?: boolean;
}

export default function NavigationItem({
	href,
	label,
	isActive = false,
	notifications = false,
	icon,
	emailConnectionStatus = false,
}: NavigationItemProps) {
	const {
		setModalType,
		setAlertMessage,
		newReplyNotification,
		setNewReplyNotification,
	} = useAppContext();

	const activeLabels = [
		'New Email',
		'Dashboard',
		'Contacts',
		'Sequences',
		'Pending',
		'Replies',
		'Settings',
	];

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (label === 'New Email' && !emailConnectionStatus) {
			e.preventDefault();

			setAlertMessage('No email');

			setModalType('alert');
		}

		if (label === 'Replies' && newReplyNotification) {
			setNewReplyNotification(false);
		}

		if (!activeLabels.includes(label)) {
			e.preventDefault();
		}
	};

	const displayLabel = label === 'Pending' ? 'Pending Emails' : label;

	return (
		<li role='none'>
			<Link
				href={href}
				className={`${
					label !== 'New Email' ? styles.navLink : styles.actionButton
				} ${isActive ? styles.active : ''} ${
					notifications ? styles.notification : ''
				}`}
				aria-current={isActive ? 'page' : undefined}
				aria-label={
					notifications ? `${displayLabel} - has notifications` : displayLabel
				}
				onClick={handleClick}
			>
				<div
					className={`${styles.linkInner} ${isActive ? styles.active : ''}`}
					aria-hidden='true'
				>
					{icon}
					{displayLabel}
				</div>
				{notifications && (
					<span className='sr-only'>You have new notifications</span>
				)}
			</Link>
		</li>
	);
}
