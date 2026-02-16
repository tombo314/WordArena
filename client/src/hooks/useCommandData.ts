import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { RESERVED_KEYS } from "../const";
import type { CommandData } from "../types";

export function useCommandData(socket: Socket) {
	const [commandList, setCommandList] = useState<string[]>([]);
	const [subCommandMap, setSubCommandMap] = useState<Record<string, string[]>>(
		{},
	);
	const commandDataRef = useRef<CommandData>({});

	useEffect(() => {
		socket.emit("commandData", null);
		socket.on("commandData", (data: { commandData: CommandData }) => {
			commandDataRef.current = data.commandData;
			const topLevelKeys = Object.keys(data.commandData);
			setCommandList(topLevelKeys);

			const subMap: Record<string, string[]> = {};
			for (const key of topLevelKeys) {
				const entry = data.commandData[key];
				const subs = Object.keys(entry).filter((k) => !RESERVED_KEYS.has(k));
				if (subs.length > 0) subMap[key] = subs;
			}
			setSubCommandMap(subMap);
		});
		return () => {
			socket.off("commandData");
		};
	}, [socket]);

	return { commandList, subCommandMap, commandDataRef };
}
