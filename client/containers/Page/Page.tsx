import React from 'react';

import { Layout } from 'components';
import { Pub } from 'utils/types';
import { LayoutBlock } from 'utils/layout/types';
import { getDefaultLayout } from 'utils/pages';

type Props = {
	pageData: {
		pubsByBlockId: Record<string, Pub[]>;
		isNarrow: boolean;
		isNarrowWidth: boolean;
		layout: LayoutBlock[];
	};
};

const Page = (props: Props) => {
	const { pageData } = props;
	const blocks = pageData.layout || getDefaultLayout();
	return (
		<Layout
			blocks={blocks}
			isNarrow={pageData.isNarrow || pageData.isNarrowWidth}
			pubsByBlockId={pageData.pubsByBlockId}
		/>
	);
};

export default Page;
