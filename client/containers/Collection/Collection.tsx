import React from 'react';

import { Layout } from 'components';
import { Pub, Collection as CollectionType } from 'utils/types';

type Props = {
	pubsByBlockId: Record<string, Pub[]>;
	collection: CollectionType;
};

const Collection = (props: Props) => {
	const { pubsByBlockId, collection } = props;
	if (collection.layout) {
		const { blocks, isNarrow } = collection.layout;
		return (
			<Layout
				blocks={blocks}
				isNarrow={isNarrow}
				pubsByBlockId={pubsByBlockId}
				collection={collection}
			/>
		);
	}
	return null;
};

export default Collection;
