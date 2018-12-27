import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@blueprintjs/core';
import { renderLatexString } from 'utilities';
import Icon from 'components/Icon/Icon';

const propTypes = {
	attrs: PropTypes.object.isRequired,
	updateAttrs: PropTypes.func.isRequired,
	changeNode: PropTypes.func.isRequired,
	selectedNode: PropTypes.object.isRequired,
	editorChangeObject: PropTypes.object.isRequired,
	isSmall: PropTypes.bool.isRequired,
};

class FormattingBarControlsEquation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.attrs.value,
		};
		this.handleValueChange = this.handleValueChange.bind(this);
		this.handleHTMLChange = this.handleHTMLChange.bind(this);
		this.changeToInline = this.changeToInline.bind(this);
		this.changeToBlock = this.changeToBlock.bind(this);
	}

	handleValueChange(evt) {
		this.setState({ value: evt.target.value });
		const isBlock = this.props.selectedNode.type.name === 'block_equation';
		renderLatexString(evt.target.value, isBlock, this.handleHTMLChange);
	}

	handleHTMLChange(html) {
		this.props.updateAttrs({ value: this.state.value, html: html });
	}

	changeToInline() {
		const isBlock = this.props.selectedNode.type.name === 'block_equation';
		if (isBlock) {
			const nodeType = this.props.editorChangeObject.view.state.schema.nodes.equation;
			renderLatexString(this.state.value, false, (newHtml)=> {
				this.props.changeNode(nodeType, {
					value: this.props.attrs.value,
					html: newHtml,
				}, null);
			});
		}
	}

	changeToBlock() {
		const isBlock = this.props.selectedNode.type.name === 'block_equation';
		if (!isBlock) {
			const nodeType = this.props.editorChangeObject.view.state.schema.nodes.block_equation;
			renderLatexString(this.state.value, true, (newHtml)=> {
				this.props.changeNode(nodeType, {
					value: this.props.attrs.value,
					html: newHtml,
				}, null);
			});
		}
	}

	render() {
		// <div>TODO: Not all of these are equations. Rename it to 'math'</div>
		const isBlock = this.props.selectedNode.type.name === 'block_equation';
		const iconSize = this.props.isSmall ? 12 : 16;

		return (
			<div className={`formatting-bar-controls-component ${this.props.isSmall ? 'small' : ''}`}>
				{/*  LaTex Adjustment */}
				<div className="block">
					<div className="label">LaTeX</div>
					<div className="input wide">
						<textarea
							placeholder="Enter LaTeX math"
							className="bp3-input bp3-fill"
							value={this.props.attrs.value}
							onChange={this.handleValueChange}
						/>
					</div>
				</div>

				{/*  Display Adjustment */}
				<div className="block">
					<div className="label">Display</div>
					<div className="input">
						<Button
							onClick={this.changeToInline}
							text="Inline"
							icon={<Icon icon="align-left" iconSize={iconSize} />}
							active={!isBlock}
						/>
						<Button
							onClick={this.changeToBlock}
							text="Block"
							icon={<Icon icon="align-justify" iconSize={iconSize} />}
							active={isBlock}
						/>
					</div>
				</div>
			</div>
		);
	}
}


FormattingBarControlsEquation.propTypes = propTypes;
export default FormattingBarControlsEquation;
