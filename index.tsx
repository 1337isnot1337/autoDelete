/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { addChatBarButton, removeChatBarButton } from "@api/ChatButtons";
import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { getCurrentChannel, getCurrentGuild } from "@utils/discord";
import { sleep } from "@utils/misc";
import definePlugin, { PluginNative } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { Message } from "discord-types/general";
import moment from "moment";
import { MessageStore, UserStore } from "webpack/common";
import { Menu } from "webpack/common/menu";

import { DeleteChatBarIcon, DeleteIcon } from "./DeleteChangeIcon";
import { settings } from "./settings";
const Native = VencordNative.pluginHelpers.autoDelete as PluginNative<typeof import("./native")>;

const MessageActions = findByPropsLazy("deleteMessage", "startEditMessage");
const messageCtxPatch: NavContextMenuPatchCallback = (children, { message }) => {
    if (!message.content) return;


    const group = findGroupChildrenByChildId("copy-text", children);
    if (!group) return;

    group.splice(group.findIndex(c => c?.props?.id === "copy-text") + 1, 0, (
        <Menu.MenuItem
            id="vc-trans"
            label="Translate"
            icon={DeleteIcon}
            action={async () => {
                const trans = "hei";
            }}
        />
    ));
};
interface IMessageCreate {
    type: "MESSAGE_CREATE";
    optimistic: boolean;
    isPushNotification: boolean;
    channelId: string;
    message: Message;
}
export async function addChannelToList(tooltipReturn: boolean) {
    // if we recieve false the service is currently active, but should be shut off
    const currentChannel = getCurrentChannel()?.id as string;
    const currentServer = getCurrentGuild()?.id as string;
    if (!tooltipReturn) {

        // false because removing channel
        await Native.changeChannelAndServer(currentChannel, currentServer, false);
        return;
    }
    console.log(Native.getPath());
    console.log("Was told to ");
    // true because adding in channal
    await Native.changeChannelAndServer(currentChannel, currentServer, true);
    console.log("Ran");
    console.log("Recieved from the func " + currentChannel + " and server " + currentServer + ".");


}
export async function getNameForToolTip(): Promise<string> {
    const currentChannel = getCurrentChannel()?.id as string;
    const currentServer = getCurrentGuild()?.id as string;
    if (await Native.isChannelInChannelList(currentServer, currentChannel)) {
        console.log("That channel was found");
        return "Press to disable";
        // meaning it is currently active
    } else {
        console.log("That channel was not found");
        return "Press to enable";
    }

}
export default definePlugin({
    name: "autoDelete",
    description: "schedule channels to autodelete your messages after some time",
    authors: [{ name: "Name may change", id: 1297622889473904642n }],
    dependencies: ["MessageAccessoriesAPI", "MessagePopoverAPI", "MessageEventsAPI", "ChatInputButtonAPI"],
    settings,
    contextMenus: {
        "message": messageCtxPatch
    },

    flux: {
        async MESSAGE_CREATE({ optimistic, type, message, channelId }: IMessageCreate) {
            const user_id = UserStore.getCurrentUser()?.id;
            if (user_id !== message.author.id) return;
            if (optimistic || type !== "MESSAGE_CREATE") return;
            if (message.state === "SENDING") return;
            const thisChanServ: fullChannel = {
                channel_id: message.channel_id,
                server_id: getCurrentGuild()?.id as string,
            };

            const deleteList: [fullChannel] = await Native.readChannelAndServer();


            if (deleteList.some(item => item.channel_id === thisChanServ.channel_id && item.server_id === thisChanServ.server_id)) {
                console.log("Channel exists in the delete list!");
            } else {
                return;
            }

            console.log("Message ID " + message.id);
            const raw_message: Message = MessageStore.getMessage(thisChanServ.channel_id, message.id);
            const simple_message: simplifiedMessage = {
                id: raw_message.id,
                channel_id: raw_message.channel_id,
                timestamp: moment.now(),
            };
            await Native.addToDeleteQueue(simple_message);
            console.log("Logged");

        },
    },
    async start() {
        console.log("Auto delete is running");
        addChatBarButton("silly", DeleteChatBarIcon);
        await sleep(settings.store.sleepBetweenCheckingDeletes);
        console.log("Beginning loop");
        while (true) {
            console.log("Loop starting");
            const deleteQueue: simplifiedMessage[] | Error = await Native.readDeleteQueue();
            if (deleteQueue instanceof Error) {
                console.error("Failed to read delete queue:", deleteQueue.message);
                // Handle the error (e.g., display a message to the user, retry, etc.)
            } else {
                // Process the deleteQueue if it's valid data
                const updatedDeleteQueue: simplifiedMessage[] = [];
                for (const message of deleteQueue) {
                    const currentTimestamp = Math.floor(Date.now() / 1000); // Get current Unix timestamp in seconds
                    const toDelete: boolean = currentTimestamp - (message.timestamp / 1000) >= settings.store.totalSecondsBeforeDeletingMessage;
                    if (toDelete) {
                        console.log("Attemtping delete");
                        deleteMessage(message);
                        await sleep(settings.store.sleepBetweenConsecutiveDelete);
                    } else {
                        updatedDeleteQueue.push(message);
                    }
                }
                await Native.updateDeleteQueue(updatedDeleteQueue);
            }


            await sleep(5000);
        }
    },

    stop() {
        removeChatBarButton("silly");
    },

});
function deleteMessage(message: simplifiedMessage) {
    MessageActions.deleteMessage(message.channel_id, message.id);
    console.log("Deleted message");
}
interface simplifiedMessage {
    id: string,
    channel_id: string,
    timestamp: number,

}
interface fullChannel {
    channel_id: string,
    server_id: string,
}
export function getChannelLists(this: any) {
    return this.channel_lists;
}
