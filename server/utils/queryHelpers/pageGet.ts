import { Page } from 'server/models';

import { enrichLayoutBlocksWithPubTokens, getPubsForLayout } from '../layouts';

export default async ({ query, forLayoutEditor, initialData }) => {
	const pageData = await Page.findOne({
		where: {
			...query,
			communityId: initialData.communityData.id,
		},
	});

	const pubsByBlockId = await getPubsForLayout({
		blocks: pageData.layout || [],
		forLayoutEditor,
		initialData,
	});

	return {
		...pageData.toJSON(),
		layout: enrichLayoutBlocksWithPubTokens({
			blocks: pageData.layout,
			initialData,
		} as any),
		pubsByBlockId,
	};
};
