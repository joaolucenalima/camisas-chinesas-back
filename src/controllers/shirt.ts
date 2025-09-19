import { Router } from "express";
import { prisma } from "../prisma/connection.js";

const ShirtController = Router();

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
 *               - link
 *               - personId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Camisa Vermelha"
 *               link:
 *                 type: string
 *                 example: "juanito_united.jpg"
 *               priceInCents:
 *                 type: integer
 *                 example: 2999
 *               personId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Camisa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shirt'
 *       404:
 *         description: Imagem não encontrada no diretório
 *       500:
 *         description: Erro ao criar camisa
 */
ShirtController.post("/", async (req, res) => {
	try {
		const { title, link, priceInCents, personId } = req.body;

		if (!title || !link || !personId) {
			return res.status(400).json({ error: "Campos obrigatórios ausentes" });
		}

		const filePath = findFileRecursive(networkPath, link);
		if (!filePath) {
			return res.status(404).json({ error: "Imagem não encontrada na rede" });
		}

		const shirt = await prisma.shirt.create({
			data: {
				title,
				link,
				imageURL: filePath,
				priceInCents: priceInCents ?? null,
				personId: Number(personId),
			},
		});

		res.status(201).json(shirt);
	} catch (error) {
		console.error("Erro ao criar camisa:", error);
		res.status(500).json({ error: "Erro ao criar camisa" });
	}
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
ShirtController.get("/", async (req, res) => {
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
 *     summary: Atualiza uma camisa pelo ID (sem alterar a pessoa vinculada)
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
 *                 example: "juanito_united.jpg"
 *               priceInCents:
 *                 type: integer
 *                 example: 2999
 *     responses:
 *       200:
 *         description: Camisa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shirt'
 *       404:
 *         description: Imagem não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Imagem não encontrada na rede
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
ShirtController.put("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { title, link, priceInCents } = req.body;

		if (!title || !link) {
			return res.status(400).json({ error: "Campos obrigatórios ausentes" });
		}

		const filePath = findFileRecursive(networkPath, link);
		if (!filePath) {
			return res.status(404).json({ error: "Imagem não encontrada na rede" });
		}

		const shirt = await prisma.shirt.update({
			where: { id: Number(id) },
			data: {
				title,
				link,
				imageURL: filePath,
				priceInCents: priceInCents ?? null,
			},
		});

		res.json(shirt);
	} catch (error) {
		console.error("Erro ao atualizar camisa:", error);
		res.status(500).json({ error: "Erro ao atualizar camisa" });
	}
});

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
ShirtController.delete("/:id", async (req, res) => {
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
});

export default ShirtController;