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
					<Link
						href='/'
						className={styles.logo}
						aria-label='Repliably - Go to homepage'
					>
						<h1 className={styles.appTitle}>
							{/* Repl<span>ai</span>All */}
							Repliably
						</h1>
						<div className={styles.iconContainer}>
							<MailOutlineRounded className={styles.icon} />
						</div>
					</Link>
					<div className={styles.userSection}>
						<p className={styles.welcomeText}>Welcome, {userName}</p>
						<LogoutButton />
					</div>
				</div>
			</header>
		</>
	);
}
