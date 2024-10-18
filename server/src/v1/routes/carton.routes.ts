import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import { CartonAdd, CartonDelete, CartonGet, CartonGetById, CartonUpdate } from "v1/controllers/carton.controller";
const router = express.Router();

router.post("/", authorizeJwt, CartonAdd);
router.get("/", CartonGet);
router.get("/getById/:id", CartonGetById);
router.patch("/updateById/:id", authorizeJwt, CartonUpdate);
router.delete("/deleteById/:id", authorizeJwt, CartonDelete);

export default router;
