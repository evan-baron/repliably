'use client';

// Library imports
import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';

// Hooks imports

// Styles imports
import styles from './tinyEditor.module.scss';

// Components imports

// Context imports

const TinyEditor = ({
	setEditorContent,
}: {
	setEditorContent: (content: string) => void;
}) => {
	const editorRef = useRef<TinyMCEEditor | null>(null);

	const handleEditorChange = (content: string) => {
		setEditorContent(content);
	};

	return (
		<div className={styles.editorContainer}>
			<Editor
				id='tiny-editor'
				apiKey='smh31v60fpm15ps7kl66wjz9tj2hiw8z2mha2fk414vegawf'
				onInit={(_evt, editor) => (editorRef.current = editor)}
				onEditorChange={handleEditorChange}
				initialValue='<p></p>'
				init={{
					height: 500,
					menubar: false,
					plugins: [
						'advlist',
						'autolink',
						'lists',
						'link',
						'image',
						'charmap',
						'preview',
						'anchor',
						'searchreplace',
						'visualblocks',
						'code',
						'fullscreen',
						'insertdatetime',
						'media',
						'table',
						'code',
					],
					placeholder: 'Compose your email here...',
					toolbar:
						'undo redo | blocks | ' +
						'bold italic forecolor | alignleft aligncenter ' +
						'alignright alignjustify | bullist numlist outdent indent | ' +
						'removeformat ',
					toolbar_location: 'bottom',
					content_style:
						'body { font-family:Calibri,Arial,sans-serif; font-size:16px; margin:.75rem;}',
					// 'p { margin: 0; padding: 0; }' +
					// 'div { margin: 0; padding: 0; }',
					statusbar: false,
				}}
			/>
		</div>
	);
};

export default TinyEditor;
