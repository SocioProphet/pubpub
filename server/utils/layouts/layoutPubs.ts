import { Op } from 'sequelize';

import { CollectionPub, Pub } from 'server/models';
import { buildPubOptions, sanitizePub, SanitizedPubData } from 'server/utils/queryHelpers';
import { LayoutBlockPubs, LayoutBlock } from 'utils/layout/types';
import { InitialData } from 'utils/types';

const getPubIdsForCollectionIds = async (collectionIds: string[]) => {
	if (collectionIds && collectionIds.length > 0) {
		const collectionPubs = await CollectionPub.findAll({
			where: {
				collectionId: { [Op.in]: collectionIds },
			},
		});
		return collectionPubs.map((collectionPub) => collectionPub.pubId);
	}
	return null;
};

const getPubIdQueryForPinnedPubs = (pinnedPubIds: string[], scopedPubIds: null | string[]) => {
	if (scopedPubIds) {
		return { [Op.in]: pinnedPubIds.filter((id) => scopedPubIds.includes(id)) };
	}
	return { [Op.in]: pinnedPubIds };
};

const getPubIdQueryForNonPinnedPubs = async (
	collectionIds: string[],
	scopedPubIds: null | string[],
) => {
	const matchingPubIds = await getPubIdsForCollectionIds(collectionIds);
	if (matchingPubIds) {
		const filteredPubIds = scopedPubIds
			? matchingPubIds.filter((id) => scopedPubIds.includes(id))
			: matchingPubIds;
		return { [Op.in]: filteredPubIds };
	}
	if (scopedPubIds) {
		return { [Op.in]: scopedPubIds };
	}
	return {};
};

const getPubsForLayoutBlock = async (
	blockContent: LayoutBlockPubs['content'],
	initialData: InitialData,
	scopedPubIds: null | string[] = null,
	excludeNonPinnedPubIds: null | Set<string> = null,
) => {
	const {
		communityData: { id: communityId },
	} = initialData;
	const { limit, collectionIds = [], pubIds: pinnedPubIds = [] } = blockContent;

	const sharedOptions = {
		...buildPubOptions({
			isPreview: true,
			getMembers: true,
			getCollections: true,
		}),
		...(limit && { limit }),
		order: [['createdAt', 'DESC']],
	};

	const limitedPinnedPubIds = limit ? pinnedPubIds.slice(0, limit) : pinnedPubIds;
	const [pinnedPubs, otherPubs] = await Promise.all([
		Pub.findAll({
			where: {
				communityId,
				id: getPubIdQueryForPinnedPubs(limitedPinnedPubIds, scopedPubIds),
			},
			...sharedOptions,
		}),
		Pub.findAll({
			where: {
				communityId,
				id: {
					[Op.notIn]: [...limitedPinnedPubIds, ...(excludeNonPinnedPubIds || [])],
					...(await getPubIdQueryForNonPinnedPubs(collectionIds, scopedPubIds)),
				},
			},
			...sharedOptions,
		}),
	]);

	const sanitizedPubs = [...pinnedPubs, ...otherPubs]
		.map((pub) => sanitizePub(pub.toJSON(), initialData))
		.filter((pub): pub is SanitizedPubData => !!pub);
	const limitedPubs = limit ? sanitizedPubs.slice(0, limit) : sanitizedPubs;
	return limitedPubs;
};

type GetPubsForLayoutOptions = {
	blocks: LayoutBlock[];
	forLayoutEditor: boolean;
	initialData: InitialData;
	collectionId?: string;
};

export const getPubsForLayout = async ({
	blocks,
	forLayoutEditor,
	initialData,
	collectionId,
}: GetPubsForLayoutOptions): Promise<SanitizedPubData[][]> => {
	const scopedPubIds = collectionId && (await getPubIdsForCollectionIds([collectionId]));

	if (forLayoutEditor || scopedPubIds) {
		const collectionWhere = scopedPubIds && { id: { [Op.in]: scopedPubIds } };
		const pubs = await Pub.findAll({
			where: { communityId: initialData.communityData.id, ...collectionWhere },
			...buildPubOptions({ isPreview: true, getMembers: true, getCollections: true }),
		});
		return pubs.map((pub) => sanitizePub(pub.toJSON(), initialData)).filter((pub) => !!pub);
	}

	const pubBlocks = blocks.filter((block): block is LayoutBlockPubs => block.type === 'pubs');
	const pubs: SanitizedPubData[][] = [];
	const seenPubIds = new Set<string>();

	// eslint-disable-next-line no-restricted-syntax
	for (const block of pubBlocks) {
		// eslint-disable-next-line no-await-in-loop
		const pubsForBlock = await getPubsForLayoutBlock(
			block.content,
			initialData,
			scopedPubIds,
			seenPubIds,
		);
		pubsForBlock.forEach((pub) => seenPubIds.add(pub.id));
		pubs.push(pubsForBlock);
	}

	return pubs;
};
