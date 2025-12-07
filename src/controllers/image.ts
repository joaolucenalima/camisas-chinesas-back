import { Router } from "express";
import fs from "fs";
import path from "path";
import { validatedEnv } from "../utils/env.js";

const ImageController = Router();
const networkPath = validatedEnv.NETWORK_PATH;

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
ImageController.get("/:image", (req, res) => {
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

export default ImageController;
