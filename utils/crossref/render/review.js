/**
 * Renders a peer review of another work.
 */
import peerReview from '../schema/peerReview';

import transformCommunity from '../transform/community';
import transformPub from '../transform/pub';

export default ({ globals, community, pub }) => {
	const communityProps = transformCommunity({ globals: globals })(community);
	const pubProps = pub && transformPub({ globals: globals, community: community })(pub);
	return peerReview({
		...communityProps,
		timestamp: globals.timestamp,
		...pubProps,
	});
};
