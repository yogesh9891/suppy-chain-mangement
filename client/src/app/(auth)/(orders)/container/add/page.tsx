"use client";
import Link from "next/link";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/utils/toast";
import { useNavigate } from "@/hooks/useNavigate";
import Select from "react-select";
import { useProcessData } from "@/hooks/useProcessDataForTable";
import { useZodResolver } from "@/hooks/useZod";
import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import SetHeaderName from "@/components/SetHeaderName";

import { useAddOrder } from "@/services/order.service";
import { BARCODE_TYPE, ORDER_STATUS, ROLES } from "@/common/constant.common";
import { useUser } from "@/services/user.service";
import { FaInfoCircle, FaTrash } from "react-icons/fa";
import { IBarCodesStock, useBarCodeWithProduct } from "@/services/barcode.service";
import { useAddContainer, useWareHouse } from "@/services/container.service";
import { useCurrentRole } from "@/customhooks/useCurrentRole";
import {  getStockProduct, IProductStock, useProductStock } from "@/services/productStock.service";
import { useBrand } from "@/services/brand.service";
import { useColor } from "@/services/color.service";
import { useSize } from "@/services/size.service";
import { useProduct } from "@/services/product.service";
import { useCompanyProductStock } from "@/services/companyOrder.service";
export default function Page() {
  //IMPORTS
  const zodResolver: any = useZodResolver();
  const role = useCurrentRole();

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [isGst, setIsGst] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [showProducts, setShowProducts] = useState(false);
  const [showWareHouse, setshowWareHouse] = useState(false);

  const [sizeArr, setSizeArr] = useState<any>();
  const [colorArr, setColorArr] = useState<any>();
  const [brandArr, setBrandArr] = useState<any>();
  
    
  const searchObj = useMemo(() => {
    let obj: any = {};
    obj.pageSize = 10000;
    obj.page = false;
    if (sizeArr && sizeArr?.value) {
      obj.size = sizeArr.value;
       obj.page = true;
    }
    if (colorArr && colorArr?.value) {
      obj.color = colorArr.value;
       obj.page = true;

    }
    if (brandArr && brandArr?.value) {
      obj.brand = brandArr.value;
       obj.page = true;
    }
    return obj;
  }, [sizeArr, colorArr, brandArr]);


  const { data: brands } = useBrand({ pageSize: 1000, pageIndex: 0 }, false);
  const processedBrandData = useProcessData(brands);

  const { data: colors } = useColor({ pageSize: 1000, pageIndex: 0 }, false);
  const processedColorData = useProcessData(colors);

  const { data: sizes } = useSize({ pageSize: 1000, pageIndex: 0 }, false);
  
  const processedSizeData = useProcessData(sizes);
  const [containerType, setContainerType] = useState("CONTAINER");
  const { data: products, isFetching, isLoading, refetch } = useCompanyProductStock(searchObj, false);


  const { data: wareproducts } = useWareHouse(searchObj, true, searchObj.page);

  const [productArr, setProductArr] = useState<any[]>([]);
  const [allProductArr, setAllProductArr] = useState<any[]>([]);
    const [productWareHouseArr, setProductWareHouseArr] = useState<any[]>([]);
    const [allwareHouseProductArr, setAllProductWareHouseArr] = useState<any[]>([]);
  const { mutateAsync } = useAddContainer();
  const { data: users } = useUser({ role: ROLES.VENDOR, isVendor: true });
  const processedUsers = useProcessData(users);
  const [user, setUser] = useState({
    label: "Please Search User",
    value: "",
  });

  //STATES

  const [isMounted, setIsMounted] = useState(false);

  //HOOK_FORM
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setError,
    reset,
  } = useForm();

  //DATA

  useEffect(() => setIsMounted(true), []);



  useEffect(() => {
    if (products && products?.data  && containerType == "CONTAINER") {
      let productA = products.data.map((el) => ({
        ...el,
        quantity: "",
        productId: el._id,
        stock: (el.totalQuantity - el.totalTransitItems),
        type: "CONTAINER",
      }));
      setAllProductArr(productA);
    } else {
      setAllProductArr([]);
    }
  }, [products]);


  
  useEffect(() => {
    if (wareproducts && wareproducts?.data && containerType == "WAREHOUSE") {
      let productA = wareproducts.data.map((el) => ({ ...el,stock:el.quantity, quantity: "", type: "WAREHOUSE" }));
      setAllProductWareHouseArr(productA);
    } else {
      setAllProductWareHouseArr([])
    }
  }, [wareproducts]);



  const onSubmit = async () => {
    try {
    

      // if (!productArr.every((el) => Number(el.price) >= Number(el.msp))) {
      //   toastError("Price must be More Than Msp");
      //   return 0;
      // }
      if (productArr?.length == 0) {
        toastError("Plsease Add Product");
        return 0
      }
      
       if (!name || name == "") {
         toastError("Please Select Name");
         return 0;
       }


      let obj: any = {
        orderedToId: user?.value,
        productsArr: productArr,
        name
      };
      const res = await mutateAsync(obj);
      if (res.data.data) {
        toastSuccess(res.data.message);
      }
      // navigate("/container/" + res.data.data?._id);
      reset();
    } catch (error) {
      toastError(error);
    }
  };

  //STYLE
  const styling = {
    control: (base: any) => ({
      ...base,
      border: "1px solid #D9D9D9 !important",
      boxShadow: "0 !important",
      position: "relative",
      padding: "6px 10px !important",

      "&:hover": {
        border: "1px solid #D9D9D9 !important",
      },
    }),

    option: (base: any, { isFocused, isSelected }: any) => ({
      ...base,
      color: "#09021C !important",
      fontSize: "14px !important",
      fontWeight: "400 !important",
      background: isFocused
        ? "rgba(237, 237, 237, 1) !important"
        : isSelected
          ? "rgba(237, 237, 237, 1) !important"
          : "white",
      cursor: "pointer !important",
    }),

    menu: (base: any) => ({
      ...base,
      zIndex: "2 !important",
      position: "absolute !important",
    }),
  };
  const handleValueChange = (index: number, value: number, key: string) => {
    if (!(value < 0)) {
      let tempArr: any = productArr;

      if ( key == "quantity") {
        let totalStock = tempArr[index]["stock"];
        if (Number(value) > Number(totalStock)) {
          toastError("Quantity exceeds available stock");
          return 0;
        }
      }
      tempArr[index][key] = value;
      setProductArr([...tempArr]);
    }
  };

  const calculateTotalQuantity = () => {
    return productArr.reduce((acc, el) => acc + Number(el.quantity), 0).toFixed(0);
  };


  const handleRemove = (indexRemve:number) => {
    setProductArr(productArr.filter((_, index) => index !== indexRemve));
  }
  const handleFromAllRemove = (indexRemve: number) => {
    setAllProductArr(allProductArr.filter((_, index) => index !== indexRemve));
  };


  const handelShowModal = () => {
    
    setSizeArr(null);
    setColorArr(null);
    setBrandArr(null);
    setAllProductArr([])
    setContainerType("CONTAINER")
    setShowProducts(true)
    
  }

  const handelWareHOuseModal = () => {
      
      setSizeArr(null);
      setColorArr(null);
      setBrandArr(null);
    setAllProductWareHouseArr([]);
    setContainerType("WAREHOUSE")
      setshowWareHouse(true);
    };


  const handleAllPorducts = () => {
    if (showProducts) {
      setProductArr([...productArr, ...allProductArr]);
        setShowProducts(false);
        setAllProductArr([]);
      }
     if (showWareHouse) {
       setProductArr([...productArr, ...allwareHouseProductArr]);
       setAllProductWareHouseArr([])
     }
      setSizeArr(null);
      setColorArr(null);
      setBrandArr(null);
  }
  return (
    <div className="row">
      <form className="col" onSubmit={handleSubmit(onSubmit)}>
        <div className="global_shadow_border global_padding">
          <SetHeaderName name="Add Inhouse Order" />
          <div className="row ">
            <div className="col">
              <div className="d-flex align-items-center">
                <div className="flex-fill">{/* <h4 className="mb-0">Add Product</h4> */}</div>
                <div>
                  <Link href={`/container`} className="btn btn-maincolor">
                    View Container
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="row">
              <div className="col-md-10">
                <Form.Group className="mb-4 position-relative" controlId="name">
                  <Form.Label
                    style={{
                      position: "absolute",
                      zIndex: "1",
                      background: "#fff",
                      top: "-13px",
                      left: "12px",
                      padding: "0px 5px",
                    }}
                  >
                    User
                  </Form.Label>
                  {isMounted && (
                    <Select
                      options={[
                        ...processedUsers.rows.map((el) => {
                          return {
                            ...el,
                            label: `${el.name} - ${el.storeName} - ${el.phone}`,
                            value: el?._id,
                          };
                        }),
                      ]}
                      styles={styling}
                      isClearable={false}
                      value={user}
                      onChange={(val: any) => {
                        if (val?.gstNo) {
                          setIsGst(true);
                        } else {
                          setIsGst(false);
                        }
                        console.log(val?.gstNo, "dsfsdfsfdfsd");

                        setUser(val);
                      }}
                    />
                  )}
                </Form.Group>
              </div>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-md-4">
              <label>Container Name</label>
              <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="col-md-4 mt-4">
              <button type="button" className="btn btn-maincolor" onClick={() => handelShowModal()}>
                Add Products
              </button>
            </div>
            <div className="col-md-4 mt-4">
              <button type="button" className="btn btn-maincolor" onClick={() => handelWareHOuseModal()}>
                Add Warehouse Products
              </button>
            </div>
            <div className="col-md-12">
              <hr />
              <div className="row">
                <div className="col-12">
                  <h5 className="blue-1 m-0">Selected Product List</h5>
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col"> Packet X Box</th>
                        <th scope="col"> Total Packet Carton</th>
                        <th scope="col">No of Carton</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productArr &&
                        productArr.length > 0 &&
                        productArr.map((el, index) => {
                          return (
                            <tr key={index}>
                              <th scope="row">{el.name}</th>
                              <td>
                                {Number(el?.packet)} X {Number(el?.box)}{" "}
                              </td>
                              <td> {Number(el?.packet) * Number(el?.box)}</td>

                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  onChange={(e) => handleValueChange(index, Number(e.target.value), "quantity")}
                                  value={el?.quantity}
                                />
                              </td>
                              <td>
                                <FaTrash onClick={() => handleRemove(index)} color="red" />
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="col-8"></div>
            <div className="col-4" style={{ borderLeft: "solid 1px rgba(0,0,0,0.1)" }}>
              <h5 className="blue-1 m-0">Summary</h5>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Total Carton</th>
                    <th scope="col">{calculateTotalQuantity()}</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="row mt-3">
              <div className="col">
                <button type="submit" className="btn btn-maincolor">
                  {!isSubmitting ? "Submit" : "Loading..."}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <Modal show={showProducts} onHide={() => setShowProducts(false)} size="lg" centered>
        <>
          <Modal.Header closeButton>
            <Modal.Title>Add Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-4 position-relative" controlId="name">
                  <Form.Label
                    style={{
                      position: "absolute",
                      zIndex: "1",
                      background: "#fff",
                      top: "-13px",
                      left: "12px",
                      padding: "0px 5px",
                    }}
                  >
                    Size
                  </Form.Label>
                  <Select
                    instanceId={"sizeId"}
                    options={processedSizeData.rows.map((el) => ({ label: el.name, value: el._id }))}
                    isSearchable={true}
                    isLoading={processedSizeData.rows.length === 0}
                    value={sizeArr}
                    onChange={(val) => setSizeArr(val)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-4 position-relative" controlId="name">
                  <Form.Label
                    style={{
                      position: "absolute",
                      zIndex: "1",
                      background: "#fff",
                      top: "-13px",
                      left: "12px",
                      padding: "0px 5px",
                    }}
                  >
                    Color
                  </Form.Label>
                  <Select
                    instanceId={"colorId"}
                    options={processedColorData.rows.map((el) => ({ label: el.name, value: el._id }))}
                    isSearchable={true}
                    isLoading={processedColorData.rows.length === 0}
                    value={colorArr}
                    onChange={(val) => setColorArr(val)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-4 position-relative" controlId="name">
                  <Form.Label
                    style={{
                      position: "absolute",
                      zIndex: "1",
                      background: "#fff",
                      top: "-13px",
                      left: "12px",
                      padding: "0px 5px",
                    }}
                  >
                    Brand
                  </Form.Label>
                  <Select
                    instanceId={"brandId"}
                    options={processedBrandData.rows.map((el) => ({ label: el.name, value: el._id }))}
                    isSearchable={true}
                    isLoading={processedBrandData.rows.length === 0}
                    value={brandArr}
                    onChange={(val) => setBrandArr(val)}
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <h5 className="blue-1 m-0">Selected Product List</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col"> Packet X Box</th>
                      <th scope="col"> Total Packet Carton</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProductArr &&
                      allProductArr.length > 0 &&
                      allProductArr.map((el, index) => {
                        return (
                          <tr key={index}>
                            <th scope="row">{el.name}</th>
                            <td>
                              {Number(el?.packet)} X {Number(el?.box)}{" "}
                            </td>
                            <td> {Number(el?.packet) * Number(el?.box)}</td>
                            <td>
                              <FaTrash onClick={() => handleFromAllRemove(index)} color="red" />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <div className="col-md-12">
                <button type="button" className="btn btn-maincolor" onClick={() => handleAllPorducts()}>
                  Add All Products
                </button>
              </div>
            </div>
          </Modal.Body>
        </>
      </Modal>
      <Modal show={showWareHouse} onHide={() => setshowWareHouse(false)} size="lg" centered>
        <>
          <Modal.Header closeButton>
            <Modal.Title>Add Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-4 position-relative" controlId="name">
                  <Form.Label
                    style={{
                      position: "absolute",
                      zIndex: "1",
                      background: "#fff",
                      top: "-13px",
                      left: "12px",
                      padding: "0px 5px",
                    }}
                  >
                    Size
                  </Form.Label>
                  <Select
                    instanceId={"sizeId"}
                    options={processedSizeData.rows.map((el) => ({ label: el.name, value: el._id }))}
                    isSearchable={true}
                    isLoading={processedSizeData.rows.length === 0}
                    value={sizeArr}
                    onChange={(val) => setSizeArr(val)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-4 position-relative" controlId="name">
                  <Form.Label
                    style={{
                      position: "absolute",
                      zIndex: "1",
                      background: "#fff",
                      top: "-13px",
                      left: "12px",
                      padding: "0px 5px",
                    }}
                  >
                    Color
                  </Form.Label>
                  <Select
                    instanceId={"colorId"}
                    options={processedColorData.rows.map((el) => ({ label: el.name, value: el._id }))}
                    isSearchable={true}
                    isLoading={processedColorData.rows.length === 0}
                    value={colorArr}
                    onChange={(val) => setColorArr(val)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-4 position-relative" controlId="name">
                  <Form.Label
                    style={{
                      position: "absolute",
                      zIndex: "1",
                      background: "#fff",
                      top: "-13px",
                      left: "12px",
                      padding: "0px 5px",
                    }}
                  >
                    Brand
                  </Form.Label>
                  <Select
                    instanceId={"brandId"}
                    options={processedBrandData.rows.map((el) => ({ label: el.name, value: el._id }))}
                    isSearchable={true}
                    isLoading={processedBrandData.rows.length === 0}
                    value={brandArr}
                    onChange={(val) => setBrandArr(val)}
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <h5 className="blue-1 m-0">Selected Product List</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Name</th> 
                      <th scope="col"> Packet X Box</th>
                      <th scope="col"> Total Packet Carton</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allwareHouseProductArr &&
                      allwareHouseProductArr.length > 0 &&
                      allwareHouseProductArr.map((el, index) => {
                        return (
                          <tr key={index}>
                            <th scope="row">{el.name}</th>
                            <td>
                              {Number(el?.packet)} X {Number(el?.box)}{" "}
                            </td>
                            <td> {Number(el?.packet) * Number(el?.box)}</td>
                            <td>
                              <FaTrash onClick={() => handleFromAllRemove(index)} color="red" />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <div className="col-md-12">
                <button type="button" className="btn btn-maincolor" onClick={() => handleAllPorducts()}>
                  Add All Products
                </button>
              </div>
            </div>
          </Modal.Body>
        </>
      </Modal>
    </div>
  );
}
