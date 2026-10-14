# Integral RH

Plataforma integral de recursos humanos con tres portales sobre una misma base de datos:

- **Empresas** (`/empresa`): piden servicios (selección, administración de personal, legal, contabilidad, coaching, psicología y medicina laboral), conversan con el profesional asignado, siguen sus búsquedas, revisan a los candidatos presentados (informe, CV, DISC y razonamiento) y dan su feedback.
- **Candidatos** (`/candidato`): arman su perfil, suben su CV, se postulan en la bolsa de empleos pública (`/empleos`) y completan las evaluaciones que se les asignan.
- **Staff de Integral RH** (`/staff`): gestiona empresas, candidatos, procesos de selección (pipeline por etapas), solicitudes de servicio, agenda y equipo.

Hecho con Next.js 16, TypeScript, Tailwind CSS 4 y SQLite (Drizzle ORM + libSQL).

## Puesta en marcha

Requiere Node.js 22 o superior.

```bash
npm install
npm run db:reset   # crea la base en data/ y carga datos de demostración
npm run dev        # http://localhost:3000
```

## Cuentas de demostración

Todas usan la contraseña `demo1234`.

| Rol | Email |
| --- | --- |
| Staff (administración, RRHH) | `staff@integralrh.test` |
| Staff (legal, contabilidad, coaching, psicología, medicina) | `legal@`, `contabilidad@`, `coaching@`, `psicologia@`, `medicina@integralrh.test` |
| Empresa (Distribuidora del Este) | `empresa@integralrh.test` |
| Empresa (Clínica Santa Lucía) | `clinica@integralrh.test` |
| Candidata (Lucía Méndez) | `candidato@integralrh.test` |

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run lint` / `npm run typecheck` | Revisión de código y de tipos |
| `npm run db:push` | Aplica el esquema (`src/db/schema.ts`) a la base |
| `npm run db:seed` | Reemplaza los datos por los de demostración |
| `npm run db:reset` | Borra la base, la recrea y carga la demostración |
| `npm run db:studio` | Explorador visual de la base (Drizzle Studio) |

## Estructura

```
src/
  app/
    (publico)/        landing y bolsa de empleos
    (auth)/           login y registro de candidatos y empresas
    empresa/          portal de empresas
    candidato/        portal de candidatos
    staff/            portal interno
    api/cv/           subida y descarga de CV con control de permisos
  components/         interfaz compartida
  db/                 esquema, conexión y datos de demostración
  lib/
    acciones/         Server Actions (todas validan el rol del usuario)
    evaluaciones/     tests DISC y de razonamiento con su corrección
    auth.ts           sesiones en base de datos con cookie httpOnly
  proxy.ts            redirige a /login a quien entra a un portal sin sesión
```

## Reglas de privacidad

- La empresa solo ve a los candidatos que el staff le presentó, y nunca ve las notas internas.
- El candidato ve el estado de sus procesos de forma simplificada y no ve sus puntajes.
- Los CV se guardan fuera de la carpeta pública (`storage/cv`) y solo los pueden abrir el propio candidato, el staff o la empresa a la que fue presentado.

## Evaluaciones

Los tests DISC (24 grupos de adjetivos) y de razonamiento (30 preguntas en 25 minutos) son instrumentos propios de screening, escritos para este sistema. No son tests estandarizados ni tienen baremos: conviene que el área de psicología los revise o los reemplace por instrumentos licenciados antes de usarlos para decisiones formales. Las respuestas correctas y la corrección viven solo en el servidor.

## Para publicarlo

- **Base de datos:** cambiar `DATABASE_URL` por una base en la nube (por ejemplo Turso, compatible con el código actual).
- **CV:** usar un almacenamiento persistente para `storage/cv` (disco del servidor o un servicio de archivos).
- **Cuentas demo:** el cuadro con las cuentas de demostración del login solo aparece en desarrollo, o en producción si se define `MOSTRAR_DEMO=1`.

## Pendiente para próximas versiones

Liquidación de sueldos, notificaciones por email, recuperación de contraseña, facturación y publicación en internet.
