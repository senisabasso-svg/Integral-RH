import { DIMENSIONES, GRUPOS_DISC, puntuarDisc } from "../lib/evaluaciones/disc";
import { PREGUNTAS_RAZONAMIENTO, puntuarRazonamiento } from "../lib/evaluaciones/razonamiento";
import type { Dimension, RespuestasDisc, RespuestasRazonamiento } from "../lib/evaluaciones/tipos";
import { hashPassword } from "../lib/password";
import { claveDia, parseFechaHoraLocal } from "../lib/utils";
import { db } from "./index";
import {
  citas,
  empresas,
  evaluaciones,
  mensajes,
  perfilesCandidato,
  postulaciones,
  procesos,
  sesiones,
  solicitudes,
  usuarios,
} from "./schema";

const DIA_MS = 24 * 60 * 60 * 1000;

function haceDias(dias: number) {
  return new Date(Date.now() - dias * DIA_MS);
}

function enDias(dias: number, hora: string) {
  const mediodia = new Date(`${claveDia(new Date())}T12:00:00-03:00`);
  return parseFechaHoraLocal(`${claveDia(mediodia.getTime() + dias * DIA_MS)}T${hora}`)!;
}

function respuestasDisc(principal: Dimension, secundario: Dimension): RespuestasDisc {
  const opuesto: Record<Dimension, Dimension> = { D: "S", I: "C", S: "D", C: "I" };
  const respuestas: RespuestasDisc = {};
  for (const grupo of GRUPOS_DISC) {
    const mas = grupo.id % 3 === 0 ? secundario : principal;
    const menos = opuesto[principal] === mas ? opuesto[secundario] : opuesto[principal];
    respuestas[grupo.id] = { mas: DIMENSIONES.indexOf(mas), menos: DIMENSIONES.indexOf(menos) };
  }
  return respuestas;
}

function respuestasRazonamiento(aciertos: number): RespuestasRazonamiento {
  const total = PREGUNTAS_RAZONAMIENTO.length;
  const respuestas: RespuestasRazonamiento = {};
  PREGUNTAS_RAZONAMIENTO.forEach((pregunta, i) => {
    const acierta = (i * 7) % total < aciertos;
    respuestas[pregunta.id] = acierta
      ? pregunta.correcta
      : (pregunta.correcta + 1) % pregunta.opciones.length;
  });
  return respuestas;
}

async function main() {
  for (const tabla of [
    mensajes,
    citas,
    evaluaciones,
    postulaciones,
    solicitudes,
    procesos,
    sesiones,
    perfilesCandidato,
    usuarios,
    empresas,
  ]) {
    await db.delete(tabla);
  }

  const passwordHash = await hashPassword("demo1234");

  const [laura, martin, , , valentina, diego] = await db
    .insert(usuarios)
    .values([
      { nombre: "Laura Fernández", email: "staff@integralrh.test", rol: "staff", especialidad: "rrhh", esAdmin: true, passwordHash },
      { nombre: "Martín Pereira", email: "legal@integralrh.test", rol: "staff", especialidad: "legal", passwordHash },
      { nombre: "Carolina Silva", email: "contabilidad@integralrh.test", rol: "staff", especialidad: "contabilidad", passwordHash },
      { nombre: "Andrea Gómez", email: "coaching@integralrh.test", rol: "staff", especialidad: "coaching", passwordHash },
      { nombre: "Valentina Rodríguez", email: "psicologia@integralrh.test", rol: "staff", especialidad: "psicologia", passwordHash },
      { nombre: "Diego Martínez", email: "medicina@integralrh.test", rol: "staff", especialidad: "medicina", passwordHash },
    ])
    .returning({ id: usuarios.id });

  const [distribuidora, clinica] = await db
    .insert(empresas)
    .values([
      {
        razonSocial: "Distribuidora del Este S.A.",
        rut: "217654320018",
        sector: "Logística y distribución",
        telefono: "2600 1234",
        direccion: "Ruta 8 km 17, Canelones",
        creadoEn: haceDias(40),
      },
      {
        razonSocial: "Clínica Santa Lucía",
        rut: "214455660011",
        sector: "Salud",
        telefono: "2900 5678",
        direccion: "Av. 18 de Julio 1500, Montevideo",
        creadoEn: haceDias(30),
      },
    ])
    .returning({ id: empresas.id });

  const [sofia, javier] = await db
    .insert(usuarios)
    .values([
      { nombre: "Sofía Acosta", email: "empresa@integralrh.test", rol: "empresa", empresaId: distribuidora!.id, passwordHash },
      { nombre: "Javier Núñez", email: "clinica@integralrh.test", rol: "empresa", empresaId: clinica!.id, passwordHash },
    ])
    .returning({ id: usuarios.id });

  const datosCandidatos = [
    {
      nombre: "Lucía Méndez",
      email: "candidato@integralrh.test",
      perfil: {
        documento: "4.567.890-1",
        telefono: "099 123 456",
        ciudad: "Montevideo",
        fechaNacimiento: "1994-05-12",
        profesion: "Contadora pública",
        resumen: "Cinco años de experiencia en liquidación de impuestos y cierres contables en estudios y empresas medianas.",
        disponibilidad: "30_dias" as const,
      },
    },
    {
      nombre: "Federico Castro",
      email: "federico.castro@correo.test",
      perfil: {
        documento: "3.987.654-2",
        telefono: "098 765 432",
        ciudad: "Canelones",
        fechaNacimiento: "1987-09-03",
        profesion: "Supervisor de logística",
        resumen: "Ocho años coordinando equipos de depósito y distribución. Manejo de sistemas WMS y autoelevadores.",
        disponibilidad: "inmediata" as const,
      },
    },
    {
      nombre: "Mariana López",
      email: "mariana.lopez@correo.test",
      perfil: {
        documento: "4.123.456-7",
        telefono: "091 222 333",
        ciudad: "Montevideo",
        fechaNacimiento: "1991-02-20",
        profesion: "Licenciada en Enfermería",
        resumen: "Enfermera con experiencia en CTI y emergencia móvil. Registro vigente en el MSP.",
        disponibilidad: "inmediata" as const,
      },
    },
    {
      nombre: "Santiago Ramos",
      email: "santiago.ramos@correo.test",
      perfil: {
        documento: "5.234.567-8",
        telefono: "094 555 666",
        ciudad: "Maldonado",
        fechaNacimiento: "1999-11-08",
        profesion: "Desarrollador web",
        resumen: "Desarrollador frontend con React y TypeScript. Dos años de experiencia en agencias digitales.",
        disponibilidad: "60_dias" as const,
      },
    },
    {
      nombre: "Camila Sosa",
      email: "camila.sosa@correo.test",
      perfil: {
        documento: "4.876.543-0",
        telefono: "092 444 111",
        ciudad: "Montevideo",
        fechaNacimiento: "1996-07-15",
        profesion: "Asistente administrativa",
        resumen: "Experiencia en facturación, atención a proveedores y gestión documental.",
        disponibilidad: "inmediata" as const,
      },
    },
    {
      nombre: "Nicolás Ferreira",
      email: "nicolas.ferreira@correo.test",
      perfil: {
        documento: "4.345.678-9",
        telefono: "093 888 999",
        ciudad: "Las Piedras",
        fechaNacimiento: "1993-04-27",
        profesion: "Operario de depósito",
        resumen: "Operario con carné de autoelevador y experiencia en picking y control de stock.",
        disponibilidad: "inmediata" as const,
      },
    },
  ];

  const candidatos = await db
    .insert(usuarios)
    .values(datosCandidatos.map(({ nombre, email }) => ({ nombre, email, rol: "candidato" as const, passwordHash })))
    .returning({ id: usuarios.id });
  await db
    .insert(perfilesCandidato)
    .values(datosCandidatos.map((c, i) => ({ usuarioId: candidatos[i]!.id, ...c.perfil })));
  const [lucia, federico, mariana, santiago, camila, nicolas] = candidatos.map((c) => c.id);

  const [pSupervisor, pAnalista, pEnfermeria, , pDesarrollo] = await db
    .insert(procesos)
    .values([
      {
        empresaId: distribuidora!.id,
        responsableId: laura!.id,
        titulo: "Supervisor/a de depósito",
        descripcion: "Coordinar al equipo de depósito (15 personas) en el turno matutino, asegurando la recepción, el almacenamiento y el despacho de mercadería.",
        requisitos: "Experiencia mínima de 3 años liderando equipos de depósito\nManejo de sistemas WMS\nDisponibilidad para trabajar en Canelones",
        modalidad: "presencial",
        ubicacion: "Canelones",
        vacantes: 1,
        estado: "publicado",
        creadoEn: haceDias(20),
      },
      {
        empresaId: distribuidora!.id,
        responsableId: laura!.id,
        titulo: "Analista contable",
        descripcion: "Registrar operaciones, preparar conciliaciones bancarias y colaborar con los cierres mensuales y la liquidación de impuestos.",
        requisitos: "Contador/a público/a o estudiante avanzado/a\nConocimiento de normativa DGI\nManejo avanzado de planillas de cálculo",
        modalidad: "hibrido",
        ubicacion: "Montevideo",
        vacantes: 1,
        estado: "publicado",
        creadoEn: haceDias(12),
      },
      {
        empresaId: clinica!.id,
        responsableId: laura!.id,
        titulo: "Licenciado/a en Enfermería",
        descripcion: "Incorporación para el área de internación, 36 horas semanales con rotación de turnos.",
        requisitos: "Título de Licenciado/a en Enfermería\nRegistro vigente en el MSP\nExperiencia en internación (excluyente)",
        modalidad: "presencial",
        ubicacion: "Montevideo",
        vacantes: 3,
        estado: "publicado",
        mostrarEmpresa: true,
        creadoEn: haceDias(25),
      },
      {
        empresaId: clinica!.id,
        responsableId: laura!.id,
        titulo: "Recepcionista",
        descripcion: "Atención al público, agenda de consultas y gestión de historias clínicas.",
        requisitos: "Bachillerato completo\nExperiencia en atención al público",
        modalidad: "presencial",
        ubicacion: "Montevideo",
        vacantes: 1,
        estado: "borrador",
        creadoEn: haceDias(2),
      },
      {
        empresaId: distribuidora!.id,
        responsableId: laura!.id,
        titulo: "Desarrollador/a web junior",
        descripcion: "Mantener y mejorar el portal de clientes y las herramientas internas de seguimiento de pedidos.",
        requisitos: "Conocimientos de React y TypeScript\nNociones de bases de datos SQL\nInglés técnico",
        modalidad: "remoto",
        ubicacion: "Uruguay",
        vacantes: 1,
        estado: "publicado",
        mostrarEmpresa: true,
        creadoEn: haceDias(6),
      },
    ])
    .returning({ id: procesos.id });

  await db.insert(postulaciones).values([
    {
      procesoId: pSupervisor!.id,
      candidatoId: federico!,
      etapa: "presentado",
      notaInterna: "Muy buena entrevista. Referencias laborales verificadas.",
      informeEmpresa: "Federico tiene ocho años de experiencia liderando equipos de depósito. Perfil DISC orientado a resultados con buena atención al detalle. Razonamiento por encima del promedio. Lo recomendamos para avanzar a entrevista final.",
      presentadoEn: haceDias(3),
      creadoEn: haceDias(18),
    },
    { procesoId: pSupervisor!.id, candidatoId: nicolas!, etapa: "entrevista", creadoEn: haceDias(15) },
    {
      procesoId: pSupervisor!.id,
      candidatoId: camila!,
      etapa: "descartado",
      notaInterna: "No cuenta con experiencia en depósito.",
      creadoEn: haceDias(14),
    },
    { procesoId: pAnalista!.id, candidatoId: lucia!, etapa: "evaluacion", creadoEn: haceDias(8) },
    { procesoId: pAnalista!.id, candidatoId: camila!, etapa: "preseleccionado", creadoEn: haceDias(7) },
    {
      procesoId: pEnfermeria!.id,
      candidatoId: mariana!,
      etapa: "presentado",
      informeEmpresa: "Mariana es licenciada con experiencia en CTI. Perfil estable y colaborativo, muy valorado para equipos de internación. Razonamiento alto.",
      presentadoEn: haceDias(5),
      feedbackEmpresa: "interesa",
      comentarioEmpresa: "Nos interesa coordinar una entrevista la semana próxima.",
      creadoEn: haceDias(22),
    },
    { procesoId: pDesarrollo!.id, candidatoId: santiago!, etapa: "postulado", creadoEn: haceDias(2) },
  ]);

  const completada = (candidatoId: number, dias: number) => ({
    candidatoId,
    estado: "completada" as const,
    asignadaPorId: laura!.id,
    iniciadaEn: haceDias(dias),
    completadaEn: haceDias(dias),
    creadoEn: haceDias(dias + 1),
  });

  await db.insert(evaluaciones).values([
    { ...completada(federico!, 10), tipo: "disc", respuestas: respuestasDisc("D", "C"), resultado: puntuarDisc(respuestasDisc("D", "C")) },
    { ...completada(federico!, 10), tipo: "inteligencia", respuestas: respuestasRazonamiento(22), resultado: puntuarRazonamiento(respuestasRazonamiento(22), false) },
    { ...completada(mariana!, 12), tipo: "disc", respuestas: respuestasDisc("S", "C"), resultado: puntuarDisc(respuestasDisc("S", "C")) },
    { ...completada(mariana!, 12), tipo: "inteligencia", respuestas: respuestasRazonamiento(25), resultado: puntuarRazonamiento(respuestasRazonamiento(25), false) },
    { ...completada(nicolas!, 6), tipo: "disc", respuestas: respuestasDisc("S", "D"), resultado: puntuarDisc(respuestasDisc("S", "D")) },
    { candidatoId: nicolas!, tipo: "inteligencia", asignadaPorId: laura!.id, creadoEn: haceDias(6) },
    { candidatoId: lucia!, tipo: "disc", asignadaPorId: laura!.id, creadoEn: haceDias(4) },
    { candidatoId: lucia!, tipo: "inteligencia", asignadaPorId: laura!.id, creadoEn: haceDias(4) },
  ]);

  const [sLegal, , , sPsicologia] = await db
    .insert(solicitudes)
    .values([
      {
        empresaId: distribuidora!.id,
        tipo: "legal",
        asunto: "Consulta por desvinculación de un operario",
        descripcion: "Necesitamos asesoramiento para desvincular a un operario con cuatro años de antigüedad por faltas reiteradas sin aviso.",
        estado: "en_curso",
        responsableId: martin!.id,
        creadoEn: haceDias(4),
      },
      {
        empresaId: distribuidora!.id,
        tipo: "seleccion",
        asunto: "Búsqueda de supervisor de depósito",
        descripcion: "Buscamos un supervisor para el turno matutino del depósito de Canelones.",
        estado: "resuelta",
        responsableId: laura!.id,
        procesoId: pSupervisor!.id,
        creadoEn: haceDias(21),
      },
      {
        empresaId: distribuidora!.id,
        tipo: "medicina",
        asunto: "Exámenes preocupacionales para 5 ingresos",
        descripcion: "Vamos a incorporar cinco operarios el mes próximo y necesitamos coordinar los exámenes preocupacionales.",
        estado: "nueva",
        creadoEn: haceDias(1),
      },
      {
        empresaId: clinica!.id,
        tipo: "psicologia",
        asunto: "Taller de manejo del estrés para enfermería",
        descripcion: "Queremos un taller para el equipo de enfermería de internación, unas 20 personas.",
        estado: "en_curso",
        responsableId: valentina!.id,
        creadoEn: haceDias(6),
      },
      {
        empresaId: clinica!.id,
        tipo: "contabilidad",
        asunto: "Revisión de la liquidación de IRPF",
        descripcion: "Queremos una revisión de las retenciones de IRPF del último semestre.",
        estado: "nueva",
        creadoEn: haceDias(2),
      },
    ])
    .returning({ id: solicitudes.id });

  await db.insert(mensajes).values([
    {
      solicitudId: sLegal!.id,
      autorId: sofia!.id,
      texto: "Tenemos que desvincular a un operario con cuatro años de antigüedad por reiteradas faltas sin aviso. ¿Qué pasos debemos seguir?",
      creadoEn: haceDias(4),
    },
    {
      solicitudId: sLegal!.id,
      autorId: martin!.id,
      texto: "Buenas, Sofía. Para evaluar si corresponde un despido por notoria mala conducta necesitamos el registro de faltas y las sanciones o comunicaciones previas. ¿Nos los pueden enviar?",
      creadoEn: haceDias(3),
    },
    {
      solicitudId: sLegal!.id,
      autorId: sofia!.id,
      texto: "Perfecto, el lunes les mandamos el legajo completo.",
      creadoEn: haceDias(3),
    },
    {
      solicitudId: sPsicologia!.id,
      autorId: javier!.id,
      texto: "Serían unas 20 personas del equipo de internación, idealmente en dos turnos.",
      creadoEn: haceDias(6),
    },
    {
      solicitudId: sPsicologia!.id,
      autorId: valentina!.id,
      texto: "Les propongo dos encuentros de 90 minutos con foco en manejo del estrés y prevención del burnout. Ya agendé el primero.",
      creadoEn: haceDias(5),
    },
  ]);

  await db.insert(citas).values([
    {
      tipo: "entrevista",
      titulo: "Entrevista RH: Nicolás Ferreira",
      inicio: enDias(1, "10:00"),
      duracionMin: 45,
      lugar: "Oficina de Impulso Humano",
      staffId: laura!.id,
      candidatoId: nicolas!,
      procesoId: pSupervisor!.id,
    },
    {
      tipo: "entrevista",
      titulo: "Entrevista con la empresa: Federico Castro",
      inicio: enDias(2, "15:00"),
      duracionMin: 60,
      lugar: "Distribuidora del Este, Ruta 8 km 17",
      staffId: laura!.id,
      empresaId: distribuidora!.id,
      candidatoId: federico!,
      procesoId: pSupervisor!.id,
    },
    {
      tipo: "examen_medico",
      titulo: "Examen preocupacional: Federico Castro",
      inicio: enDias(3, "09:00"),
      duracionMin: 30,
      lugar: "Consultorio de Impulso Humano",
      staffId: diego!.id,
      empresaId: distribuidora!.id,
      candidatoId: federico!,
      procesoId: pSupervisor!.id,
    },
    {
      tipo: "entrevista",
      titulo: "Entrevista con la empresa: Mariana López",
      inicio: enDias(4, "16:00"),
      duracionMin: 45,
      lugar: "Clínica Santa Lucía",
      staffId: laura!.id,
      empresaId: clinica!.id,
      candidatoId: mariana!,
      procesoId: pEnfermeria!.id,
    },
    {
      tipo: "reunion",
      titulo: "Seguimiento de la desvinculación",
      inicio: enDias(5, "11:00"),
      duracionMin: 30,
      lugar: "Videollamada",
      staffId: martin!.id,
      empresaId: distribuidora!.id,
      solicitudId: sLegal!.id,
    },
    {
      tipo: "sesion",
      titulo: "Taller de manejo del estrés (turno 1)",
      inicio: enDias(7, "14:00"),
      duracionMin: 90,
      lugar: "Clínica Santa Lucía, sala de reuniones",
      staffId: valentina!.id,
      empresaId: clinica!.id,
      solicitudId: sPsicologia!.id,
    },
  ]);
}

main()
  .then(() => {
    console.log("Datos de demostración cargados. Contraseña de todas las cuentas: demo1234");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
