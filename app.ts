import "dotenv/config";
import { attachBuiltClient, createApiApp } from "./server/_core/app";

const app = createApiApp();
attachBuiltClient(app);
export default app;
