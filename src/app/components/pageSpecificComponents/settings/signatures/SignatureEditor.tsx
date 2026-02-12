// Library imports
import { Fragment } from 'react';

// Services imports

// Hooks imports

// Styles imports
import styles from './signatureEditor.module.scss';

// Icon imports

// Components imports
import TinyEditor from '@/app/components/tinyEditor/TinyEditor';

// Context imports

const SignatureEditor = ({
	name,
	handleChange,
	setEditorContent,
	handleSave,
	handleCancel,
	initialValue,
}: {
	name: string;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	setEditorContent: (content: string) => void;
	handleSave: () => void;
	handleCancel: () => void;
	initialValue?: string;
}) => {
	return (
		<Fragment>
			<div className={styles['editor-wrapper']}>
				<div className={styles['input-group']}>
					<label htmlFor='signatureName'>Signature Name:</label>
					<input
						type='text'
						id='signatureName'
						placeholder='Enter signature name...'
						className={styles['signature-name-input']}
						value={name}
						onChange={handleChange}
						maxLength={50}
						aria-required='true'
						aria-describedby='signatureName-help'
					/>
					<span id='signatureName-help' className='sr-only'>
						Maximum 50 characters
					</span>
				</div>
				<TinyEditor
					height={200}
					width={800}
					placeholder='Compose your new signature here...'
					maxLength={500}
					initialValue={initialValue ?? ''}
					setEditorContent={setEditorContent}
					editorId='signature-editor'
					aria-label='Signature content editor'
				/>
			</div>
			<div className={styles['new-signature-actions']}>
				<button
					type='button'
					className={'button signature-save'}
					onClick={handleSave}
					aria-label={
						initialValue ? 'Save signature changes' : 'Save new signature'
					}
				>
					Save Signature
				</button>
				<button
					type='button'
					className={'button settings-button'}
					onClick={handleCancel}
				>
					Cancel
				</button>
			</div>
		</Fragment>
	);
};

export default SignatureEditor;
