import React from "react";
import Styles from "./toggleButton.module.scss";

function ToggleButton({ isChecked, handleOnChange }: any) {
  return (
    <>
      <label className={Styles.switch}>
        <input type="checkbox" checked={isChecked} onChange={handleOnChange} />
        <span className={`${Styles.slider} ${Styles.round}`}></span>
      </label>
    </>
  );
}

export default ToggleButton;
