import { useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
  buttonText: string;
  closeByClickBackground?: boolean;
}

const Modal = ({
  children,
  buttonText,
  closeByClickBackground = true,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  if (!isOpen) {
    return <button onClick={open}>{buttonText}</button>;
  }

  const elementModal = (
    <div className="fixed left-0 top-0 z-20 flex h-full w-full items-center justify-center">
      <div className="relative z-10 max-h-[90vw] w-[70vw] max-w-[600px] bg-white p-[40px]">
        <div className="flex justify-end">
          <button onClick={close}>Close</button>
        </div>
        {children}
      </div>
      {closeByClickBackground && (
        <div
          className="absolute left-0 top-0 h-full w-full bg-black bg-opacity-50"
          onClick={close}
        />
      )}
    </div>
  );
  return createPortal(elementModal, document.body);
};

export default Modal;
