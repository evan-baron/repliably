import Link from 'next/link';

// Styles imports
import styles from './topBar.module.scss';

// Components imports
import LogoutButton from '../../buttons/LogoutButton';

// MUI imports
import { MailOutlineRounded } from '@mui/icons-material';

interface TopBarProps {
	userName: string;
}

export default function TopBar({ userName }: TopBarProps) {
	return (
		<>
			<header
				className={styles.topBar}
				role='banner'
				aria-label='Application header'
			>
				<div className={styles.topBarContent}>
					<Link href='/' className={styles.logo} aria-label='Go to homepage'>
						<h1
							className={styles.appTitle}
							id='app-title'
							aria-label='Repliably - Main application title'
						>
							{/* Repl<span>ai</span>All */}
							Repliably
						</h1>
						<div className={styles.iconContainer}>
							<MailOutlineRounded className={styles.icon} />
						</div>
					</Link>
					<div
						className={styles.userSection}
						role='region'
						aria-label='User account section'
					>
						<span
							className={styles.welcomeText}
							aria-label={`Welcome message for ${userName}`}
						>
							Welcome, {userName}
						</span>
						<LogoutButton />
					</div>
				</div>
			</header>
		</>
	);
}
