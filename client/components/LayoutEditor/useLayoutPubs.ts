import { useState } from 'react';

import { Pub } from 'utils/types';
import { LayoutBlock } from 'utils/layout/types';

export const useLayoutPubs = (initialPubs: Record<string, Pub[]>, layout: LayoutBlock[]) => {
	const allPubs: Pub[] = [];

	return {
		pubsByBlockId: initialPubs,
		allPubs,
	};
};
