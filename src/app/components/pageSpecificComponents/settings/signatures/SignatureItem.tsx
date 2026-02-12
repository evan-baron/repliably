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
		<li
			className={styles['signature-item']}
			aria-labelledby={`signature-${id}-name`}
		>
			<div className={styles['signature-info']}>
				<div className={styles.name}>
					{isDefault && (
						<span className={styles.default} aria-label='Default signature'>
							Default
						</span>
					)}
					<h4 id={`signature-${id}-name`}>{name}</h4>
				</div>

				<pre
					className={styles.preview}
					aria-label={`Signature preview for ${name}`}
				>
					{parsedSignature.map((line, index) => (
						<span key={`parse-${index}`}>{line || '\u00A0'}</span>
					))}
				</pre>
			</div>
			<div
				className={styles['signature-actions']}
				role='group'
				aria-label={`Actions for ${name} signature`}
			>
				<button
					type='button'
					className={styles['mini-button']}
					onClick={() => handleEdit(id)}
					aria-label={`Edit ${name} signature`}
				>
					Edit
				</button>

				<button
					type='button'
					className={`${styles['mini-button']} ${styles['default-button']}`}
					onClick={() => handleChangeDefault(id, !isDefault)}
					aria-label={
						isDefault ?
							`Remove ${name} as default signature`
						:	`Set ${name} as default signature`
					}
				>
					{!isDefault ? 'Set Default' : 'Remove Default'}
				</button>

				<button
					type='button'
					className={styles['mini-button']}
					onClick={() => handleDeleteSignature(id)}
					aria-label={`Delete ${name} signature`}
				>
					Delete
				</button>
			</div>
		</li>
	);
};

export default SignatureItem;
