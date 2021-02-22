import React from 'react';

import { usePopoverState, PopoverDisclosure, Popover, PopoverInitialState } from 'reakit';
import { Card } from '@blueprintjs/core';

type Props = {
	'aria-label': string;
	className?: string;
	children: React.ReactElement;
	component: React.ComponentType<any>;
	portal?: boolean;
	placement?: PopoverInitialState['placement'];
	gutter?: number;
	style?: React.CSSProperties;
	[key: string]: any;
};

const PopoverButton = (props: Props) => {
	const {
		component: Component,
		'aria-label': ariaLabel,
		children,
		className,
		portal = true,
		gutter = 5,
		placement = 'bottom-end',
		style = {},
		...restProps
	} = props;
	const popover = usePopoverState({ unstable_fixed: false, placement, gutter });
	return (
		<>
			<PopoverDisclosure {...popover} {...children.props}>
				{(disclosureProps) => React.cloneElement(children, disclosureProps)}
			</PopoverDisclosure>
			<Popover
				aria-label={ariaLabel}
				className={className}
				unstable_portal={portal}
				tabIndex={0}
				style={style}
				{...popover}
			>
				<Card elevation={2}>
					<Component {...restProps} />
				</Card>
			</Popover>
		</>
	);
};
export default PopoverButton;
