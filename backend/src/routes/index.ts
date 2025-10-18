import { Router } from "express";

import apiRoutes from "./apiRoutes";
import dataRoutes from "./dataRoutes";

const router = Router();

// ---------- Modular routes ----------
router.use("/", apiRoutes);

// ---------- CRUD / Data routes ----------
router.use("/", dataRoutes);

export default router;
