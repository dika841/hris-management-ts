import { createServer, type Server } from "node:http";

const MOCK_CONTENT = JSON.stringify({
	summary: "Mock summary from DeepSeek.",
	recommendation: "Review late arrivals and confirm staffing coverage.",
	riskLevel: "medium",
	confidence: 82,
});

export const startMockAiProvider = async (port: number): Promise<Server> =>
	new Promise((resolve) => {
		const server = createServer((request, response) => {
			if (request.method !== "POST" || request.url !== "/chat/completions") {
				response.writeHead(404).end();
				return;
			}
			request.resume();
			request.on("end", () => {
				response.writeHead(200, { "Content-Type": "application/json" });
				response.end(
					JSON.stringify({
						model: "deepseek-chat",
						choices: [{ message: { content: MOCK_CONTENT } }],
					}),
				);
			});
		});
		server.listen(port, "127.0.0.1", () => resolve(server));
	});
