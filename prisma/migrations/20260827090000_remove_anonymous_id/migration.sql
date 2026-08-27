/*
  Remove anonymousId from Usuario.

  anonymousId is no longer used.
*/

DROP INDEX IF EXISTS "Usuario_anonymousId_key";

ALTER TABLE "Usuario"
DROP COLUMN IF EXISTS "anonymousId";