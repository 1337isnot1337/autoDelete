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

import { ChatBarButton } from "@api/ChatButtons";
import { classNameFactory } from "@api/Styles";
import { classes } from "@utils/misc";
import { useEffect, useState } from "@webpack/common";

import { addChannelToList, getNameForToolTip } from "./index";
import { settings } from "./settings";

const cl = classNameFactory("vc-trans-");
export function DeleteIcon({ height = 24, width = 24, className }: { height?: number; width?: number; className?: string; }) {
    return (
        <svg
            viewBox="0 -9.5 152 152"
            height={height}
            width={width}
            className={classes(cl("icon"), className)}
        >
            <g clipPath="url(#clip0)">
                <path
                    d="M119.284 24.01L134.521 10.4237C133.909 9.40573 133.224 8.38913 132.67 7.31142C132.164 6.32299 131.47 5.26374 131.463 4.23132C131.455 3.14902 131.875 1.5633 132.644 1.11371C133.441 0.647714 134.919 1.15177 136.024 1.48322C136.595 1.65453 137.013 2.36073 137.48 2.84445C141.067 6.55867 144.696 10.2341 148.206 14.0192C149.398 15.3466 150.44 16.8009 151.314 18.3558C152.278 20.0137 151.831 21.6662 150.518 22.9605C149.237 24.222 147.62 24.0934 146.111 23.4436C144.998 22.8604 143.927 22.2011 142.904 21.4706L127.777 33.8242C129.67 35.9507 131.136 37.7858 132.797 39.4254C136.346 42.9315 135.571 47.6139 132.12 50.4828C114.858 64.8369 97.8199 79.4622 80.6252 93.8991C77.7806 96.2678 74.7372 98.3878 71.5297 100.237C67.7951 102.403 65.8143 101.828 63.1246 98.4488C61.9432 96.9661 60.8334 95.4296 59.5411 93.7232C56.8501 95.3049 54.3429 96.9957 51.6447 98.288C49.8916 99.1274 47.8563 99.3736 45.9549 99.9124C45.23 100.05 44.5308 100.299 43.8828 100.652C31.8109 108.896 20.5972 118.221 9.67443 127.91C8.5899 128.886 7.44022 129.788 6.23332 130.609C4.40214 131.832 2.86438 131.809 1.97242 130.706C1.08045 129.604 1.32189 127.955 2.87873 126.572C11.0173 119.341 19.1395 112.087 27.3969 104.993C31.7287 101.27 36.3297 97.8587 41.1091 94.0684C40.4942 91.1063 42.3725 89.1636 45.0084 87.4597C47.3344 85.9561 49.4282 84.0927 51.753 82.2891C50.6044 80.5465 49.6165 79.073 48.6517 77.5805C46.2823 73.9228 46.4203 72.0515 49.6869 69.0632C53.6617 65.4269 57.7381 61.8978 61.8533 58.4205C76.1739 46.3225 90.5123 34.2459 104.869 22.1907C105.985 21.2509 107.022 20.2184 108.127 19.266C110.846 16.9229 112.546 16.9177 115.137 19.4229C116.577 20.8084 117.836 22.3895 119.284 24.01ZM69.0139 95.5123C82.0199 85.8392 93.6968 74.7648 105.992 64.5953C100.523 56.695 95.2622 49.0953 89.8356 41.2547L52.1475 72.9488L69.0139 95.5123ZM95.4112 36.6577L113.145 58.5577L128.232 44.8034C122.784 37.5784 117.612 30.7158 112.185 23.5158L95.4112 36.6577ZM54.1971 86.0263C48.8066 90.1087 47.6337 91.3715 47.1474 94.0192L55.8112 88.4127L54.1971 86.0263ZM131.816 22.5255L131.323 22.0003C128.927 24.0146 126.507 26.0041 124.164 28.0768C123.886 28.3229 124.024 29.0388 123.957 29.642C126.735 27.1243 129.276 24.8253 131.816 22.5255H131.816Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath id="clip0">
                    <rect
                        width="150.958"
                        height="131.268"
                        fill="white"
                        transform="translate(0.942505 0.855957)"
                    />
                </clipPath>
            </defs>
        </svg>

    );
}

export let setShouldShowTranslateEnabledTooltip: undefined | ((show: boolean) => void);

export const DeleteChatBarIcon: ChatBarButton = ({ isMainChat }) => {
    const { showChatBarButton } = settings.use(["showChatBarButton"]);
    const [tooltip, setTooltip] = useState<string | null>(null); // Initially null

    // Fetch tooltip value on component mount
    useEffect(() => {
        const fetchTooltip = async () => {
            const initialTooltip = await getNameForToolTip();
            // press to disable means it is currently active
            setTooltip(initialTooltip);
        };
        fetchTooltip();
    }, []); // Run only on mount

    if (!isMainChat || !showChatBarButton || tooltip === null) return null; // Render null while tooltip is loading

    const handleClick = async () => {

        let updatedTooltip: string;
        let tooltipReturn: boolean;
        if (tooltip === "Press to disable") {
            // if the service is currently active
            updatedTooltip = "Press to enable";
            tooltipReturn = false;
        } else {
            updatedTooltip = "Press to disable";
            tooltipReturn = true;
        }
        addChannelToList(tooltipReturn);
        // Fetch updated tooltip on click
        setTooltip(updatedTooltip); // Update tooltip
    };

    return (
        <ChatBarButton
            tooltip={tooltip}
            onClick={handleClick}
            buttonProps={{
                "aria-haspopup": "dialog"
            }}
        >
            <DeleteIcon className={cl({ "chat-button": true })} />
        </ChatBarButton>
    );
};


