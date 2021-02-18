import { queryPubs, sortPubsByListOfIds, PubQueryOrdering } from 'server/pub/queryMany';
import { sanitizePub, SanitizedPubData } from 'server/utils/queryHelpers';
import { LayoutBlockPubs, LayoutBlock, PubSortOrder } from 'utils/layout/types';
import { InitialData, Maybe } from 'utils/types';

type BlockContent = LayoutBlockPubs['content'];

const orderingsForSort: Partial<Record<PubSortOrder, PubQueryOrdering>> = {
	'collection-rank': { field: 'collectionRank', direction: 'ASC' },
	'creation-date': { field: 'creationDate', direction: 'DESC' },
	'creation-date-reversed': { field: 'creationDate', direction: 'ASC' },
	'publish-date': { field: 'publishDate', direction: 'DESC' },
	'publish-date-reversed': { field: 'publishDate', direction: 'ASC' },
};

const getQueryOrdering = (sort: Maybe<PubSortOrder>, inCollection: boolean): PubQueryOrdering => {
	const selectedOrdering = sort && orderingsForSort[sort];
	if (selectedOrdering) {
		const { field } = selectedOrdering;
		const improperlyRankingInCollection = field === 'collectionRank' && !inCollection;
		if (!improperlyRankingInCollection) {
			return selectedOrdering;
		}
	}
	return { field: 'creationDate', direction: 'DESC' };
};

const getPubsForLayoutBlock = async (
	blockContent: BlockContent,
	initialData: InitialData,
	excludeNonPinnedPubIds: string[],
	scopedCollectionId?: string,
) => {
	const {
		communityData: { id: communityId },
	} = initialData;
	const { limit, collectionIds = [], pubIds: pinnedPubIds = [] } = blockContent;
	const options = { isPreview: true, getMembers: true, getCollections: true };

	const [pinnedPubs, otherPubs] = await Promise.all([
		queryPubs(
			{
				communityId,
				scopedCollectionId,
				withinPubIds: pinnedPubIds,
				limit,
			},
			options,
		),
		queryPubs(
			{
				communityId,
				collectionIds: collectionIds.length ? collectionIds : null,
				scopedCollectionId,
				excludePubIds: excludeNonPinnedPubIds,
				ordering: getQueryOrdering(blockContent.sort, !!scopedCollectionId),
				limit,
			},
			options,
		),
	]);

	return [...sortPubsByListOfIds(pinnedPubs, pinnedPubIds), ...otherPubs]
		.map((pub) => sanitizePub(pub.toJSON(), initialData))
		.filter((pub): pub is SanitizedPubData => !!pub)
		.slice(0, limit || Infinity);
};

type GetPubsForLayoutOptions = {
	blocks: LayoutBlock[];
	forLayoutEditor: boolean;
	initialData: InitialData;
	collectionId?: string;
};

export const getPubsForLayout = async ({
	blocks,
	initialData,
	collectionId,
}: GetPubsForLayoutOptions): Promise<Record<string, SanitizedPubData[]>> => {
	const pubBlocks = blocks.filter((block): block is LayoutBlockPubs => block.type === 'pubs');
	const pubsByBlockId: Record<string, SanitizedPubData[]> = {};
	const seenPubIds = new Set<string>();

	// eslint-disable-next-line no-restricted-syntax
	for (const block of pubBlocks) {
		// eslint-disable-next-line no-await-in-loop
		const pubsForBlock = await getPubsForLayoutBlock(
			block.content,
			initialData,
			Array.from(seenPubIds),
			collectionId,
		);
		pubsForBlock.forEach((pub) => seenPubIds.add(pub.id));
		pubsByBlockId[block.id] = pubsForBlock;
	}

	return pubsByBlockId;
};
