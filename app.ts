import "dotenv/config";
import express from "express";
import { applyExpressMiddleware, attachBuiltClient } from "./server/_core/app";

const app = express();
applyExpressMiddleware(app);
attachBuiltClient(app);
export default app;
