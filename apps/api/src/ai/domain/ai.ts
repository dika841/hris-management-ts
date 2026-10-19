export type TAiMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

export type TAiCompletion = {
	content: string;
	model: string;
};
