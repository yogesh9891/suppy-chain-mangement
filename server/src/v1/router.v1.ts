import express from "express";
import indexRouter from "v1/routes/index.routes";
import userRouter from "v1/routes/user.routes";

import countryRouter from "v1/routes/country.routes";
import cityRouter from "v1/routes/city.routes";
import stateRouter from "v1/routes/state.routes";
import areaRouter from "v1/routes/area.routes";
import zoneRouter from "v1/routes/zone.routes";
import portRouter from "v1/routes/port.routes";

import brandRouter from "v1/routes/brand.routes";
import colorRouter from "v1/routes/color.routes";
import sizeRouter from "v1/routes/size.routes";
import attributeRouter from "v1/routes/attribute.routes";
import categoryRouter from "v1/routes/category.routes";
import productRouter from "v1/routes/product.routes";
import attributeValueRouter from "v1/routes/attributeValue.routes";

import cartonRouter from "v1/routes/carton.routes";
import boxRouter from "v1/routes/box.routes";

import productOrderRouter from "v1/routes/productOrder.routes";
import companyOrderRouter from "v1/routes/companyOrder.routes";
import containerRouter from "v1/routes/container.routes";
import productStockRouter from "v1/routes/productStock.routes";
import orderRouter from "v1/routes/order.routes";

import expenseRouter from "v1/routes/expense.routes";
import expenseCategoryeRouter from "v1/routes/expenseCategory.routes";
import barCodeRouter from "v1/routes/barcode.routes";
import paymentRouter from "v1/routes/payment.routes";

const router = express.Router();

router.use("/", indexRouter);
router.use("/user", userRouter);
router.use("/country", countryRouter);
router.use("/city", cityRouter);
router.use("/state", stateRouter);
router.use("/area", areaRouter);
router.use("/zone", zoneRouter);
router.use("/port", portRouter);

//PRODUCTS, BRAND, CATEGORY
router.use("/color", colorRouter);
router.use("/size", sizeRouter);
router.use("/brand", brandRouter);
router.use("/attribute", attributeRouter);
router.use("/attributeValue", attributeValueRouter);
router.use("/category", categoryRouter);
router.use("/product", productRouter);
router.use("/productStock", productStockRouter);

// PACKING
router.use("/carton", cartonRouter);
router.use("/box", boxRouter);

//ORDER
router.use("/productOrder", productOrderRouter);
router.use("/companyOrder", companyOrderRouter);
router.use("/container", containerRouter);
router.use("/order", orderRouter);

router.use("/expense", expenseRouter);
router.use("/expenseCategory", expenseCategoryeRouter);
router.use("/barcode", barCodeRouter);


router.use("/payment", paymentRouter);


export default router;
