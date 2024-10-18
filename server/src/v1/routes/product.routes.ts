import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProductById,
  getProductForUsersInStock,
  getProductForUsersNotInStock,
  getProductWithAttribute,
  updateProduct,
  updateProductIsFocused,
} from "v1/controllers/product.controller";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProduct);
/**
 * The user will receive the product if it is in stock or not.
 * if the product is in stock for the particular user, then the stockObj will be attached. Otherwise, there will not be a stock obj.
 */
router.get("/getProductWithAttribute", getProductWithAttribute);
/**
 * Only Products which are in stock for a specific user will get with attached stockObj.
 */
router.get("/inStock", getProductForUsersInStock);
router.get("/notinStock", getProductForUsersNotInStock);
router.get("/getById/:id", getProductById);
router.patch("/updateById/:id", updateProduct);
router.patch("/updateIsFocusedById", updateProductIsFocused);
router.delete("/deleteById/:id", deleteProduct);

export default router;
