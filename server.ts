import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { prisma } from "./prisma/connection.js";

import "dotenv/config";

const port = process.env.PORT;
const networkPath = process.env.NETWORK_PATH;

if (!port || !networkPath) {
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
app.use(express.json());
app.use(cors(corsOptions));

function getDirectoryTree(dirPath: string): Record<string, any> {
	const result: Record<string, any> = {};
	const items = fs.readdirSync(dirPath, { withFileTypes: true });

	items.forEach((item) => {
		const fullPath = path.join(dirPath, item.name);

		if (item.isDirectory()) {
			result[item.name] = getDirectoryTree(fullPath);
		} else {
			if (!result.files) {
				result.files = [];
			}
			result.files.push(item.name);
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
/**
 * @swagger
 * /person:
 *   post:
 *     summary: Cria uma nova pessoa
 *     tags:
 *       - Pessoa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: nome
 *     responses:
 *       201:
 *         description: Pessoa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Person'
 *       500:
 *         description: Erro ao criar pessoa
 */
app.post("/person", async (req, res) => {
	try {
		
		const { name } = req.body;

		const person = await prisma.person.create({
			data: { name },
		});

		res.status(201).json(person);
	} catch (error) {
		console.error("Erro ao criar pessoa:", error);
		res.status(500).json({ error: "Erro ao criar pessoa" });
	}
});

/**
 * @swagger
 * /person:
 *   get:
 *     summary: Retorna a lista de pessoas
 *     tags:
 *       - Pessoa
 *     responses:
 *       200:
 *         description: Lista de pessoas obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Person'
 *       500:
 *         description: Erro ao buscar pessoas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao buscar pessoas
 */
app.get("/person", async (req, res) => {
	try {
		const people = await prisma.person.findMany();
		res.json(people);
	} catch (error) {
		console.error("Erro ao buscar pessoas:", error);
		res.status(500).json({ error: "Erro ao buscar pessoas" });
	}
});
	
/**
 * @swagger
 * /person:
 *   get:
 *     summary: Retorna a lista de pessoas
 *     tags:
 *       - Pessoa
 *     responses:
 *       200:
 *         description: Lista de pessoas obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Person'
 *       500:
 *         description: Erro ao buscar pessoas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao buscar pessoas
 */
app.get("/person", async (req, res) => {
	try {
		const people = await prisma.person.findMany();
		res.json(people);
	} catch (error) {
		console.error("Erro ao buscar pessoas:", error);
		res.status(500).json({ error: "Erro ao buscar pessoas" });
	}
});

/**
 * @swagger
 * /person/{id}:
 *   put:
 *     summary: Atualiza uma pessoa pelo ID
 *     tags:
 *       - Pessoa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pessoa a ser atualizada
 *     requestBody:
 *       description: Dados para atualizar a pessoa
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: nome Atualizado
 *     responses:
 *       200:
 *         description: Pessoa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Person'
 *       500:
 *         description: Erro ao atualizar pessoa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao atualizar pessoa
 */
app.put("/person/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { name } = req.body;

		const person = await prisma.person.update({
			where: { id: Number(id) },
			data: { name },
		});

		res.json(person);
	} catch (error) {
		console.error("Erro ao atualizar pessoa:", error);
		res.status(500).json({ error: "Erro ao atualizar pessoa" });
	}
})

/**
 * @swagger
 * /person/{id}:
 *   delete:
 *     summary: Deleta uma pessoa pelo ID
 *     tags:
 *       - Pessoa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pessoa a ser deletada
 *     responses:
 *       200:
 *         description: Pessoa deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Person'
 *       500:
 *         description: Erro ao deletar pessoa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao deletar pessoa
 */
app.delete("/person/:id", async (req, res) => {
	try {
		const { id } = req.params;

		const person = await prisma.person.delete({
			where: { id: Number(id) },
		});

		res.json(person);
	} catch (error) {
		console.error("Erro ao deletar pessoa:", error);
		res.status(500).json({ error: "Erro ao deletar pessoa" });
	}
});

/**
 * @swagger
 * /shirt:
 *   post:
 *     summary: Cria uma nova camisa
 *     tags:
 *       - Camisa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - userId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Camisa Vermelha"
 *               link:
 *                 type: string
 *                 example: "http://exemplo.com/camisa-vermelha"
 *               userId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Camisa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shirt'
 *       500:
 *         description: Erro ao criar camisa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao criar camisa
 */
app.post("/shirt", async (req, res) => {
	const body = req.body;

	const imageURL = "";

	const shirt = await prisma.shirt.create({
		data: {
			title: body.title,
			link: body.link,
			imageURL,
			personId: body.userId,
		},
	});

	res.json(shirt);
});

/**
 * @swagger
 * /shirt:
 *   get:
 *     summary: Lista todas as camisas
 *     tags:
 *       - Camisa
 *     responses:
 *       200:
 *         description: Lista de camisas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shirt'
 *       500:
 *         description: Erro ao buscar camisas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao buscar camisas
 */
app.get("/shirt", async (req, res) => {
	try {
		const shirts = await prisma.shirt.findMany();
		res.json(shirts);
	} catch (error) {
		console.error("Erro ao buscar camisas:", error);
		res.status(500).json({ error: "Erro ao buscar camisas" });
	}
});

/**
 * @swagger
 * /shirt/{id}:
 *   put:
 *     summary: Atualiza uma camisa pelo ID
 *     tags:
 *       - Camisa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da camisa a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Nova camisa"
 *               link:
 *                 type: string
 *                 example: "http://example.com/camisa"
 *     responses:
 *       200:
 *         description: Camisa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shirt'
 *       500:
 *         description: Erro ao atualizar camisa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao atualizar camisa
 */
app.put("/shirt/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { title, link } = req.body;

		const shirt = await prisma.shirt.update({
			where: { id: Number(id) },
			data: { title, link },
		});

		res.json(shirt);
	} catch (error) {
		console.error("Erro ao atualizar camisa:", error);
		res.status(500).json({ error: "Erro ao atualizar camisa" });
	}
})

/**
 * @swagger
 * /shirt/{id}:
 *   delete:
 *     summary: Deleta uma camisa pelo ID
 *     tags:
 *       - Camisa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da camisa a ser deletada
 *     responses:
 *       200:
 *         description: Camisa deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shirt'
 *       500:
 *         description: Erro ao deletar camisa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao deletar camisa
 */
app.delete("/shirt/:id", async (req, res) => {
	try {
		const { id } = req.params;

		const shirt = await prisma.shirt.delete({
			where: { id: Number(id) },
		});

		res.json(shirt);
	} catch (error) {
		console.error("Erro ao deletar camisa:", error);
		res.status(500).json({ error: "Erro ao deletar camisa" });
	}
})

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
  apis: ["./server.ts"], // caminho pro arquivo onde terá os comentários
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(port, () => {
	console.log(`Servidor rodando em http://localhost:${port}`);
});


// link do swagger http://localhost:3333/docs