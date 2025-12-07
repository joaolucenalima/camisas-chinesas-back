import crypto from "crypto";
import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path, { extname } from "path";
import { prisma } from "../../prisma/connection.js";
import { validatedEnv } from "../utils/env.js";
import { broadcast } from "../websocket.js";

const ShirtController = Router();

const networkPath = validatedEnv.NETWORK_PATH;

if (!networkPath) {
  console.error("Variável de ambiente NETWORK_PATH não encontrada");
  process.exit(1);
}

const uploadDir = path.resolve(networkPath);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, networkPath);
  },
  filename: (_req, file, cb) => {
    const unique = crypto.randomUUID();
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const mimeTypeRegex = /^(image)\/[a-zA-Z]+/;
    const isValidFileFormat = mimeTypeRegex.test(file.mimetype);
    if (isValidFileFormat) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Formato do arquivo inválido."));
    }
  },
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Shirt:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da camisa
 *         title:
 *           type: string
 *           description: Título da camisa
 *         link:
 *           type: string
 *           description: Link externo para a camisa
 *           nullable: true
 *         imageURL:
 *           type: string
 *           description: Caminho para a imagem da camisa
 *           nullable: true
 *         size:
 *           type: string
 *           description: Tamanho da camisa em unidade americana
 *         priceInCents:
 *           type: integer
 *           description: Preço da camisa em centavos
 *           nullable: true
 *         personId:
 *           type: string
 *           description: ID da pessoa associada à camisa
 *         status:
 *           type: number
 *           description: Status da escolha da camisa
 */

/**
 * @swagger
 * /shirt:
 *   post:
 *     summary: Cria uma nova camisa
 *     tags:
 *       - Camisa
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - personId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Brasil 2025 Home"
 *               link:
 *                 type: string
 *                 example: "https://lojadecamisas.com"
 *               priceInCents:
 *                 type: integer
 *                 example: 2999
 *               size:
 *                 type: string
 *                 example: "XL"
 *               personId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagem da camisa
 *     responses:
 *       201:
 *         description: Camisa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shirt'
 *       400:
 *         description: Campos obrigatórios ausentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Campos obrigatórios ausentes
 */
ShirtController.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, link, priceInCents, personId, size } = req.body;

    if (!title || !personId) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    const shirt = await prisma.shirt.create({
      data: {
        title,
        link: link ?? null,
        imageURL: req.file?.filename ?? null,
        priceInCents: priceInCents ? Number(priceInCents) : null,
        personId,
        size,
      },
    });

    broadcast("shirt-modification");

    return res.status(201).json(shirt);
  } catch (error) {
    console.error("Erro ao criar camisa:", error);
    return res.status(500).json({ error: "Erro ao criar camisa" });
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
 *   get:
 *     summary: Busca informações de uma camisa pelo ID
 *     tags:
 *       - Camisa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da camisa a ser buscada
 *     responses:
 *       200:
 *         description: Camisa retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shirt'
 *       400:
 *         description: ID fornecido inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: ID fornecido inválido
 *       404:
 *         description: Camisa não encontrada
 *       500:
 *         description: Erro ao buscar camisa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao buscar camisa
 */
ShirtController.get("/:id", async (req, res) => {
  try {
    const shirtId = Number(req.params.id);

    if (!shirtId || isNaN(shirtId)) {
      res.status(400).json({ error: "ID fornecido inválido" });
    }

    const shirt = await prisma.shirt.findUnique({
      where: {
        id: shirtId,
      },
    });
    res.json(shirt);
  } catch (error) {
    console.error("Erro ao buscar camisas:", error);
    res.status(500).json({ error: "Erro ao buscar camisas" });
  }
});

/**
 * @swagger
 * /shirt/by-person/{personId}:
 *   get:
 *     summary: Busca as camisas de uma pessoa
 *     tags:
 *       - Camisa
 *     parameters:
 *       - in: query
 *         name: personId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da pessoa para filtrar camisas
 *     responses:
 *       200:
 *         description: Lista de camisas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shirt'
 *       400:
 *         description: ID da pessoa é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: ID da pessoa é obrigatório
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
ShirtController.get("/by-person/:personId", async (req, res) => {
  try {
    const personId = req.params.personId;

    if (!personId) {
      return res.status(400).json({ error: "ID da pessoa é obrigatório" });
    }

    const shirts = await prisma.shirt.findMany({
      where: {
        personId: personId.toString(),
      },
    });
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
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Nova camisa"
 *               link:
 *                 type: string
 *                 example: "https://lojadecamisas.com"
 *               priceInCents:
 *                 type: integer
 *                 example: 2999
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Nova imagem da camisa (opcional)
 *               size:
 *                 type: string
 *                 description: Tamanho da camisa
 *               status:
 *                 type: number
 *                 description: Status da escolha da camisa
 *     responses:
 *       200:
 *         description: Camisa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shirt'
 *       400:
 *         description: Campos obrigatórios ausentes
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
ShirtController.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID não fornecido" });
    }

    const imageURL = req.file?.filename;

    if (imageURL) {
      const actualShirt = await prisma.shirt.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (actualShirt?.imageURL === imageURL) return;

      data.imageURL = imageURL;

      const previousImagePath = actualShirt?.imageURL;
      if (previousImagePath) {
        try {
          const resolvedPrev = path.resolve(previousImagePath);
          if (resolvedPrev.startsWith(uploadDir) && fs.existsSync(resolvedPrev)) {
            fs.unlinkSync(resolvedPrev);
          }
        } catch (err) {
          console.error("Erro ao deletar imagem anterior:", err);
        }
      }
    }

    if (data?.priceInCents) {
      if (isNaN(Number(data.priceInCents))) {
        delete data.priceInCents;
      } else {
        data.priceInCents = Number(data.priceInCents);
      }
    }

    const shirt = await prisma.shirt.update({
      where: { id: Number(id) },
      data,
    });

    broadcast("shirt-modification");

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
 *       404:
 *         description: Camisa não encontrada
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

    if (shirt.imageURL) {
      const previousImagePath = shirt.imageURL;
      if (previousImagePath) {
        try {
          const resolvedPrev = path.resolve(previousImagePath);
          if (resolvedPrev.startsWith(uploadDir) && fs.existsSync(resolvedPrev)) {
            fs.unlinkSync(resolvedPrev);
          }
        } catch (err) {
          console.error("Erro ao deletar imagem anterior:", err);
        }
      }
    }

    broadcast("shirt-modification");

    res.json(shirt);
  } catch (error) {
    console.error("Erro ao deletar camisa:", error);
    res.status(500).json({ error: "Erro ao deletar camisa" });
  }
});

export default ShirtController;
