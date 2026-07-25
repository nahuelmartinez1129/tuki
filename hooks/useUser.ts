"use client";

import { useEffect, useState } from "react";

export function useUser() {
  const [phone, setPhone] =
    useState<string | null>(null);

  const [name, setName] =
    useState<string | null>(null);

  function loadUser() {
    setPhone(
      localStorage.getItem(
        "tuki_user_phone"
      )
    );

    setName(
      localStorage.getItem(
        "tuki_user_name"
      )
    );
  }

  useEffect(() => {
    loadUser();

    window.addEventListener(
      "userChanged",
      loadUser
    );

    return () => {
      window.removeEventListener(
        "userChanged",
        loadUser
      );
    };
  }, []);

  return {
    phone,
    name,
  };
}