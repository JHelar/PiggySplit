export type SelectValue = {
	label: string;
};

export type SelectProps<Value extends SelectValue> = {
	values: SelectValue[];
	selectedIndex: number;
};
