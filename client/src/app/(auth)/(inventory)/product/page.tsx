"use client";
import Link from "next/link";
import { useLoading, useProcessData } from "@/hooks/useProcessDataForTable";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import CustomTable from "@/components/CustomTable";
import SetHeaderName from "@/components/SetHeaderName";
import { IProduct, useProduct, useUpdateProductIsFocused } from "@/services/product.service";
import { toastError, toastSuccess } from "@/utils/toast";
import ToggleButton from "./_components/ToggleButton";
import { GoPencil } from "react-icons/go";
import { useBrand } from "@/services/brand.service";
import { useColor } from "@/services/color.service";
import { useSize } from "@/services/size.service";
import Select from 'react-select';

export default function Page() {
  const Item = "Product";
    const [size, setSize] = useState<any>({
      label: "Please Select Size",
      value: "",
    });
    const [color, setColor] = useState<any>({
      label: "Please Select Color",
      value: "",
    });
    const [brand, setBrand] = useState<any>({
      label: "Please Select Brand",
      value: "",
    });
    //DATA Products
    const searchObj = useMemo(() => {
      let obj: any = {};

      if (size && size?.value != "") {
        obj.size = size?.value;
      }
      if (color && color?.value != "") {
        obj.color = color?.value;
      }
      if (brand && brand?.value != "") {
        obj.brand = brand?.value;
      }
      return obj;
    }, [ size, color, brand]);

    const { data: brands } = useBrand({ pageSize: 1000, pageIndex: 0 }, false);
    const processedBrandData = useProcessData(brands);

    const { data: colors } = useColor({ pageSize: 1000, pageIndex: 0 }, false);
    const processedColorData = useProcessData(colors);

    const { data: sizes } = useSize({ pageSize: 1000, pageIndex: 0 }, false);
    const processedSizeData = useProcessData(sizes);
  //DATA Products
  const { data: products, isFetching, isLoading, refetch } = useProduct(searchObj, true);
  const processedProducts = useProcessData(products);
  const loading = useLoading(isFetching, isLoading);

  //MUTANTS
  const { mutateAsync: updateProductIsFocused } = useUpdateProductIsFocused();

  //TABLE COLUMNS: Products
  const columns = useMemo(() => {
    let cols: ColumnDef<IProduct>[] = [
      {
        header: "SKU Code",
        accessorFn: (row) => row?.skuCode,
        id: "SKU Code",
      },
      {
        header: "Name",
        accessorFn: (row) => row?.name,
        id: "name",
      },

      {
        header: "",
        cell: ({ row: { original: row } }) => {
          return (
            <Link role="button" href={`/product/update?id=${row?._id}`}>
              <GoPencil />
            </Link>
          );
        },
        id: "action",
      },
    ];
    return cols;
  }, []);

  //HANDLERS
  const handleIsFocuseToggle = async (productId: string, e: any) => {
    try {
      const res = await updateProductIsFocused({ productId, isFocused: e.target.checked });
      if (res?.data) {
        toastSuccess(res.data.message);
      }
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <div className="row">
      <div className="col">
        <div className="global_shadow_border global_padding">
          <div className="d-flex align-items-center mb-2">
            <SetHeaderName name="Product" />
            <div className="flex-fill d-flex ">
              <h5 className="mt-2 me-4">Size: </h5>
              <Select
                instanceId={"sizeId"}
                options={processedSizeData.rows.map((el) => ({ label: el.name, value: el._id }))}
                isSearchable={true}
                isLoading={processedSizeData.rows.length === 0}
                value={size}
                onChange={(val) => setSize(val)}
              />
            </div>

            <div className="flex-fill d-flex ">
              <h5 className="mt-2 me-4">Color: </h5>
              <Select
                instanceId={"colorId"}
                options={processedColorData.rows.map((el) => ({ label: el.name, value: el._id }))}
                isSearchable={true}
                isLoading={processedColorData.rows.length === 0}
                value={color}
                onChange={(val) => setColor(val)}
              />
            </div>
            <div className="flex-fill d-flex ">
              <h5 className="mt-2 me-4">Brand: </h5>
              <Select
                instanceId={"brandId"}
                options={processedBrandData.rows.map((el) => ({ label: el.name, value: el._id }))}
                isSearchable={true}
                isLoading={processedBrandData.rows.length === 0}
                value={brand}
                onChange={(val) => setBrand(val)}
              />
            </div>
            <div>
              <Link href={`/product/add`} className="btn btn-maincolor">
                Add {Item} +
              </Link>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <CustomTable
                columns={columns}
                data={processedProducts.rows}
                reload={refetch}
                totalCount={processedProducts.total}
                loading={loading}
                serverPagination
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
