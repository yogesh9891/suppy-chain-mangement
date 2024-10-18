import express from "express";
import { authorizeJwt } from "middlewares/auth.middleware";
import {
  CountryAdd,
  CountryDelete,
  CountryGet,
  CountryGetById,
  CountryUpdate,
} from "v1/controllers/country.controller";
const router = express.Router();

router.post("/", authorizeJwt, CountryAdd);
router.get("/", CountryGet);
router.get("/getById/:id", CountryGetById);
router.patch("/updateById/:id", authorizeJwt, CountryUpdate);
router.delete("/deleteById/:id", authorizeJwt, CountryDelete);

export default router;
