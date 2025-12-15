'use client';

import { $getRoot, $getSelection } from 'lexical';
import { useEffect } from 'react';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import styles from './richTextEditor.module.scss';

const theme = {
	// Theme styling goes here
	//...
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
	console.error(error);
}

function RichTextEditor() {
	const initialConfig = {
		namespace: 'MyEditor',
		theme,
		onError,
	};

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<RichTextPlugin
				contentEditable={
					<ContentEditable
						className={styles.contentEditable}
						aria-placeholder={'Enter some text...'}
						placeholder={
							<div className={styles.placeholder}>Enter some text...</div>
						}
					/>
				}
				ErrorBoundary={LexicalErrorBoundary}
			/>
			<HistoryPlugin />
			<AutoFocusPlugin />
		</LexicalComposer>
	);
}

export default RichTextEditor;
