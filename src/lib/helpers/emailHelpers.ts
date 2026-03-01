export const parseEmailContent = (htmlString: string): string[] => {
	// Extract content from <div> or <p> tags using regex
	const pTagRegex = /<(?:div|p)[^>]*>(.*?)<\/(?:div|p)>/gi;
	const matches = htmlString.matchAll(pTagRegex);

	const textArray = Array.from(matches).map((match) => {
		// Get the content inside <p> tags
		let text = match[1];

		// Remove HTML tags (like <strong>, <em>, etc.)
		text = text.replace(/<[^>]+>/g, '');

		// Decode common HTML entities
		text = text
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'");

		// Trim and normalize whitespace
		return text.trim().replace(/\s+/g, ' ');
	});
	// .filter((text) => text.length > 0);

	return textArray;
};

export const parseReplyContent = (replyContent: string) => {
	if (!replyContent) return [];

	const normalized = replyContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

	const lines = normalized.split('\n');

	const result = lines.map((line) => line.trim()).filter(Boolean);

	return result;
};

export const parseTinyMceContent = (htmlString: string): string => {
	const htmlContent = htmlString
		.replace(/<p>/g, '<div>')
		.replace(/<\/p>/g, '</div>')
		.replace(/&nbsp;/g, '<br>'); // Replace <p> tags with <div> tags to preserve line breaks, and replace &nbsp; with <br> for new lines

	const trimmedHtml = htmlContent.trim().replace(/(<div><br><\/div>\s*)+$/, '');

	return trimmedHtml;
};
