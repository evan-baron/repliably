// Library imports
import React from 'react';

// Services imports

// Hooks imports

// Styles imports
import styles from './masterTable.module.scss';

// MUI imports
import { SwapVert } from '@mui/icons-material';

// Components imports

// Context imports

const TableHeader = ({
	columnHeaders,
	handleSort,
}: {
	columnHeaders: any[];
	handleSort: (type: string) => void;
}) => {
	return (
		<thead className={styles.tableHeader}>
			<tr className={styles.headerRow} role='row'>
				{columnHeaders.map((header, index) => (
					<th
						key={index}
						className={`
							${styles[header.size]} 
							${header.sortable ? styles.sort : ''}`}
						onClick={() => {
							if (header.sortable) {
								handleSort(header.label);
							}
						}}
						role='columnheader'
						aria-sort={header.sortable ? 'none' : undefined}
						scope='col'
						tabIndex={header.sortable ? 0 : undefined}
						onKeyDown={
							header.sortable ?
								(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handleSort(header.label);
									}
								}
							:	undefined
						}
					>
						{header.sortable ?
							<button
								type='button'
								className={styles.sort}
								aria-label={`Sort by ${header.label}`}
							>
								<span>{header.label}</span>
								<SwapVert
									fontSize='small'
									aria-hidden='true'
									focusable='false'
								/>
							</button>
						:	header.label}
					</th>
				))}
			</tr>
		</thead>
	);
};

export default TableHeader;
