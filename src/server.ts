import cors from "cors";
import express from "express";
import { createServer } from "http";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { WebSocketServer } from "ws";
import ImageController from "./controllers/image.js";
import PersonController from "./controllers/person.js";
import ShirtController from "./controllers/shirt.js";
import { validatedEnv } from "./utils/env.js";

const port = validatedEnv.PORT;

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
app.use("/api/getImage", ImageController);

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

const expressServer = createServer(app);
const wss = new WebSocketServer({ server: expressServer });

wss.on("connection", function connection(ws) {
  console.log("New client connected");

  ws.on("message", function message(data) {
    const messageText = data.toString();
    console.log("Received:", messageText);
    ws.send(`Echo: ${messageText}`);
  });

  ws.on("close", function close() {
    console.log("Client disconnected");
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
