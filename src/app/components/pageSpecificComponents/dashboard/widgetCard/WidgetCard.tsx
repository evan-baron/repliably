import React from 'react';
import Link from 'next/link';
import styles from './widgetCard.module.scss';

interface WidgetCardProps {
	statNumber: string | number;
	statLabel: string;
	headerIcon: React.ReactNode;
	headerGradient?: string;
	footerLabel: string;
	footerHref: string;
	children: React.ReactNode;
	headerLabel: string;
}

const WidgetCard = ({
	statNumber,
	statLabel,
	headerIcon,
	headerGradient,
	footerLabel,
	footerHref,
	children,
	headerLabel,
}: WidgetCardProps) => {
	return (
		<div className={styles['widgetCard-container']}>
			<h3 className={styles.headerLabel}>{headerLabel}</h3>
			<section className={styles.widgetCard}>
				<div
					className={styles.widgetHeader}
					style={headerGradient ? { background: headerGradient } : undefined}
				>
					<div className={styles.headerContent}>
						<span className={styles.statNumber}>{statNumber}</span>
						<span className={styles.statLabel}>{statLabel}</span>
					</div>
					<span className={styles.headerIcon}>{headerIcon}</span>
				</div>
				<div className={styles.widgetBody}>{children}</div>
			</section>
			<div className={styles.widgetFooter}>
				<Link href={footerHref}>{footerLabel} &rarr;</Link>
			</div>
		</div>
	);
};

export default WidgetCard;
