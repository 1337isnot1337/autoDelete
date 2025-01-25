/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { IpcMainInvokeEvent } from "electron";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import path from "path";
export async function isChannelInChannelList(_: IpcMainInvokeEvent, server_id: string, channel_id: string): Promise<Boolean> {
    const fullChannels: [fullChannel] = await readChannelAndServer(_);
    for (var channalsett of fullChannels) {
        if (channalsett.channel_id === channel_id && channalsett.server_id === server_id) {

            console.log("That channel was found");
            return true;
        }
    }

    console.log("That channel was not found");
    return false;
}
export async function readChannelAndServer(_: IpcMainInvokeEvent): Promise<[fullChannel]> {
    const rawData = readFile(channelsFilePath, "utf8");
    const parsedData: [fullChannel] = JSON.parse(await rawData);
    return parsedData;
}
const channelsFilePath = "~/.config/Vencord/autoDelete/channel_string_data_file.json";
const messagesFilePath = "~/.config/Vencord/autoDelete/messages_to_delete.json";
interface fullChannel {
    channel_id: string,
    server_id: string,
}
export async function getPath(_: IpcMainInvokeEvent): Promise<string> {
    return "Current working directory:" + process.cwd();
}
export async function changeChannelAndServer(_: IpcMainInvokeEvent, channel_id: string, server_id: string, add: boolean): Promise<void> {

    const dir = path.dirname(channelsFilePath);

    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    if (!existsSync(channelsFilePath)) {
        writeFileSync(channelsFilePath, "[]", { encoding: "utf8" });
        console.log(`File created at: ${channelsFilePath}`);
    } else {
        console.log(`File already exists at: ${channelsFilePath}`);
    }

    const rawData = readFile(channelsFilePath, "utf8");
    const parsedData: [fullChannel] = JSON.parse(await rawData);

    const fullchan: fullChannel = {
        channel_id: channel_id,
        server_id: server_id
    };

    if (add) {
        parsedData.push(fullchan);
    } else {
        // Find the index of the object to remove
        const index = parsedData.findIndex(chan => chan.channel_id === channel_id && chan.server_id === server_id);

        if (index !== -1) {
            parsedData.splice(index, 1);
            console.log(`Removed channel ${channel_id} from server ${server_id}`);
        } else {
            console.log(`Channel ${channel_id} not found in server ${server_id}`);
        }
    }

    const jsonData = JSON.stringify(parsedData, null, 2);
    console.log("JSON DATA ", jsonData);
    writeFile(channelsFilePath, jsonData);

    console.log(`Channel ID: ${channel_id}, Server ID: ${server_id}`);
}

interface simplifiedMessage {
    id: string,
    channel_id: string,
    timestamp: number,

}
export async function updateDeleteQueue(_: IpcMainInvokeEvent, simpl_messages: simplifiedMessage[]) {

    const jsonData = JSON.stringify(simpl_messages, null, 2);
    console.log("More JSON DATA ", jsonData);
    writeFile(messagesFilePath, jsonData, { flag: "w" });
}
export async function addToDeleteQueue(_: IpcMainInvokeEvent, simpl_message: simplifiedMessage) {
    const dir = path.dirname(messagesFilePath);

    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    if (!existsSync(messagesFilePath)) {
        writeFileSync(messagesFilePath, "[]", { encoding: "utf8" });
        console.log(`File created at: ${messagesFilePath}`);
    } else {
        console.log(`File already exists at: ${messagesFilePath}`);
    }


    const rawData = readFile(messagesFilePath, "utf8");
    const parsedData: [simplifiedMessage] = JSON.parse(await rawData);

    parsedData.push(simpl_message);
    const jsonData = JSON.stringify(parsedData, null, 2);
    console.log("MESSAGE JSON DATA ", jsonData);
    writeFile(messagesFilePath, jsonData);

    console.log("Added message to messages list");
}
export async function readDeleteQueue(_: IpcMainInvokeEvent): Promise<[simplifiedMessage] | Error> {
    try {
        const rawData = await readFile(messagesFilePath, "utf8");
        console.log(rawData);
        const parsedData: [simplifiedMessage] = JSON.parse(rawData);
        return parsedData;
    } catch (error) {
        console.error("Error parsing JSON data:", error);
        return new Error("Failed to parse JSON data");
    }
}

