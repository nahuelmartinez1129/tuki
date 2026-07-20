"use client";

import { useEffect, useState } from "react";
import { getAnonymousUserId } from "@/lib/anonymous-user";

export function useAnonymousUser() {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    setId(getAnonymousUserId());
  }, []);

  return id;
}