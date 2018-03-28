import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover, PopoverInteractionKind, Position, Tooltip } from '@blueprintjs/core';
import uuidv4 from 'uuid/v4';

require('./discussionLabelsList.scss');

const propTypes = {
	labelsData: PropTypes.array.isRequired,
	permissions: PropTypes.string.isRequired,
	onLabelSelect: PropTypes.func.isRequired,
	onLabelsUpdate: PropTypes.func.isRequired,
};

class DiscussionLabelsList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isEditMode: false,
			labelsData: props.labelsData,
			isSaving: false,
		};
		this.toggleEditMode = this.toggleEditMode.bind(this);
		this.updateTitle = this.updateTitle.bind(this);
		this.updateColor = this.updateColor.bind(this);
		this.removeLabel = this.removeLabel.bind(this);
		this.togglePublicApply = this.togglePublicApply.bind(this);
		this.addLabel = this.addLabel.bind(this);
		this.handleSave = this.handleSave.bind(this);
	}
	componentWillReceiveProps(nextProps) {
		const currentLabels = JSON.stringify(this.props.labelsData);
		const nextLabels = JSON.stringify(nextProps.labelsData);
		if (nextLabels !== currentLabels) {
			this.setState({
				labelsData: nextProps.labelsData,
				isSaving: false,
				isEditMode: false,
			});
		}
	}

	toggleEditMode() {
		this.setState({ isEditMode: !this.state.isEditMode });
	}

	updateTitle(id, newTitle) {
		const newLabelsData = this.state.labelsData.map((label)=> {
			if (label.id !== id) { return label; }
			return {
				...label,
				title: newTitle,
			};
		});
		this.setState({ labelsData: newLabelsData });
	}
	updateColor(id, newColor) {
		const newLabelsData = this.state.labelsData.map((label)=> {
			if (label.id !== id) { return label; }
			return {
				...label,
				color: newColor,
			};
		});
		this.setState({ labelsData: newLabelsData });
	}
	togglePublicApply(id, newColor) {
		const newLabelsData = this.state.labelsData.map((label)=> {
			if (label.id !== id) { return label; }
			return {
				...label,
				publicApply: !label.publicApply,
			};
		});
		this.setState({ labelsData: newLabelsData });
	}
	removeLabel(id) {
		const newLabelsData = this.state.labelsData.filter((label)=> {
			return label.id !== id;
		});
		this.setState({ labelsData: newLabelsData });
	}
	addLabel() {
		const newLabelsData = [
			...this.state.labelsData,
			{
				id: uuidv4(),
				title: 'New Label',
				color: '#b71540',
				publicApply: false,
			}
		];
		this.setState({ labelsData: newLabelsData });
	}
	handleSave() {
		this.setState({ isSaving: true });
		this.props.onLabelsUpdate(this.state.labelsData);
	}
	render() {
		const showEditMode = this.state.isEditMode || !this.props.labelsData.length;
		return (
			<div className="discussion-labels-list-component pt-menu pt-elevation-1">
				{this.props.permissions === 'manage' && !showEditMode &&
					<button className="pt-button pt-icon-edit2 action-button" onClick={this.toggleEditMode} />
				}
				{this.props.permissions === 'manage' && showEditMode &&
					<Button
						className="pt-button pt-intent-primary action-button"
						onClick={this.handleSave}
						text="Save"
						loading={this.state.isSaving}
					/>
				}
				<li className="pt-menu-header"><h6>Filter by Label</h6></li>

				{/* Labels View Mode */}
				{!showEditMode && this.state.labelsData.map((label)=> {
					const handleClick = ()=> { this.props.onLabelSelect(label.id); };
					return (
						<li>
							<div key={`label-${label.id}`} className="pt-menu-item label" onClick={handleClick}>
								<div className="color" style={{ backgroundColor: label.color }} />
								<div className="title">{label.title}</div>
								<Tooltip
									content={label.publicApply
										? <span>All discussion authors can apply this label.</span>
										: <span>Only managers can apply this label.</span>
									}
									tooltipClassName="pt-dark"
									position={Position.TOP}
								>
									<span className={`pt-icon-standard pt-icon-globe ${label.publicApply ? 'active' : ''}`} />
								</Tooltip>
							</div>
						</li>
					);
				})}

				{/* Labels Edit Mode */}
				{showEditMode && this.state.labelsData.map((label)=> {
					const handleTitleChange = (evt)=> {
						this.updateTitle(label.id, evt.target.value);
					};
					const handleLabelRemove = ()=> {
						this.removeLabel(label.id);
					};
					const handlePublicApplyToggle = ()=> {
						this.togglePublicApply(label.id);
					};
					const colors = ['#eb2f06', '#b71540', '#fa983a', '#e58e26', '#38ada9', '#079992', '#009432', '#006266', '#0652DD', '#1B1464', '#833471', '#6F1E51'];
					return (
						<div key={`label-edit-${label.id}`} className="label edit">
							<Popover
								content={
									<div className="pt-menu color-select-menu">
										{colors.map((color)=> {
											return (
												<span
													key={color}
													className="color-select"
													style={{ backgroundColor: color }}
													onClick={()=> {
														this.updateColor(label.id, color);
													}}
												/>
											);
										})}
									</div>
								}
								interactionKind={PopoverInteractionKind.CLICK}
								position={Position.TOP_LEFT}
								popoverClassName="color-select-popover"
								transitionDuration={-1}
								inline={true}
								inheritDarkTheme={false}
							>
								<div className="color edit" style={{ backgroundColor: label.color }} />
							</Popover>
							<input className="pt-input" type="text" value={label.title} onChange={handleTitleChange} />
							<Tooltip
								content={label.publicApply
									? <span>All discussion authors can apply this label.</span>
									: <span>Only managers can apply this label.</span>
								}
								tooltipClassName="pt-dark"
								position={Position.TOP}
							>
								<button onClick={handlePublicApplyToggle} className={`pt-button pt-minimal pt-icon-globe ${label.publicApply ? 'active' : ''}`} />
							</Tooltip>
							<button onClick={handleLabelRemove} className="pt-button pt-icon-trash pt-minimal" />
						</div>
					);
				})}

				{showEditMode &&
					<button className="pt-button pt-fill" onClick={this.addLabel}>Add Label</button>
				}
			</div>
		);
	}
}

DiscussionLabelsList.propTypes = propTypes;
export default DiscussionLabelsList;