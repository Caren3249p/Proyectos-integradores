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
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });