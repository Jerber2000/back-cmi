-- =============================================================
-- SEED: Permisos de botones que antes tenian roles hardcodeados
-- Ejecutar UNA SOLA VEZ. Usa nombres de rol (no IDs numericos) porque
-- el mapeo de idrol a nombre difiere entre entornos (local vs produccion).
-- =============================================================

-- 1. Hacer espacio en el orden de presentacion (despues de los permisos existentes)
UPDATE permiso SET orden = orden + 4 WHERE orden > 16;

-- 2. Insertar los 4 permisos de boton
INSERT INTO permiso (nombre, descripcion, ruta, icono, orden) VALUES
  ('Expedientes: Programas',        'Boton de gestion de programas dentro de Expedientes',                 'expedientes-programas',    'fa-clipboard-list',    17),
  ('Historial: Examen Mental',      'Boton de examen mental (psicologia) dentro de Historial Clinico',     'historial-examen-mental',  'fa-brain',             18),
  ('Agenda: Transporte',            'Boton de reporte de transportes dentro de Agenda',                     'agenda-transporte',        'fa-bus',               19),
  ('Agenda: Ver Historial Clinico', 'Boton para ver historial clinico desde el modal de una cita',         'agenda-historial-clinico', 'fa-file-medical-alt',  20)
ON CONFLICT (ruta) DO NOTHING;

-- 3. Asignar por nombre de rol (Administrador y Sistemas tienen bypass de superadmin
--    en el codigo, pero se incluyen aqui tambien por si ese bypass cambia)

-- Expedientes: Programas -> Administrador, Sistemas, Auxiliar Administrativa
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT r.idrol, p.idpermiso FROM rol r, permiso p
WHERE p.ruta = 'expedientes-programas' AND r.nombre IN ('Administrador','Sistemas','Auxiliar Administrativa')
ON CONFLICT DO NOTHING;

-- Historial: Examen Mental -> Administrador, Sistemas, Psicologo, Auxiliar Administrativa
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT r.idrol, p.idpermiso FROM rol r, permiso p
WHERE p.ruta = 'historial-examen-mental' AND r.nombre IN ('Administrador','Sistemas','Psicólogo','Auxiliar Administrativa')
ON CONFLICT DO NOTHING;

-- Agenda: Transporte -> Administrador, Sistemas, Auxiliar Administrativa
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT r.idrol, p.idpermiso FROM rol r, permiso p
WHERE p.ruta = 'agenda-transporte' AND r.nombre IN ('Administrador','Sistemas','Auxiliar Administrativa')
ON CONFLICT DO NOTHING;

-- Agenda: Ver Historial Clinico -> todos los roles EXCEPTO Farmacia
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT r.idrol, p.idpermiso FROM rol r, permiso p
WHERE p.ruta = 'agenda-historial-clinico' AND r.nombre <> 'Farmacia'
ON CONFLICT DO NOTHING;

-- Verificar resultado
SELECT r.nombre AS rol, STRING_AGG(p.ruta, ', ' ORDER BY p.orden) AS permisos
FROM rol r
JOIN rol_permiso rp ON r.idrol = rp.fkrol
JOIN permiso p ON rp.fkpermiso = p.idpermiso
WHERE p.ruta IN ('expedientes-programas','historial-examen-mental','agenda-transporte','agenda-historial-clinico')
GROUP BY r.nombre
ORDER BY r.nombre;
