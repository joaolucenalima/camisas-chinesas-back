import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
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

app.use("/person", PersonController);
app.use("/shirt", ShirtController);

/**
 * @swagger
 * /download/{image}:
 *   get:
 *     summary: Faz o download de uma imagem pelo nome
 *     tags:
 *       - Download
 *     parameters:
 *       - in: path
 *         name: image
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do arquivo de imagem a ser baixado
 *         example: "foto.png"
 *     responses:
 *       200:
 *         description: Download iniciado com sucesso
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Arquivo não encontrado
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Arquivo não encontrado
 *       500:
 *         description: Erro ao acessar arquivo
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Erro ao acessar arquivo
 */
app.get("/download/:image", (req, res) => {
	const imageUrl = req.params.image;

	const filePath = path.join(networkPath, imageUrl);

	if (!fs.existsSync(filePath)) {
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
	apis: ["./server.ts", "./src/controllers/*.ts"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
	console.log(`Servidor rodando em http://localhost:${port}`);
});
