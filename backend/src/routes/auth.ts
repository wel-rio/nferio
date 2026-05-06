import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Register a new company and its owner
router.post('/register', async (req, res) => {
  try {
    const { cnpj, razaoSocial, name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'E-mail já cadastrado' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          cnpj,
          razaoSocial,
          // 7 days trial
          licenca: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      const user = await tx.user.create({
        data: {
          name: name || razaoSocial,
          email,
          password: hashedPassword,
          role: 'OWNER',
          companyId: company.id
        }
      });

      return { user, company };
    });

    const { password: _, ...userWithoutPassword } = result.user;
    res.status(201).json({ user: userWithoutPassword, company: result.company });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar empresa' });
  }
});

export default router;
