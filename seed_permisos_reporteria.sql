-- =============================================================
-- SEED: Permisos granulares por pestaña dentro de Reportería
-- Ejecutar UNA SOLA VEZ después de seed_permisos.sql
--
-- Hoy "Reportería" es todo-o-nada: con ese permiso se ven TODAS
-- las pestañas (Pacientes, Historial Clínico, Inventario, Agenda,
-- Referencias). Esto agrega un permiso por pestaña para poder,
-- por ejemplo, dejar que Farmacia vea solo Inventario.
-- =============================================================

-- 1. Hacer espacio en el orden de presentación justo después de "Reportería" (orden 7)
UPDATE permiso SET orden = orden + 5 WHERE orden > 7;

-- 2. Insertar los permisos de pestaña
INSERT INTO permiso (nombre, descripcion, ruta, icono, orden) VALUES
  ('Reportería: Pacientes',         'Pestaña de reporte de pacientes',          'reporteria-pacientes',   'fa-user-injured',  8),
  ('Reportería: Historial Clínico', 'Pestaña de reporte de historial clínico',  'reporteria-historial',   'fa-file-medical',  9),
  ('Reportería: Inventario',        'Pestaña de reporte de inventario',         'reporteria-inventario',  'fa-pills',         10),
  ('Reportería: Agenda',            'Pestaña de reporte de agenda',             'reporteria-agenda',      'fa-calendar-alt',  11),
  ('Reportería: Referencias',       'Pestaña de reporte de referencias',        'reporteria-referencias', 'fa-exchange-alt',  12)
ON CONFLICT (ruta) DO NOTHING;

-- 3. Todos los roles que ya tienen "reporteria" hoy mantienen las 4 pestañas
--    clínicas (Pacientes, Historial, Agenda, Referencias) — sin regresión.
--    Excepción explícita: Farmacia (rol 9), que solo debe ver Inventario.
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT rp.fkrol, p2.idpermiso
FROM rol_permiso rp
JOIN permiso p1 ON p1.idpermiso = rp.fkpermiso AND p1.ruta = 'reporteria'
JOIN permiso p2 ON p2.ruta IN ('reporteria-pacientes','reporteria-historial','reporteria-agenda','reporteria-referencias')
WHERE rp.fkrol <> 9
ON CONFLICT DO NOTHING;

-- 4. Pestaña Inventario: mismos roles que ya la veían antes (hardcodeado en el
--    frontend como [1,4,7,9] — Auxiliar Administrativa y Farmacia; 1 y 4 son
--    superadmin y no necesitan fila en rol_permiso).
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT v.fkrol, p.idpermiso
FROM (VALUES (7), (9)) AS v(fkrol)
JOIN permiso p ON p.ruta = 'reporteria-inventario'
ON CONFLICT DO NOTHING;

-- Verificar resultado
SELECT r.idrol, r.nombre AS rol,
       STRING_AGG(p.ruta, ', ' ORDER BY p.orden) AS pestanas_reporteria
FROM rol r
JOIN rol_permiso rp ON r.idrol = rp.fkrol
JOIN permiso p ON rp.fkpermiso = p.idpermiso
WHERE p.ruta LIKE 'reporteria%'
GROUP BY r.idrol, r.nombre
ORDER BY r.idrol;
