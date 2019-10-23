import React, { useState, useImperativeHandle } from "react";
import ToastMessage from "./toast-message.component";

export default React.forwardRef(function ToastMessages(
  props: ToastMessagesProperties,
  ref
) {
  const [toasts, setToasts] = useState([]);
  const removeMessage = (removedToast: Toast) =>
    setToasts(toasts.filter(toast => toast.message !== removedToast.message));

  useImperativeHandle(ref, () => {
    return {
      add(newToast) {
        setToasts([...toasts, newToast]);
      }
    };
  });

  return (
    <>
      {toasts.map(toast => {
        return (
          <ToastMessage
            key={toast.type + toast.message}
            {...toast}
            onClose={() => removeMessage(toast)}
          ></ToastMessage>
        );
      })}
    </>
  );
});

type ToastMessagesProperties = {};

type Toast = {
  type: string;
  message: string;
};
