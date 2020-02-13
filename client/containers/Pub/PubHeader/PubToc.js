/* eslint-disable no-multi-assign */
import React from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem } from 'components/Menu';

require('./pubToc.scss');

const propTypes = {
	children: PropTypes.node.isRequired,
	pubData: PropTypes.shape({
		canEditBranch: PropTypes.bool,
	}).isRequired,
	headings: PropTypes.arrayOf(
		PropTypes.shape({
			title: PropTypes.string,
			index: PropTypes.any,
			href: PropTypes.string,
		}),
	).isRequired,
	onSelect: PropTypes.func,
};

const defaultProps = {
	onSelect: null,
};

const PubToc = function(props) {
	const { headings, children, pubData, onSelect } = props;
	return (
		<Menu
			aria-label="Table of contents"
			className="pub-toc-component"
			disclosure={children}
			placement="bottom-end"
		>
			{headings.map((heading) => {
				return (
					<MenuItem
						key={heading.index}
						href={`#${heading.href}`}
						className={`level-${heading.level}`}
						onClick={(evt) => {
							/* If editing, don't use anchor tags for nav since we have */
							/* a fixed header bar. Plus, the URL with an anchor tag will behave */
							/* unexpectedly on reload given the async loading of doc. Instead, */
							/* manually scroll to the position and offset by fixed header height. */
							if (onSelect) {
								onSelect();
							}
							if (pubData.canEditBranch) {
								evt.preventDefault();
								document.getElementById(heading.href).scrollIntoView();
								const currentTop =
									document.body.scrollTop || document.documentElement.scrollTop;
								document.body.scrollTop = document.documentElement.scrollTop =
									currentTop - 75;
							}
						}}
						text={heading.title}
					/>
				);
			})}
		</Menu>
	);
};

PubToc.propTypes = propTypes;
PubToc.defaultProps = defaultProps;
export default PubToc;
