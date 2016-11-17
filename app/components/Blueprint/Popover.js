/* eslint react/no-did-mount-set-state: 0 */
import React, { PropTypes } from 'react';

let PopoverComponent;
export const Popover = React.createClass({
	propTypes: {
		children: PropTypes.object,
	},

	getInitialState() {
		return {
			isClient: false,
		};
	},

	componentDidMount() {
		PopoverComponent = require('@blueprintjs/core').Popover;
		this.setState({ isClient: true });
	},

	render() {
		if (this.state.isClient) { return <PopoverComponent {...this.props} />; }
		return <div>{this.props.children}</div>;
	}
});

export default Popover;
