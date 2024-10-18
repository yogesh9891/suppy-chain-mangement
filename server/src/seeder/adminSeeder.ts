import { ORDER_STATUS, ORDER_TYPE, ROLES } from "common/constant.common";
import { encryptPassword } from "helpers/bcrypt";
import { Product } from "models/product.model";
import { ProductStock } from "models/productStock.model";
import { ProductStockLogs } from "models/productStockLogs.model";
import { User } from "models/user.model";
import { createDocuments, newObjectId } from "utils/mongoQueries";

export const adminSeeder = async () => {
  try {
    const encryptedPassword = await encryptPassword("admin@1234");
    const adminExist = await User.findOne({ role: ROLES.ADMIN }).exec();
    if (adminExist) {
      console.log("EXISTING ADMIN", adminExist.email);
      return "Admin already exists";
    }
    console.log("creating user");

    await new User({
      name: "Admin",
      email: "admin@admin.com",
      password: encryptedPassword,
      role: ROLES.ADMIN,
      approved: true,
    }).save();
  } catch (error) {
    console.error(error);
  }
};
export const adminStockSeeder = async () => {
  try {

    const adminExist = await User.findOne({ role: ROLES.ADMIN }).exec();
    if (adminExist) {
      
      let productArr = await Product.find({ isDeleted: false });
           if (productArr && productArr?.length > 0) {
             for (const product of productArr) {
               let productOrderStock = await ProductStock.findOne({
                 orderedToId: newObjectId(adminExist._id),
                 productId: product._id,
               }).exec();
               if (!productOrderStock) {
                 
                         let newProductObjLogs = {
                           productId: product._id,
                           name: product.name,
                           price: product.msp,
                           msp: product.msp,
                           gst: product.gst,
                           barCode: product.barCode,
                           totalItemInCarton: product.totalItemInCarton,
                           box: product.box,
                           packet: product.packet,
                           quantity: 0,
                           totalItems: 0 * product.box * product.packet,
                           leftItems: 0 * product.box * product.packet,
                           orderedToId: adminExist._id,
                           status: ORDER_STATUS.PENDING,
                           type: ORDER_TYPE.PURCHASE,
                         };
                         await createDocuments(ProductStockLogs, newProductObjLogs);
                 
                 
                 
                 let newProductObj = {
                   productId: product._id,
                   name: product.name,
                   price: product.msp,
                   msp: product.msp,
                   gst: product.gst,
                   totalItemInCarton: product.totalItemInCarton,
                   box: product.box,
                   packet: product.packet,
                   totalItems: 0,
                   quantity: 0,
                   minStock: 0,
                   leftItems: 0,
                   orderedToId: adminExist._id,
                   isSold: false,
                 };
                 const newProductStock = await createDocuments(ProductStock, newProductObj);
               } else {
             console.log("EXISTING PRODUCT", productOrderStock.name);
                 
               }
             }
      }
      return 0
    }

  } catch (error) {
    console.error(error);
  }
};