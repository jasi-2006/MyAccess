-- Ejecutar en TiDB/MySQL si photo_data no existe (error 500 al subir foto)
ALTER TABLE user_profile
  ADD COLUMN IF NOT EXISTS photo_data LONGBLOB NULL,
  ADD COLUMN IF NOT EXISTS photo_content_type VARCHAR(100) NULL;
