import { LayoutPubsByBlock } from './types';

export const resolveLayoutPubsByBlock = <T extends { id: string }>(
	layout: LayoutPubsByBlock<T>,
): Record<string, T[]> => {
	const { pubIdsByBlockId, pubsById } = layout;
	const resolved: Record<string, T[]> = {};
	Object.entries(pubIdsByBlockId).forEach(([blockId, pubIds]) => {
		const pubsForBlock = pubIds.map((id) => pubsById[id]).filter((x): x is T => !!x);
		resolved[blockId] = pubsForBlock;
	});
	return resolved;
};
