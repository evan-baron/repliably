// Library imports

// Styles imports
import styles from './tableStyles.module.scss';

// Types imports
import {
	MessagesWithActiveSequence,
	MessageWithContact,
} from '@/types/messageTypes';
import { MasterTableData, CellData } from '@/types/masterTableTypes';

// Components
import MasterTable from '../masterTable/MasterTable';

// Helper functions imports

const AllActivities = ({
	multiPage = false,
	messages,
	parentDiv,
}: {
	multiPage?: boolean;
	messages: MessagesWithActiveSequence[] | MessageWithContact[];
	parentDiv?: string;
}) => {
	const columnHeaders =
		parentDiv === 'DashboardClient' ?
			[
				{ label: 'Contact', size: 'sm' },
				{ label: 'Type', size: 'sm' },
				{ label: 'Email', size: 'lrg' },
				{ label: 'Send Date', size: 'sm' },
				{ label: 'Replied', size: 'sm' },
			]
		:	[
				{ label: 'Type', size: 'sm' },
				{ label: 'Status', size: 'sm' },
				{ label: 'Email', size: 'lrg' },
				{ label: 'Send Date', size: 'sm', sortable: true },
				{ label: 'Replied', size: 'sm' },
			];

	const tableData: MasterTableData = {
		columnHeaders,
		rowData: messages.map((message) => {
			const messageStatus =
				(
					message.status === 'pending' ||
					(message.status === 'scheduled' &&
						message.needsApproval &&
						!message.approved)
				) ?
					'Pending Approval'
				:	message.status[0].toUpperCase() + message.status.slice(1);
			const sendDate =
				message.status === 'cancelled' ? 'N/A'
				: message.sentAt ? message.sentAt
				: `Scheduled for ${new Date(
						message.scheduledAt!,
					).toLocaleDateString()}`;

			const { contact } = message as MessageWithContact;
			const contactName =
				contact && contact.firstName && contact.lastName ?
					`${contact.firstName} ${contact.lastName}`
				:	'Unknown';

			const cellData: CellData[] =
				parentDiv === 'DashboardClient' ?
					[
						{
							value: contactName,
							size: columnHeaders[0].size,
							isLink: true,
							href: `/dashboard/contacts/${contact?.id}`,
							cellStyling: 'link',
						},
						{
							value:
								message.sequenceId ? 'Sequence Email' : 'Stand-alone Email',
							size: columnHeaders[1].size,
						},
						{
							value: '<div>' + message.subject + '</div>' + message.contents,
							size: columnHeaders[2].size,
							contentCell: true,
							subjectContentCell: true,
						},
						{
							value: sendDate,
							size: columnHeaders[3].size,
							cellOrientation: 'right',
							cellStyling:
								message.status === 'pending' || message.status === 'scheduled' ?
									'italic'
								:	null,
							isDate: message.status !== 'cancelled' ? true : false,
						},
						{
							value:
								message.hasReply ? 'Yes'
								: message.status === 'sent' ? 'No'
								: 'N/A',
							size: columnHeaders[4].size,
							cellOrientation: 'right',
							cellStyling:
								message.status === 'scheduled' || message.status === 'pending' ?
									'transparent'
								:	null,
						},
					]
				:	[
						{
							value:
								message.sequenceId ? 'Sequence Email' : 'Stand-alone Email',
							size: columnHeaders[0].size,
						},
						{
							value: messageStatus,
							size: columnHeaders[1].size,
							cellStyling:
								message.status === 'pending' ? 'pending'
								: message.status === 'scheduled' ? 'scheduled'
								: null,
						},
						{
							value: '<div>' + message.subject + '</div>' + message.contents,
							size: columnHeaders[2].size,
							contentCell: true,
							subjectContentCell: true,
						},
						{
							value: sendDate,
							size: columnHeaders[3].size,
							cellOrientation: 'right',
							cellStyling:
								message.status === 'pending' || message.status === 'scheduled' ?
									'italic'
								:	null,
							isDate: message.status !== 'cancelled' ? true : false,
						},
						{
							value:
								message.hasReply ? 'Yes'
								: message.status === 'sent' ? 'No'
								: 'N/A',
							size: columnHeaders[4].size,
							cellOrientation: 'right',
							cellStyling:
								message.status === 'scheduled' || message.status === 'pending' ?
									'transparent'
								:	null,
						},
					];

			return {
				rowId: message.id,
				cellData: cellData,
				rowStyling: message.status === 'cancelled' ? 'cancelled' : null,
			};
		}),
	};

	return (
		<MasterTable
			multiPage={multiPage}
			parentDiv={parentDiv}
			tableData={tableData}
			tableType='allActivities'
			tableSize={columnHeaders.length}
		/>
	);
};

export default AllActivities;
