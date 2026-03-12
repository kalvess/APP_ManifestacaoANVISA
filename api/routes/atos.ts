import { Router } from 'express'

const router = Router()

router.get('/search', async (req, res) => {
  const sample = [
    {
      id: 1,
      numero: 'RDC Nº 123',
      orgao: 'ANVISA',
      categoria: 'Medicamentos',
      data: '2025-10-15',
      titulo:
        'Dispõe sobre o registro de medicamentos similares e dá outras providências.',
      link: '#',
    },
    {
      id: 2,
      numero: 'IN Nº 45',
      orgao: 'ANVISA',
      categoria: 'Alimentos',
      data: '2025-10-10',
      titulo:
        'Estabelece as listas de constituintes, de limites de uso, de alegações e de rotulagem complementar dos suplementos alimentares.',
      link: '#',
    },
    {
      id: 3,
      numero: 'Portaria Nº 789',
      orgao: 'Ministério da Saúde',
      categoria: 'Geral',
      data: '2025-09-28',
      titulo: 'Institui a Política Nacional de Vigilância Sanitária.',
      link: '#',
    },
  ]
  res.json({ data: sample })
})

export default router
