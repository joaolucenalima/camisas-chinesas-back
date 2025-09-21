import { Router } from "express";
import { prisma } from "../../prisma/connection.js";

const PersonController = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Person:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único da pessoa
 *         name:
 *           type: string
 *           description: Nome da pessoa
 */

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
PersonController.post("/", async (req, res) => {
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
PersonController.get("/", async (req, res) => {
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
 *           type: string
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
PersonController.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const person = await prisma.person.update({
      where: { id },
      data: { name },
    });

    res.json(person);
  } catch (error) {
    console.error("Erro ao atualizar pessoa:", error);
    res.status(500).json({ error: "Erro ao atualizar pessoa" });
  }
});

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
 *           type: string
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
PersonController.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const person = await prisma.person.delete({
      where: { id },
    });

    res.json(person);
  } catch (error) {
    console.error("Erro ao deletar pessoa:", error);
    res.status(500).json({ error: "Erro ao deletar pessoa" });
  }
});

export default PersonController;
