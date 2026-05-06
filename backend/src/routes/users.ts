import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Get all users of the company
router.get('/', async (req, res) => {
  const { companyId } = req.query;
  try {
    const users = await prisma.user.findMany({
      where: { companyId: String(companyId) },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Create a new employee
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, companyId } = req.body;

    if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'E-mail já cadastrado' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'CAIXA',
        companyId: String(companyId)
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { company: true }
    });

    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta' });

    // Se a licença estiver vencida, avisar (mas deixar logar para pagar)
    const isExpired = user.company.licenca && new Date(user.company.licenca) < new Date();

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      expired: isExpired
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

export default router;
