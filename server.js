import dotenv from "dotenv";
import express from "express";
import { router } from "./src/router.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

router(app, express);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
