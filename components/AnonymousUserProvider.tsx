"use client";

import { useEffect } from "react";
import { useAnonymousUser } from "@/hooks/useAnonymousUser";

export default function AnonymousUserProvider() {
  const anonymousId = useAnonymousUser();

  useEffect(() => {
    if (!anonymousId) return;

    fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        anonymousId,
      }),
    });
  }, [anonymousId]);

  return null;
}