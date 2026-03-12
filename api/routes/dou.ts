import { Router } from 'express'

const router = Router()

router.post('/search', async (req, res) => {
  const { method, terms } = req.body || {}
  if (!method || !Array.isArray(terms) || terms.length === 0) {
    res.status(400).json({ error: 'Parâmetros inválidos' })
    return
  }
  const now = new Date().toISOString().slice(0, 10)
  const sample = terms.slice(0, 10).map((t: string, i: number) => ({
    consulta: t,
    resolucao_numero: `RDC ${100 + i}/${new Date().getFullYear()}`,
    data_publicacao: now,
    situacao: ['aprovado', 'reprovado', 'com_pendencias'][i % 3],
    link: `https://www.in.gov.br/leiturajornal?edicao=${now}#ato-${1000 + i}`,
  }))
  res.json({ data: sample })
})

export default router
