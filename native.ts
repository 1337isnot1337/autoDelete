/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { IpcMainInvokeEvent } from "electron";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";

// Define the file paths
const channelsFilePath = path.join(os.homedir(), ".config", "Vencord", "autoDelete", "channel_string_data_file.json");
const messagesFilePath = path.join(os.homedir(), ".config", "Vencord", "autoDelete", "messages_to_delete.json");

interface fullChannel {
    channel_id: string,
    server_id: string,
}

interface simplifiedMessage {
    id: string,
    channel_id: string,
    timestamp: number,
}

// Reusable function to ensure files and directories exist
function ensureFileExists(filePath: string, defaultContent: string = "[]") {
    const dirPath = path.dirname(filePath);
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
    }
    if (!existsSync(filePath)) {
        writeFileSync(filePath, defaultContent, { encoding: "utf8" });
    }
}

ensureFileExists(channelsFilePath);
ensureFileExists(messagesFilePath);

export async function isChannelInChannelList(_: IpcMainInvokeEvent, server_id: string, channel_id: string): Promise<Boolean> {
    ensureFileExists(channelsFilePath); // Ensure the file exists
    const fullChannels: [fullChannel] = await readChannelAndServer(_);
    for (const channel of fullChannels) {
        if (channel.channel_id === channel_id && channel.server_id === server_id) {
            return true;
        }
    }
    return false;
}

export async function readChannelAndServer(_: IpcMainInvokeEvent): Promise<[fullChannel]> {
    ensureFileExists(channelsFilePath); // Ensure the file exists
    const rawData = await readFile(channelsFilePath, "utf8");
    const parsedData: [fullChannel] = JSON.parse(rawData);
    return parsedData;
}

export async function getPath(_: IpcMainInvokeEvent): Promise<string> {
    return "Current working directory:" + process.cwd();
}

export async function changeChannelAndServer(_: IpcMainInvokeEvent, channel_id: string, server_id: string, add: boolean): Promise<void> {
    ensureFileExists(channelsFilePath); // Ensure the file exists
    const rawData = await readFile(channelsFilePath, "utf8");
    const parsedData: [fullChannel] = JSON.parse(rawData);

    const fullchan: fullChannel = {
        channel_id: channel_id,
        server_id: server_id
    };

    if (add) {
        parsedData.push(fullchan);
    } else {
        const index = parsedData.findIndex(chan => chan.channel_id === channel_id && chan.server_id === server_id);
        if (index !== -1) {
            parsedData.splice(index, 1);
        }
    }

    const jsonData = JSON.stringify(parsedData, null, 2);
    await writeFile(channelsFilePath, jsonData);
}

export async function protectMessage(_: IpcMainInvokeEvent, message_id: string, channel_id: string) {
    ensureFileExists(messagesFilePath); // Ensure the file exists
    const rawData = await readFile(messagesFilePath, "utf8");
    const parsedData: simplifiedMessage[] = JSON.parse(rawData);
    const filtered = parsedData.filter(message => message.id !== message_id);
    await writeFile(messagesFilePath, JSON.stringify(filtered, null, 2));
}

export async function updateDeleteQueue(_: IpcMainInvokeEvent, simpl_messages: simplifiedMessage[]) {
    ensureFileExists(messagesFilePath); // Ensure the file exists
    const jsonData = JSON.stringify(simpl_messages, null, 2);
    await writeFile(messagesFilePath, jsonData, { flag: "w" });
}

export async function addToDeleteQueue(_: IpcMainInvokeEvent, simpl_message: simplifiedMessage) {
    ensureFileExists(messagesFilePath); // Ensure the file exists
    const rawData = await readFile(messagesFilePath, "utf8");
    const parsedData: simplifiedMessage[] = JSON.parse(rawData);

    parsedData.push(simpl_message);
    const jsonData = JSON.stringify(parsedData, null, 2);
    await writeFile(messagesFilePath, jsonData);
}

export async function readDeleteQueue(_: IpcMainInvokeEvent): Promise<[simplifiedMessage] | Error> {
    try {
        ensureFileExists(messagesFilePath); // Ensure the file exists
        const rawData = await readFile(messagesFilePath, "utf8");
        const parsedData: [simplifiedMessage] = JSON.parse(rawData);
        return parsedData;
    } catch (error) {
        console.error("Error parsing JSON data:", error);
        return new Error("Failed to parse JSON data");
    }
}
