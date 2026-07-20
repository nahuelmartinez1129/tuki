import { v4 as uuid } from "uuid";

const STORAGE_KEY = "tuki_user_id";

export function getAnonymousUserId() {
  if (typeof window === "undefined") {
    return null;
  }

  let id = localStorage.getItem(STORAGE_KEY);

  if (!id) {
    id = uuid();
    localStorage.setItem(STORAGE_KEY, id);
  }

  return id;
}