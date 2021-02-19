export const intersperse = <P, Q>(
	arr: P[],
	val: Exclude<Q, Function> | ((i: number) => Exclude<Q, Function>),
) => {
	const res: (P | Q)[] = [];
	arr.forEach((el, index) => {
		res.push(el);
		if (index !== arr.length - 1) {
			const resolvedVal = val instanceof Function ? val(index) : val;
			res.push(resolvedVal);
		}
	});
	return res;
};

export const indexByProperty = <T extends { [key: string]: any }>(
	array: T[],
	property: keyof T,
) => {
	const res: Record<string, T> = {};
	array.forEach((el) => {
		res[el[property]] = el;
	});
	return res;
};

export const unique = <T, Q>(array: T[], fn: (t: T, s: Symbol) => Q | Symbol) => {
	const uniqueSymbol = Symbol('unique');
	const res: T[] = [];
	const seenValues = new Set<Q | Symbol>();
	array.forEach((el) => {
		const value = fn(el, uniqueSymbol);
		if (!seenValues.has(value) || value === uniqueSymbol) {
			seenValues.add(value);
			res.push(el);
		}
	});
	return res;
};

export const arraysAreEqual = <T>(
	first: T[],
	second: T[],
	eq: null | ((a: T, b: T) => boolean) = null,
) => {
	if (first.length !== second.length) {
		return false;
	}
	for (let i = 0; i < first.length; i++) {
		const fi = first[i];
		const si = second[i];
		const elementsEqual = eq ? eq(fi, si) : fi === si;
		if (!elementsEqual) {
			return false;
		}
	}
	return true;
};

export const arraysHaveSameElements = <T>(first: T[], second: T[]) => {
	return first.every((el) => second.includes(el)) && second.every((el) => first.includes(el));
};

export const pruneFalsyValues = (arr) => arr.filter(Boolean);
