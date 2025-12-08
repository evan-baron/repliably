// Library imports
import React from 'react';

// Styles imports
import styles from './sideBar.module.scss';

// Components imports
import NavigationItem from './NavigationItem';

// Navigation data
const navigationItems = [
	{ href: '/dashboard/new-email', label: 'New Email' },
	{ href: '/dashboard', label: 'Dashboard' },
	{ href: '/dashboard/analytics', label: 'Analytics' },
	{ href: '/dashboard/contacts', label: 'Contacts' },
	{ href: '/dashboard/sequences', label: 'Sequences' },
	{ href: '/dashboard/in-progress', label: 'In Progress' },
	{ href: '/dashboard/templates', label: 'Templates' },
	{ href: '/dashboard/settings', label: 'Settings' },
];

interface SidebarProps {
	currentPath?: string;
}

export default function SideBar({ currentPath }: SidebarProps) {
	return (
		<aside
			className={styles.sideBar}
			aria-label='Main navigation'
			role='complementary'
		>
			<nav
				className={styles.navigation}
				aria-label='Dashboard navigation menu'
				role='navigation'
			>
				<ul className={styles.navList} role='list'>
					{navigationItems.map((item) => (
						<NavigationItem
							key={item.href}
							href={item.href}
							label={item.label}
							isActive={currentPath === item.href}
						/>
					))}
				</ul>
			</nav>
		</aside>
	);
}
