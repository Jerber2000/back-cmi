-- =============================================================
-- LIMPIEZA: permisos huerfanos de paginas que ya no existen
-- (el componente "gestionclinica" que usaba estas rutas fue
-- eliminado por no tener ninguna funcionalidad real).
-- ON DELETE CASCADE en rol_permiso.fkpermiso limpia las
-- asignaciones de rol automaticamente.
-- =============================================================

DELETE FROM permiso
WHERE ruta IN (
  'administracion',
  'educacion-inclusiva',
  'fisioterapia',
  'medicina-general',
  'nutricion',
  'psicologia'
);

-- Verificar que ya no quedan (debe devolver 0 filas)
SELECT idpermiso, nombre, ruta FROM permiso
WHERE ruta IN (
  'administracion',
  'educacion-inclusiva',
  'fisioterapia',
  'medicina-general',
  'nutricion',
  'psicologia'
);
