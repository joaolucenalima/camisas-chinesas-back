import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import PersonController from "./controllers/person.js";
import ShirtController from "./controllers/shirt.js";

import "dotenv/config";

const port = process.env.PORT;
const networkPath = process.env.NETWORK_PATH;
const databaseUrl = process.env.DATABASE_URL;

if (!port || !networkPath || !databaseUrl) {
	console.error(
		"As variáveis de ambiente PORT, NETWORK_PATH e DATABASE_URL devem estar definidas."
	);
	process.exit(1);
}

const app = express();

const corsOptions = {
	origin: "*",
	methods: ["GET", "POST", "PUT", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/person", PersonController);
app.use("/api/shirt", ShirtController);

/**
 * @swagger
 * /getImage/{image}:
 *   get:
 *     summary: Retorna uma imagem pelo nome do arquivo
 *     description: Retorna o arquivo de imagem solicitado do caminho de armazenamento na rede.
 *     tags:
 *       - Download
 *     parameters:
 *       - in: path
 *         name: image
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[^\\/]+$'
 *         example: foto.png
 *     responses:
 *       200:
 *         description: Arquivo de imagem retornado com sucesso
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Arquivo de imagem não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Arquivo não encontrado
 *       500:
 *         description: Erro ao acessar o arquivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao acessar arquivo
 */
app.get("/api/getImage/:image", (req, res) => {
	const imageUrl = req.params.image;

	const filePath = path.join(process.cwd(), networkPath, imageUrl);

	if (!fs.existsSync(filePath)) {
		return res.status(404).json({ message: "Arquivo não encontrado" });
	}

	res.sendFile(filePath, (err) => {
		if (err) {
			console.error("Erro ao enviar arquivo:", err);
			if (!res.headersSent) {
				res.status(500).json({ message: "Erro ao acessar arquivo" });
			}
		}
	});
});

const swaggerOptions = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "API Camisas Chinesas",
			version: "1.0.0",
			description: "Documentação da API para gerenciar camisas",
		},
		servers: [
			{
				url: `http://localhost:${port}`,
			},
		],
	},
	apis: ["./src/server.ts", "./src/controllers/*.ts"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
	console.log(`Servidor rodando em http://localhost:${port}`);
});
