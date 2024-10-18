"use client";
import logo_bw from "@/assets/img/logo_bw.png";
import { ROLES } from "@/common/constant.common";
import { useCurrentRole } from "@/customhooks/useCurrentRole";
import Image from "next/image";
import Link from "next/link";
import { ReactElement, useState } from "react";
import Collapse from "react-bootstrap/Collapse";
import { FaAngleRight } from "react-icons/fa";
import { MdMiscellaneousServices } from "react-icons/md";
import { GoHomeFill } from "react-icons/go";
import { MdLocationOn } from "react-icons/md";
import { FaUsersLine } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { MdOutlineInventory } from "react-icons/md";
import { BsBoxSeamFill } from "react-icons/bs";
import { SiMicrosoftexcel } from "react-icons/si";
import { FaRegImage } from "react-icons/fa6";
import "./style.scss";

type sidebar_item =
  | {
      Icon?: ReactElement;
      id: string;
      name: string;
      type: "url";
      url: string;
      isActive: boolean;
    }
  | {
      Icon?: ReactElement;
      id: string;
      name: string;
      type: "dropdown";
      isActive: boolean;
      subArr: {
        Icon?: ReactElement;
        id: string;
        name: string;
        type: "url";
        url: string;
      }[];
    }
  | {
      id: string;
      type: "seperator";
      isActive: boolean;
    };

const adminSideBarArr: sidebar_item[] = [
  {
    Icon: <GoHomeFill />,
    id: "dashboard",
    name: "Dashboard",
    type: "url",
    url: `/`,
    isActive: false,
  },
  {
    Icon: <MdLocationOn />,
    id: "locations",
    name: "Locations",
    type: "dropdown",
    isActive: false,
    subArr: [
      {
        id: "locations_country",
        name: "Countries",
        type: "url",
        url: `/countries`,
      },

      {
        id: "locations_state",
        name: "States",
        type: "url",
        url: `/states`,
      },
      {
        id: "locations_towns",
        name: "City",
        type: "url",
        url: `/city`,
      },
      {
        id: "locations_beats",
        name: "Areas",
        type: "url",
        url: `/area`,
      },
      {
        id: "locations_zone",
        name: "Zone",
        type: "url",
        url: `/zone`,
      },
      {
        id: "locations_port",
        name: "Port",
        type: "url",
        url: `/port`,
      },
    ],
  },
  {
    Icon: <MdOutlineInventory />,
    id: "Inventory",
    name: "Inventory",
    type: "dropdown",
    isActive: false,
    subArr: [
      {
        id: "category",
        name: "Category",
        type: "url",
        url: `/category`,
      },
      {
        id: "brand",
        name: "Brand",
        type: "url",
        url: `/brand`,
      },
      {
        id: "color",
        name: "Color",
        type: "url",
        url: `/color`,
      },
      {
        id: "size",
        name: "Size",
        type: "url",
        url: `/size`,
      },
      {
        id: "product",
        name: "Product",
        type: "url",
        url: `/product`,
      },
    ],
  },
  // {
  //   Icon: <MdOutlineInventory />,
  //   id: "Packaging",
  //   name: "Packaging",
  //   type: "dropdown",
  //   isActive: false,
  //   subArr: [
  //     {
  //       id: "Carton",
  //       name: "Carton",
  //       type: "url",
  //       url: `/carton`,
  //     },
  //     {
  //       id: "Box",
  //       name: "Box",
  //       type: "url",
  //       url: `/box`,
  //     },
  //   ],
  // },
  {
    Icon: <FaUserCircle />,
    id: "Users",
    name: "Users",
    type: "dropdown",
    isActive: false,
    subArr: [
      {
        id: "users_ADD_STORE",
        name: "ADD STORE",
        type: "url",
        url: `/users/add?role=${ROLES.STORE}`,
      },
      {
        id: "users_STORE",
        name: "STORE",
        type: "url",
        url: `/users?role=${ROLES.STORE}`,
      },
      {
        id: "users_EMPLOYEE",
        name: "EMPLOYEE",
        type: "url",
        url: `/users?role=${ROLES.EMPLOYEE}`,
      },
    ],
  },
  {
    Icon: <FaUserCircle />,
    id: "reporst",
    name: "Reports",
    type: "dropdown",
    isActive: false,
    subArr: [
      {
        id: "iStock",
        name: "Pending Order",
        type: "url",
        url: `/all-stock`,
      },
      {
        id: "Stock",
        name: "Potential Order",
        type: "url",
        url: `/stock`,
      },
    ],
  },
  {
    Icon: <FaUserCircle />,
    id: "Orders",
    name: "China Office",
    type: "dropdown",
    isActive: false,
    subArr: [
     
      {
        id: "users_Orders",
        name: "Purchase Orders",
        type: "url",
        url: `/company-order`,
      },
      {
        id: "Container",
        name: "Container",
        type: "url",
        url: `/container`,
      },
      {
        id: "ChinaWareHouse",
        name: "China WareHouse",
        type: "url",
        url: `/warehouse/stock`,
      },
      {
        id: "wahrehiuse",
        name: "WareHouse Logs",
        type: "url",
        url: `/warehouse`,
      },
    ],
  },
  {
    Icon: <FaUserCircle />,
    id: "Expense",
    name: "Expense",
    type: "dropdown",
    isActive: false,
    subArr: [
      {
        id: "users_ExpenseCategory",
        name: "Expense Category",
        type: "url",
        url: `/expense-category`,
      },
      {
        id: "users_Expense",
        name: "Expense",
        type: "url",
        url: `/expense`,
      },
    ],
  },

  {
    Icon: <FaUserCircle />,
    id: "BarCode",
    name: "BarCode",
    type: "dropdown",
    isActive: false,
    subArr: [
      {
        id: "users_BarCode",
        name: "BarCode",
        type: "url",
        url: `/barcode`,
      },
    ],
  },
];
const storeSideBarArr: sidebar_item[] = [
  {
    Icon: <FaUserCircle />,
    id: "Users",
    name: "Users",
    type: "dropdown",
    isActive: false,
    subArr: [
      // {
      //   id: "users_EMPLOYEE",
      //   name: "EMPLOYEE",
      //   type: "url",
      //   url: `/users?role=${ROLES.EMPLOYEE}`,
      // },
      {
        id: "users_SALES",
        name: "SALES",
        type: "url",
        url: `/users?role=${ROLES.SALES}`,
      },
      {
        id: "users_USER",
        name: "CUSTOMER",
        type: "url",
        url: `/users?role=${ROLES.USER}`,
      },

      {
        id: "users_USER",
        name: "STORE",
        type: "url",
        url: `/users?role=${ROLES.STORE}`,
      },
    ],
  },
  {
    Icon: <FaUserCircle />,
    id: "ProductOrder",
    name: "Purchased Order",
    type: "dropdown",
    isActive: false,
    subArr: [
      {
        id: "Stock",
        name: "Stock",
        type: "url",
        url: `/stock`,
      },
      {
        id: "users_Orders",
        name: "Purchase Orders",
        type: "url",
        url: `/product-order`,
      },
    ],
  },
  {
    Icon: <FaUserCircle />,
    id: "Orders",
    name: "Sales Orders",
    type: "dropdown",
    isActive: false,
    subArr: [
      {
        id: "users_Orders",
        name: "Sales Orders",
        type: "url",
        url: `/order`,
      },
    ],
  },
  {
    Icon: <FaUserCircle />,
    id: "Expense",
    name: "Expense",
    type: "dropdown",
    isActive: false,
    subArr: [
      {
        id: "users_Expense",
        name: "Expense",
        type: "url",
        url: `/expense`,
      },
    ],
  },
  {
    Icon: <GoHomeFill />,
    id: "payment",
    name: "Payment",
    type: "url",
    url: `/payment`,
    isActive: false,
  },
];

const salesSideBarArr: sidebar_item[] = [
  {
    Icon: <FaUserCircle />,
    id: "Users",
    name: "Users",
    type: "dropdown",
    isActive: false,
    subArr: [
      {
        id: "users_USER",
        name: "STORE",
        type: "url",
        url: `/users?role=${ROLES.STORE}`,
      },
    ],
  },

  {
    Icon: <FaUserCircle />,
    id: "Orders",
    name: "Sales Orders",
    type: "dropdown",
    isActive: false,
    subArr: [
      {
        id: "users_Orders",
        name: "Sales Orders",
        type: "url",
        url: `/order`,
      },
    ],
  },
];

function SidebarItem({ item, index }: { item: sidebar_item; index: number }) {
  const [open, setOpen] = useState(false);

  if (item.type === "seperator") {
    return <hr />;
  }

  if (item.type === "url") {
    return (
      <Link
        href={item.url}
        className="linkRemoveStyles my-1 rounded transition01 py-2 px-3 text-white cursorPointer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center ">
          <div className="d-flex ms-2 me-auto align-items-center">
            {item.Icon && <div className="m-0 me-2 icons">{item.Icon}</div>}
            <div className="d-flex justify-content-center align-items-center ">
              <div className="align-middle">{item.name}</div>
            </div>
          </div>
          {/* <FaAngleRight className={item?.isActive ? "rotate90 transition01" : "transition01"} /> */}
        </div>
      </Link>
    );
  }

  if (item.type === "dropdown") {
    return (
      <button
        className={`btn my-1 rounded py-2 px-3 text-white cursorPointer transition01 ${open && "bg-light"}`}
        onClick={() => setOpen(!open)}
      >
        <div aria-expanded={open}>
          <div
            className={`d-flex ms-2 me-auto justify-content-between align-items-center transition01  ${open && "text-maincolor item"}`}
          >
            {item.Icon && <div className="m-0 me-2 icons">{item.Icon}</div>}
            <div className={`me-auto `}>{item.name}</div>
            <FaAngleRight className={open ? "rotate90 transition01" : "transition01"} />
          </div>
          <Collapse in={open}>
            <div className="list-group generalbg my-2">
              {item.subArr.map((el: any, index: number) => (
                <SidebarItem index={index} item={el} key={el.id} />
              ))}
            </div>
          </Collapse>
        </div>
      </button>
    );
  }
  return null;
}

const useSidebar = () => {
  const role = useCurrentRole();

  if (role === ROLES.ADMIN) {
    return adminSideBarArr;
  }

  if (role === ROLES.STORE) {
    return storeSideBarArr;
  }

    if (role === ROLES.SALES) {
      return salesSideBarArr;
    }

  const arr: sidebar_item[] = [
    {
      id: "dashboard",
      name: "Dashboard",
      type: "url",
      url: "/",
      isActive: false,
    },
  ];

  return arr;
};

const Sidebar = () => {
  const sidebarArr = useSidebar();

  const [activeIndex, setActiveIndex] = useState(-1);

  const isActive = (index: number) => {
    return index === activeIndex;
  };

  const handledroplist = (index: number) => {
    if (index === activeIndex) {
      setActiveIndex(-1);
      return null;
    }
    setActiveIndex(index);
  };

  return (
    <div className="wapper_sidebar">
      <div className="sidebarfix">
        <div className="header_sidebar ">
          <div className="sidebarlogo">
            <Image src={logo_bw} alt="" height={44} width={44} />
          </div>
          <div className="name_siebar">Blessing Export</div>
          {/* <div className="bar_toggle">
            <Image src={baricon} alt="" height={18} width={25} />
          </div> */}
        </div>

        <div className="sidebar_Body">
          <div className="list-group dark">
            {sidebarArr.map((el, index) => {
              if (el.type === "seperator") {
                return <hr key={el.id} />;
              }

              if (el.type === "url") {
                return (
                  <Link
                    key={el.id}
                    href={el.url}
                    className="linkRemoveStyles my-1 rounded transition01 py-2 px-3 text-white cursorPointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="d-flex justify-content-between align-items-center ">
                      <div className="d-flex ms-2 me-auto align-items-center">
                        {el.Icon && <div className="m-0 me-2 icons">{el.Icon}</div>}
                        <div className="d-flex justify-content-center align-items-center ">
                          <div className="align-middle">{el.name}</div>
                        </div>
                      </div>
                      {/* <FaAngleRight className={el?.isActive ? "rotate90 transition01" : "transition01"} /> */}
                    </div>
                  </Link>
                );
              }

              if (el.type === "dropdown") {
                return (
                  <button
                    key={el.id}
                    className={`btn my-1 rounded py-2 px-3 text-white cursorPointer transition01 ${isActive(index) && "bg-light"}`}
                    onClick={() => handledroplist(index)}
                  >
                    <div aria-expanded={isActive(index)}>
                      <div
                        className={`d-flex ms-2 me-auto justify-content-between align-items-center transition01  ${isActive(index) && "text-maincolor item"}`}
                      >
                        {el.Icon && <div className="m-0 me-2 icons">{el.Icon}</div>}
                        <div className={`me-auto `}>{el.name}</div>
                        <FaAngleRight className={isActive(index) ? "rotate90 transition01" : "transition01"} />
                      </div>
                      <Collapse in={isActive(index)}>
                        <div
                          className={`list-group generalbg  ${el.subArr.length < 2 ? "scroll_hide" : "scroll_overflow"}`}
                        >
                          {el.subArr.map((elx: any, index: number) => (
                            <SidebarItem index={index} item={elx} key={elx.id} />
                          ))}
                        </div>
                      </Collapse>
                    </div>
                  </button>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
