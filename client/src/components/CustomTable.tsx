import {
  PaginationState,
  TableOptions,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo } from "react";
import { Table as BTable } from "react-bootstrap";
import { GoChevronLeft, GoChevronRight, GoArrowLeft, GoArrowRight } from "react-icons/go";

import styles from "./customtable.module.scss";

import Loading from "./Loading";
import { usePathname, useSearchParams } from "next/navigation";
import { pageIndex, pageSize } from "@/common/constant_frontend.common";
import { useNavigate, useNavigateReplace } from "@/hooks/useNavigate";
import { usePagination } from "@/hooks/usePagination";

export default function CustomTable({
  columns,
  data,
  // onChangePagination,
  // pagination,
  totalCount,
  loading,
  reload,
  serverPagination,
  pageIndexKey = pageIndex,
  pageSizeKey = pageSize,
}: {
  columns: any[];
  data: any[];
  // onChangePagination?: Function;
  // pagination?: {
  //   pageIndex: number;
  //   pageSize: number;
  // };
  totalCount?: number;
  loading?: boolean;
  reload?: Function;
  serverPagination?: boolean;
  pageIndexKey?: string;
  pageSizeKey?: string;
}) {
  const final_columns = useMemo(() => columns, [columns]);
  const final_data = useMemo(() => data, [data]);

  const isReloadAvailable = useMemo(() => reload && typeof reload == "function", [reload]);

  const pathname = usePathname();
  const navigate = useNavigateReplace();

  const searchParams = useSearchParams();

  const pagination = usePagination(true, pageIndexKey, pageSizeKey);

  let reactTableObj = useMemo(() => {
    let finalObj: TableOptions<unknown> = {
      data: final_data?.length ? final_data : [],
      columns: final_columns,
      getCoreRowModel: getCoreRowModel(),
    };

    if (serverPagination && typeof totalCount == "number" && pagination) {
      const onChangePagination = (getNewPagination: any) => {
        const newVal: PaginationState = getNewPagination(pagination);
        const params = new URLSearchParams(searchParams.toString());
        params.set(pageIndexKey, String(newVal?.pageIndex));
        params.set(pageSizeKey, String(newVal?.pageSize));
        // window.history.replaceState(null, "", "?" + params.toString());
        navigate(pathname + "?" + params.toString());
      };
      // server pagination
      finalObj = {
        ...finalObj,
        pageCount: Math.ceil(totalCount / pagination?.pageSize),
        state: {
          pagination,
        },
        onPaginationChange: onChangePagination,
        manualPagination: true,
      };
    } else {
      // client auto pagination
      finalObj = {
        ...finalObj,
        getPaginationRowModel: getPaginationRowModel(),
      };
    }

    return finalObj;
  }, [
    final_data,
    final_columns,
    serverPagination,
    totalCount,
    pagination,
    navigate,
    pageIndexKey,
    pageSizeKey,
    pathname,
    searchParams,
  ]);

  const table = useReactTable(reactTableObj);

  const handleReload = () => {
    if (isReloadAvailable && reload) {
      reload();
    }
  };

  const start =
    table.getState().pagination?.pageIndex * table.getState().pagination?.pageSize +
    (table.getRowModel().rows.length > 0 ? 1 : 0);
  const end =
    table.getState().pagination?.pageIndex * table.getState().pagination?.pageSize + table.getRowModel().rows.length;

  return (
    <div>
      <div className="position-relative">
        <BTable hover responsive size="sm" style={{ minWidth: 200, marginBottom: 0 }}>
          <thead className={`table-dark ${styles.th_header_styles} `}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td className={`td_v_center ${styles.table_data}`} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {/* <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </tfoot> */}
        </BTable>
        {loading && (
          <div
            className="d-flex flex-fill align-items-center justify-content-center position-absolute top-0 left-0 h-100 w-100"
            style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
          >
            <Loading />
          </div>
        )}

        {table.getRowModel().rows.length == 0 && !loading && (
          <div className="d-flex flex-fill align-items-center justify-content-center mt-2">
            <h6 style={{ color: "#b0b0b0" }}>No Records Found</h6>
          </div>
        )}
      </div>
      {serverPagination && (
        <div
          className="d-flex align-items-center justify-content-center gap-2 mt-2"
          style={{
            paddingTop: " 12px",
            borderTop: " 1px solid #e8e8e8",
            color: "rgba(0, 0, 0, 0.54)",
            fontSize: "14px",
          }}
        >
          <div className="flex-fill"></div>
          <div style={{ fontSize: "14px" }}>Item Per Page </div>
          <div>
            <select
              className="form-select"
              aria-label="Page number"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              style={{
                fontSize: "14px",
                padding: "0.300rem 2.25rem 0.300rem 0.75rem !important",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: "14px" }}>
              {start}-{end} of {totalCount}
            </div>
          </div>
          <div>
            <button
              className="btn btn-light text-maincolor"
              onClick={() => table.getCanPreviousPage() && table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <GoChevronLeft />
            </button>
            <button
              className="btn btn-light ms-1 text-maincolor"
              onClick={() => table.getCanNextPage() && table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <GoChevronRight />
            </button>
            {/* 
            <button
              type="button"
              className="btn btn-light me-1"
              onClick={() => table.setPageIndex(0)}
              // disabled={!table.getCanPreviousPage()}
            >
              <GoArrowLeft />
            </button>
            <button
              className="btn btn-light ms-1"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              // disabled={!table.getCanNextPage()}
            >
              <GoArrowRight />
            </button> 
          */}
          </div>
        </div>
      )}
    </div>
  );
}
