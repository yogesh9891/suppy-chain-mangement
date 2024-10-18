import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import { StateAdd, StateDelete, StateGet, StateGetById, StateUpdate } from "v1/controllers/state.controller";
const router = express.Router();
router.post("/", authorizeJwt, StateAdd);
router.get("/", StateGet);
router.get("/getById/:id", StateGetById);
router.patch("/updateById/:id", authorizeJwt, StateUpdate);
router.delete("/deleteById/:id", authorizeJwt, StateDelete);

export default router;
