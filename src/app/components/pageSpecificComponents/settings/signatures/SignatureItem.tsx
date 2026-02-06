// Library imports
import React from 'react';

// Services imports

// Hooks imports

// Helpers imports

// Styles imports
import styles from './signatureItem.module.scss';

// Icon imports

// Components imports

// Context imports

const SignatureItem = ({
	parsedSignature,
	isDefault,
	name,
	id,
	handleEdit,
	handleChangeDefault,
	handleDeleteSignature,
}: {
	parsedSignature: string[];
	isDefault: boolean;
	name: string;
	id: number;
	handleEdit: (id: number) => void;
	handleChangeDefault: (id: number, isDefault: boolean) => void;
	handleDeleteSignature: (id: number) => void;
}) => {
	return (
		<div className={styles['signature-item']}>
			<div className={styles['signature-info']}>
				<div className={styles.name}>
					{isDefault && <span className={styles.default}>Default</span>}
					<h4>{name}</h4>
				</div>

				<pre className={styles.preview}>
					{parsedSignature.map((line, index) => (
						<span key={`parse-${index}`}>{line}</span>
					))}
				</pre>
			</div>
			<div className={styles['signature-actions']}>
				<button
					className={styles['mini-button']}
					onClick={() => handleEdit(id)}
				>
					Edit
				</button>

				<button
					className={`${styles['mini-button']} ${styles['default-button']}`}
					onClick={() => handleChangeDefault(id, !isDefault)}
				>
					{!isDefault ? 'Set Default' : 'Remove Default'}
				</button>

				<button
					className={styles['mini-button']}
					onClick={() => handleDeleteSignature(id)}
				>
					Delete
				</button>
			</div>
		</div>
	);
};

export default SignatureItem;
