"use client";
import { Suspense, useEffect, useState } from "react";
import "./stlyle.css";
import Barcode from "react-barcode";
export default function Page() {
 const [barcode, setBarcode] = useState("");
 const [nobarcode, setNobarcode] = useState(5);

  setTimeout(() => {
    window.print();
  }, 1000);

  useEffect(() => {
    if(!window || !document){
      return
    }
    const barcode = (window as any).localStorage.getItem("barncode");
    const nobarcode = window.localStorage.getItem("nobarncode");
    const barncodename = window.localStorage.getItem("barncodename");
    let mediaQueryList = window.matchMedia("print");
    (window as any).document.documentElement.style.width = "210mm";
    setBarcode(barcode)
    setNobarcode(Number(nobarcode));


    function screenTest(e: any) {
      // if (e.matches) {
      // let barCodeList = (window as any).document.getElementById("barCodeList").childNodes;
      // console.log(barCodeList.length);
      // for (let i = 0; i < barCodeList.length - 1; i = i + 2) {
      //   barCodeList[i].style.marginTop = 25 + (i + 7) + "px";
      //   barCodeList[i + 1].style.marginTop = 25 + (i + 7) + "px";
      // }
      // if (e.matches) {
      //   (window as any).document.documentElement.style.width = "210mm";
      //   (window as any).document.body.style.width = "210mm";
      //   (window as any).document.documentElement.style.width = "297mm";
      //   (window as any).document.body.style.width = "297mm";
      // } else {
      //   (window as any).document.documentElement.style.width = null;
      //   (window as any).document.body.style.width = null;
      // }
    }
    screenTest(mediaQueryList);
  }, []);
  return (
    <Suspense>
      <div className="container">
        <div className="column">
          <ul className="container1" id="barCodeList">
            {[...Array(Number(nobarcode))].map((el) => (
              <li key={el}>
                <Barcode key={el} value={`${barcode}`} displayValue={false} height={50} />
                <p>{barcode}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Suspense>
  );
}
