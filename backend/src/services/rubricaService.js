import { PrismaClient } from '@prisma/client';
import { errorConEstado } from './proyectoService.js';

const prisma = new PrismaClient();
const exigirDocente = (usuario) => {
  if (usuario?.rol !== 'docente') throw errorConEstado('Solo los docentes pueden gestionar rúbricas', 403);
};
const incluir = { criterios: true, docente: { select: { id_usuario: true, nombre: true, correo: true } } };

export const crearRubrica = async (data, usuario) => {
  exigirDocente(usuario);
  return prisma.rubrica.create({ data: { nombre: data.nombre, descripcion: data.descripcion, id_docente: usuario.id_usuario, criterios: { create: data.criterios } }, include: incluir });
};

export const obtenerRubrica = async (id) => {
  const rubrica = await prisma.rubrica.findUnique({ where: { id_rubrica: id }, include: incluir });
  if (!rubrica) throw errorConEstado('Rúbrica no encontrada', 404);
  return rubrica;
};

export const listarRubricas = (usuario) => prisma.rubrica.findMany({ where: usuario.rol === 'docente' ? { id_docente: usuario.id_usuario } : { activa: true }, include: incluir, orderBy: { fecha_creacion: 'desc' } });

const exigirEditable = async (id, usuario) => {
  exigirDocente(usuario);
  const rubrica = await prisma.rubrica.findUnique({ where: { id_rubrica: id }, include: { evaluaciones: true } });
  if (!rubrica) throw errorConEstado('Rúbrica no encontrada', 404);
  if (rubrica.id_docente !== usuario.id_usuario) throw errorConEstado('No tiene permisos para modificar esta rúbrica', 403);
  if (rubrica.evaluaciones.length) throw errorConEstado('La rúbrica no puede modificarse porque ya fue usada en una evaluación');
  return rubrica;
};

export const actualizarRubrica = async (id, data, usuario) => {
  await exigirEditable(id, usuario);
  return prisma.$transaction(async (tx) => {
    await tx.criterioRubrica.deleteMany({ where: { id_rubrica: id } });
    return tx.rubrica.update({ where: { id_rubrica: id }, data: { nombre: data.nombre, descripcion: data.descripcion, criterios: { create: data.criterios } }, include: incluir });
  });
};

export const desactivarRubrica = async (id, usuario) => {
  await exigirEditable(id, usuario);
  return prisma.rubrica.update({ where: { id_rubrica: id }, data: { activa: false }, include: incluir });
};
