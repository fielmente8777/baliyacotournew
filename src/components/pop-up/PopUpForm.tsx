"use client";
import { useWebContext } from "@/context-api/WebContext";
import { MdClose } from "react-icons/md";
import Form1 from "../forms/Form1";

const PopUpForm = () => {
  const { isOpenFormPopUp, setIsOpenFormPopUp } = useWebContext();
  return (
    <section
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${isOpenFormPopUp ? "visible opacity-100" : "invisible opacity-0"} `}
    >
      <div className="max-w-md w-full p-4 bg-white relative rounded-2xl">
        <button
          onClick={() => setIsOpenFormPopUp(false)}
          className="absolute top-4 right-4 text-2xl text-primary"
        >
          <MdClose />
        </button>
        <div className="max-md:overflow-y-scroll hide-scroll mt-6">
          <Form1 gridView />
        </div>
      </div>
    </section>
  );
};

export default PopUpForm;
