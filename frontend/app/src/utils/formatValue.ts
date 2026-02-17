import { i18n } from "@lingui/core";

type FormatCurrencyOptions = {
	currencyCode: string;
};

export function formatCurrency(value: number, options: FormatCurrencyOptions) {
	return Intl.NumberFormat(i18n.locale, {
		style: "currency",
		currencyDisplay: "narrowSymbol",
		currency: options.currencyCode,
		maximumFractionDigits: 1,
		minimumFractionDigits: 0,
		currencySign: "standard",
	}).format(value);
}
