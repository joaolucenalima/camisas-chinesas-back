import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";

import "dotenv/config";

const PORT = process.env.PORT;
const networkPath = process.env.NETWORK_PATH;

if (!PORT || !networkPath) {
	console.error(
		"As variáveis de ambiente PORT e NETWORK_PATH devem estar definidas."
	);
	process.exit(1);
}

const app = express();

const corsOptions = {
	origin: "*",
	methods: ["GET", "POST", "PUT", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

function getDirectoryTree(dirPath: string) {
	let result: Record<string, any> = {};

	const items = fs.readdirSync(dirPath, { withFileTypes: true });

	items.forEach((item) => {
		const fullPath = path.join(dirPath, item.name);

		if (item.isDirectory()) {
			result[item.name] = getDirectoryTree(fullPath);
		} else {
			if (!result.length) {
				result = [];
			}
			result.push(item.name);
		}
	});

	return result;
}

app.get("/files", (_, res) => {
	try {
		const tree = getDirectoryTree(networkPath);
		res.json(tree);
	} catch (error) {
		console.error(error);
		res.status(500).send("Erro ao ler a unidade de rede");
	}
});

app.listen(PORT, () => {
	console.log(`Servidor rodando em http://localhost:${PORT}`);
});

function findFileRecursive(dir: string, fileName: string): string | null {
	const files = fs.readdirSync(dir);

	for (const file of files) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			const found = findFileRecursive(filePath, fileName);
			if (found) return found;
		} else if (file === fileName) {
			return filePath;
		}
	}

	return null;
}

app.get("/download/:image", (req, res) => {
	const imageName = req.params.image;

	const filePath = findFileRecursive(networkPath, imageName);

	if (!filePath) {
		return res.status(404).send("Arquivo não encontrado");
	}

	res.download(filePath, (err) => {
		if (err) {
			console.error("Erro ao enviar arquivo:", err);
			if (!res.headersSent) {
				res.status(500).send("Erro ao acessar arquivo");
			}
		}
	});
});
