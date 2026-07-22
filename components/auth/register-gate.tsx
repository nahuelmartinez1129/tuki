"use client";

import { useEffect, useState } from "react";
import { RegisterModal } from "./register-modal";

export function RegisterGate() {
  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    const phone =
      localStorage.getItem(
        "tuki_user_phone"
      );

    if (!phone) {
      setOpen(true);
    }
  }, []);

  return (
    <RegisterModal
      open={open}
      onClose={() =>
        setOpen(false)
      }
    />
  );
}