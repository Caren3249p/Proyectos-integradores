import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@upb.edu.co';
  
  const existe = await prisma.usuario.findUnique({
    where: { correo: adminEmail }
  });

  if (!existe) {
    const hash = await bcrypt.hash('AdminUPB2026', 10);
    await prisma.usuario.create({
      data: {
        nombre: 'Coordinador UPB',
        correo: adminEmail,
        contrasena_hash: hash,
        rol: 'admin'
      }
    });
    console.log('✅ Admin creado: admin@upb.edu.co | Pass: AdminUPB2026');
  } else {
    console.log('✅ Admin ya existía.');
  }

  const docente = await prisma.usuario.findFirst({ where: { rol: 'docente' } });
  if (docente) {
    const existeRubrica = await prisma.rubrica.findFirst({ where: { id_docente: docente.id_usuario, tipo: 'COEVALUACION' } });
    if (!existeRubrica) {
      const nombres = ['Compromiso', 'Enfoque', 'Apertura', 'Respeto', 'Valor'];
      await prisma.rubrica.create({
        data: {
          nombre: 'Coevaluación entre pares',
          descripcion: 'Rúbrica fija para coevaluación anónima entre integrantes del equipo.',
          tipo: 'COEVALUACION',
          id_docente: docente.id_usuario,
          criterios: {
            create: nombres.map((nombre, orden) => ({
              nombre,
              descripcion: `Evaluación de ${nombre.toLowerCase()} del integrante.`,
              peso: 20,
              tipo: 'CRITERIO_EVALUABLE',
              es_hoja: true,
              orden,
              niveles: {
                create: [0, 20, 40, 60, 80, 100].map((puntos, nivel) => ({ nivel, puntos, descripcion: `${puntos} puntos` }))
              }
            }))
          }
        }
      });
      console.log('✅ Rúbrica de coevaluación creada.');
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });