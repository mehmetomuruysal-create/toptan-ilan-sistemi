"use client";
import { useState } from "react";
import AddressModal from "./AddressModal";

export default function AddressButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-sm text-gray-600 hover:text-blue-600 hidden sm:inline">
        Adreslerim
      </button>
      <AddressModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}