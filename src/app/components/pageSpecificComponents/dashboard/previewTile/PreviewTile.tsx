// Library imports
import React, { ReactNode } from 'react';
import Link from 'next/link';

// Hooks imports

// Styles imports
import styles from './previewTile.module.scss';

interface PreviewTileProps {
	title: string;
	children: ReactNode;
	className?: string;
	loading?: boolean;
	error?: boolean;
	href?: string;
}

const PreviewTile = ({
	title,
	children,
	className,
	loading,
	error,
	href,
}: PreviewTileProps) => {
	return (
		<article
			className={styles.tileWrapper}
			aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}
		>
			<Link href={href || '/dashboard'} className={styles.tileHeader}>
				<h2
					id={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}
					className={styles.tileTitle}
				>
					{title}
				</h2>
			</Link>
			<div className={styles.tileContent}>{children}</div>
		</article>
	);
};

export default PreviewTile;
