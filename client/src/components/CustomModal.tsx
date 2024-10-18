import React, { Dispatch, SetStateAction } from "react";
import { Modal } from "react-bootstrap";

function CustomModal({
  show,
  setShow,
  size,
  fullScreen,
  body,
  title = "Title",
  buttonInHeader,
  buttonText,
  searchInHeader,
  buttonHandler,
  searchHandler = false,
  buttonDisabled = false,
  customStyle = {},
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  fullScreen?: true | string | "sm-down" | "md-down" | "lg-down" | "xl-down" | "xxl-down";
  size?: "lg" | "sm" | "xl";
  body?: any;
  title?: string;
  buttonInHeader?: boolean;
  buttonText?: string;
  /**
   * Search not yet added..
   */
  searchInHeader?: boolean;
  buttonHandler?: any;
  searchHandler?: any;
  buttonDisabled?: boolean;
  customStyle?: any;
}) {
  return (
    <Modal
      show={show}
      size={size}
      fullscreen={fullScreen}
      centered
      backdrop="static"
      keyboard={false}
      onHide={() => setShow(false)}
      style={customStyle}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
        {buttonInHeader && (
          <button className="btn btn-maincolor mx-3" onClick={() => buttonHandler()} disabled={buttonDisabled}>
            {buttonText}
          </button>
        )}
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
    </Modal>
  );
}

export default CustomModal;
