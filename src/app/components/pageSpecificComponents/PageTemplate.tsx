// Styles imports
import styles from './pageTemplate.module.scss';

const PageTemplate = async ({
	children,
	title,
	description,
}: {
	children: React.ReactNode;
	title: string;
	description: string;
}) => {
	return (
		<div className={styles['page-wrapper']}>
			<header className={styles['header-section']}>
				<h1 className={styles.welcomeTitle}>{title}</h1>
				<p className={styles.welcomeSubtitle}>{description}</p>
			</header>
			<section className={styles['page-content']}>{children}</section>
		</div>
	);
};

export default PageTemplate;
