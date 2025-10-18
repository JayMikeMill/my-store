import "./utils/aliases";
import http from "http";
import app from "./app";
import { env } from "@config";

let currentApp = app;

const PORT = Number(env.SERVER_PORT) || 5000;

const server = http.createServer((req, res) => currentApp(req, res));

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
