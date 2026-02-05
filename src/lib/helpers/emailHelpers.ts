export const parseEmailContent = (htmlString: string): string[] => {
	// Extract content from <p> tags using regex
	const pTagRegex = /<p[^>]*>(.*?)<\/p>/gi;
	const matches = htmlString.matchAll(pTagRegex);

	const textArray = Array.from(matches)
		.map((match) => {
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
		})
		.filter((text) => text.length > 0);

	return textArray;
};

export const parseReplyContent = (replyContent: string) => {
	if (!replyContent) return [];

	const normalized = replyContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

	const lines = normalized.split('\n');

	const result = lines.map((line) => line.trim()).filter(Boolean);

	return result;
};
