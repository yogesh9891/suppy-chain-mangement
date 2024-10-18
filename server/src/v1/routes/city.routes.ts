import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import { CityAdd, CityDelete, CityGet, CityGetById, CityUpdate } from "v1/controllers/city.controller";
const router = express.Router();

router.post("/", authorizeJwt, CityAdd);
router.get("/", CityGet);
router.get("/getById/:id", CityGetById);
router.patch("/updateById/:id", authorizeJwt, CityUpdate);
router.delete("/deleteById/:id", authorizeJwt, CityDelete);

export default router;
