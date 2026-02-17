import { i18n } from "@lingui/core";
import { getLocales } from "expo-localization";
import { messages as enMessages } from "./en/messages";
import { messages as svMessages } from "./sv/messages";

const messages = {
	en: enMessages,
	sv: svMessages,
};

i18n.load(messages);

const defaultLocale = getLocales()[0].languageCode;
if (defaultLocale === null || !(defaultLocale in messages)) {
	i18n.activate("en");
} else {
	i18n.activate(defaultLocale);
}
