import { getProducOrdertById } from "@/services/order.service";
import "./stlyle.css";
export default async function Page({ params }: { params: { id: string } }) {
  const orderId = params.id;

  const { data: product }: any = await getProducOrdertById(orderId);

  console.log(product, "product?.dataproduct?.dataproduct?.data");

  const calculateTotalQuantity = () => {
    return product?.data?.productsArr
      .reduce((acc: number, el: { quantity: any }) => acc + Number(el.quantity), 0)
      .toFixed(0);
  };

  const calculateGst = (gtax: number, amount: number) => {
    return Number(Math.round((amount * gtax) / 100).toFixed(2));
  };

  const calculateTotalTax = () => {
    return product?.data?.productsArr
      .reduce(
        (acc: number, el: { quantity: any; box: any; packet: any; gst: any; price: number }) =>
          acc + Number(el.quantity) * Number(el.box) * Number(el.packet) * calculateGst(Number(el.gst), el?.price),
        0,
      )
      .toFixed(0);
  };
  // setTimeout(() => {
  //   window.print();
  // }, 1000);

  return (
    <>
      <div style={{ textAlign: "center" }} className="company">
        <h1>{product?.data?.sellerDetails?.storeName}</h1>
        <p>{product?.data?.sellerDetails?.phone}</p>
        <p>
          {product?.data?.sellerDetails?.address},{product?.data?.sellerDetails?.pincode}
        </p>
        <p>{product?.data?.sellerDetails?.gstNo}</p>
      </div>
      <div className="dotted"></div>
      <div className="company">
        <p>
          Name: <span style={{ float: "right" }}>{product?.data?.buyerDetails?.name}</span>{" "}
        </p>
        <p>
          Email: <span style={{ float: "right" }}> {product?.data?.buyerDetails?.email}</span>{" "}
        </p>
        <p>
          Phone: <span style={{ float: "right" }}>{product?.data?.buyerDetails?.phone}</span>{" "}
        </p>
        <p>
          Address: <span style={{ float: "right" }}>{product?.data?.buyerDetails?.address}</span>{" "}
        </p>

        {product?.data?.buyerDetails?.gstNo && (
          <p>
            GSTIN: <span style={{ float: "right" }}>{product?.data?.buyerDetails?.gstNo}</span>{" "}
          </p>
        )}
      </div>
      <div className="dotted"></div>
      <table className="table">
        <tr>
          <td>Name</td>
          <td>Qty</td>
          <td>Price</td>
          <td>Total</td>
        </tr>
        {product?.data?.productsArr &&
          product?.data?.productsArr.length > 0 &&
          product?.data?.productsArr.map((el: any, index: number) => {
            return (
              <tr key={index}>
                <td>
                  {el.name} - {el.barCodeType}
                </td>
                <td>{el?.quantity}</td>
                <td>{el?.sellingPrice}</td>
                <td>{(Number(el.sellingPrice) * Number(el?.totalQunatity)).toFixed(2)}</td>
              </tr>
            );
          })}
      </table>
      <div className="dotted"></div>
      <div style={{ textAlign: "right" }} className="company">
        <p>
          Total Item: <b>{calculateTotalQuantity()}</b>
        </p>
        <p>
          Sub Total: <b>{product?.data?.subTotal}</b>
        </p>
        <p>
          TAX :<b>{product?.data?.totalTax}</b>
        </p>
        <p>
          Total: <b>{product?.data?.total}</b>
        </p>
      </div>
      <div className="dotted"></div>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <p>THANK YOU</p>
        <p>Glad to see you again!</p>
      </div>
    </>
  );
}
