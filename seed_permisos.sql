-- =============================================================
-- SEED: Permisos (páginas del sistema) y asignación a roles
-- Ejecutar UNA SOLA VEZ después de: npx prisma db push
-- =============================================================

-- 1. Insertar páginas del sistema
INSERT INTO permiso (nombre, descripcion, ruta, icono, orden) VALUES
  ('Gestión de Usuarios',     'Administración de usuarios del sistema',   'usuario',            'fa-users',          1),
  ('Pacientes',               'Registro y gestión de pacientes',           'pacientes',          'fa-user-injured',   2),
  ('Expedientes',             'Expedientes médicos de pacientes',          'expedientes',        'fa-folder-open',    3),
  ('Historial Clínico',       'Historial de sesiones clínicas',            'historial',          'fa-file-medical',   4),
  ('Agenda',                  'Gestión de citas y agenda',                 'agenda',             'fa-calendar-alt',   5),
  ('Referidos',               'Gestión de referidos entre clínicas',       'referidos',          'fa-exchange-alt',   6),
  ('Reportería',              'Reportes y estadísticas del sistema',       'reporteria',         'fa-chart-bar',      7),
  ('Documentos',              'Documentos institucionales',                'documentos',         'fa-file-alt',       8),
  ('Inventario',              'Inventario de medicamentos e insumos',      'inventario',         'fa-pills',          9),
  ('Salidas de Inventario',   'Registro de salidas del inventario',        'salida-inventario',  'fa-box-open',       10),
  ('Administración',          'Panel de administración de clínicas',       'administracion',     'fa-cog',            11),
  ('Educación Inclusiva',     'Módulo de educación inclusiva',             'educacion-inclusiva','fa-graduation-cap', 12),
  ('Fisioterapia',            'Módulo de fisioterapia',                    'fisioterapia',       'fa-walking',        13),
  ('Medicina General',        'Módulo de medicina general',                'medicina-general',   'fa-stethoscope',    14),
  ('Nutrición',               'Módulo de nutrición',                       'nutricion',          'fa-apple-alt',      15),
  ('Psicología',              'Módulo de psicología',                      'psicologia',         'fa-brain',          16)
ON CONFLICT (ruta) DO NOTHING;

-- 2. Asignar permisos por rol
--    NOTA: Roles 1 (Admin) y 4 (Sistemas) NO se insertan aquí.
--          Tienen acceso total por lógica de negocio (bypass en el guard y el middleware).

-- ── Rol 2: Enfermero ─────────────────────────────────────────────────────────
-- Acceso según app.routes.ts: pacientes, expedientes, historial, agenda,
--   referidos, reporteria, documentos, medicina-general
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 2, idpermiso FROM permiso
WHERE ruta IN ('pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','medicina-general')
ON CONFLICT DO NOTHING;

-- ── Rol 3: Recepcionista ─────────────────────────────────────────────────────
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 3, idpermiso FROM permiso
WHERE ruta IN ('pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','medicina-general')
ON CONFLICT DO NOTHING;

-- ── Rol 5: Fisioterapeuta ────────────────────────────────────────────────────
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 5, idpermiso FROM permiso
WHERE ruta IN ('pacientes','expedientes','historial','agenda','referidos','reporteria','documentos',
               'administracion','fisioterapia','medicina-general','educacion-inclusiva','nutricion','psicologia')
ON CONFLICT DO NOTHING;

-- ── Rol 6: Medico General ────────────────────────────────────────────────────
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 6, idpermiso FROM permiso
WHERE ruta IN ('pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','fisioterapia','medicina-general')
ON CONFLICT DO NOTHING;

-- ── Rol 7: Auxiliar Administrativa ──────────────────────────────────────────
-- Nota: rol 7 tiene acceso a usuario, inventario y salida-inventario según routes
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 7, idpermiso FROM permiso
WHERE ruta IN ('usuario','pacientes','expedientes','historial','agenda','referidos','reporteria',
               'documentos','inventario','salida-inventario')
ON CONFLICT DO NOTHING;

-- ── Rol 8: Digitador ─────────────────────────────────────────────────────────
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 8, idpermiso FROM permiso
WHERE ruta IN ('pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','administracion')
ON CONFLICT DO NOTHING;

-- ── Rol 9: Farmacia ──────────────────────────────────────────────────────────
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 9, idpermiso FROM permiso
WHERE ruta IN ('inventario','salida-inventario','reporteria')
ON CONFLICT DO NOTHING;

-- ── Rol 10: Psicólogo ────────────────────────────────────────────────────────
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 10, idpermiso FROM permiso
WHERE ruta IN ('pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','psicologia')
ON CONFLICT DO NOTHING;

-- ── Rol 11: Asistente de Psicología ─────────────────────────────────────────
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 11, idpermiso FROM permiso
WHERE ruta IN ('pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','psicologia')
ON CONFLICT DO NOTHING;

-- ── Rol 12: Odontólogo ───────────────────────────────────────────────────────
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 12, idpermiso FROM permiso
WHERE ruta IN ('pacientes','expedientes','historial','agenda','referidos','reporteria','documentos')
ON CONFLICT DO NOTHING;

-- ── Rol 13: Nutricionista ────────────────────────────────────────────────────
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 13, idpermiso FROM permiso
WHERE ruta IN ('pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','nutricion')
ON CONFLICT DO NOTHING;

-- ── Rol 14: Asistente ────────────────────────────────────────────────────────
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 14, idpermiso FROM permiso
WHERE ruta IN ('pacientes','expedientes','historial','agenda','referidos','reporteria','documentos',
               'fisioterapia','medicina-general','nutricion')
ON CONFLICT DO NOTHING;

-- ── Rol 15: Psicopedagogo ────────────────────────────────────────────────────
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 15, idpermiso FROM permiso
WHERE ruta IN ('pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','educacion-inclusiva')
ON CONFLICT DO NOTHING;

-- ── Rol 16: Asistente de Psicopedagogía ─────────────────────────────────────
INSERT INTO rol_permiso (fkrol, fkpermiso)
SELECT 16, idpermiso FROM permiso
WHERE ruta IN ('pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','educacion-inclusiva')
ON CONFLICT DO NOTHING;

-- Verificar resultado
SELECT r.idrol, r.nombre as rol,
       COUNT(rp.fkpermiso) as total_permisos,
       STRING_AGG(p.ruta, ', ' ORDER BY p.orden) as paginas
FROM rol r
LEFT JOIN rol_permiso rp ON r.idrol = rp.fkrol
LEFT JOIN permiso p ON rp.fkpermiso = p.idpermiso
WHERE r.idrol NOT IN (1,4)
GROUP BY r.idrol, r.nombre
ORDER BY r.idrol;
