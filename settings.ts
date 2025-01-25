/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    totalSecondsBeforeDeletingMessage: {
        type: OptionType.NUMBER,
        description: "After this much time in seconds passes a message is deleted",
        default: 30,
    },

    sleepBetweenConsecutiveDelete: {
        type: OptionType.NUMBER,
        description: "When one message is deleted, this is the delay in ms before the next deletion begins",
        default: 1000,
    },
    sleepBetweenCheckingDeletes: {
        type: OptionType.NUMBER,
        description: "How often, in ms, scheduled messages are parsed for deletion",
        default: 5000,
    },

    showChatBarButton: {
        type: OptionType.BOOLEAN,
        description: "Show translate button in chat bar",
        default: true
    },
    service: {
        type: OptionType.SELECT,
        description: IS_WEB ? "Translation service (Not supported on Web!)" : "Translation service",
        disabled: () => IS_WEB,
        options: [
            { label: "Google Translate", value: "google", default: true },
            { label: "DeepL Free", value: "deepl" },
            { label: "DeepL Pro", value: "deepl-pro" }
        ] as const,
    },
    showAutoTranslateTooltip: {
        type: OptionType.BOOLEAN,
        description: "Show a tooltip on the ChatBar button whenever a message is automatically translated",
        default: true
    },
}).withPrivateSettings<{
    showAutoTranslateAlert: boolean;
}>();

