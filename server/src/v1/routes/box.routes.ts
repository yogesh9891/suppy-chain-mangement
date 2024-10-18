import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import { BoxAdd, BoxDelete, BoxGet, BoxGetById, BoxUpdate } from "v1/controllers/box.controller";
const router = express.Router();
router.post("/", authorizeJwt, BoxAdd);
router.get("/", BoxGet);
router.get("/getById/:id", BoxGetById);
router.patch("/updateById/:id", authorizeJwt, BoxUpdate);
router.delete("/deleteById/:id", authorizeJwt, BoxDelete);

export default router;
