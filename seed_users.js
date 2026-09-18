const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const keys = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  console.log('Modelos disponibles en Prisma:', keys);

  const passDefault = await bcrypt.hash('123456789', 10);
  const passAdmin = await bcrypt.hash('AdminUPB2026', 10);

  // Detecta el nombre del modelo de usuario
  const userModelKey = keys.find(k => k.toLowerCase().includes('user') || k.toLowerCase().includes('usuario'));

  if (!userModelKey) {
    console.error('No se encontró un modelo de usuario en Prisma.');
    return;
  }

  console.log(`Usando modelo: prisma.${userModelKey}`);

  const users = [
    { email: 'manito@upb.edu.co', password: passDefault, role: 'ESTUDIANTE' },
    { email: 'dagny@upb.edu.co', password: passDefault, role: 'DOCENTE' },
    { email: 'admin@upb.edu.co', password: passAdmin, role: 'ADMIN' }
  ];

  for (const u of users) {
    try {
      await prisma[userModelKey].upsert({
        where: { email: u.email },
        update: { password: u.password },
        create: { email: u.email, password: u.password, role: u.role }
      });
      console.log('✔ Usuario procesado:', u.email);
    } catch (e) {
      console.error('❌ Error creando ' + u.email + ':', e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
