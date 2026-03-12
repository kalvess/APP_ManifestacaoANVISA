-- Tabela de Processos Monitorados
CREATE TABLE IF NOT EXISTS public.processos_monitorados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa VARCHAR(255) NOT NULL,
    produto VARCHAR(255) NOT NULL,
    protocolo VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'reprovado', 'com_pendencias')),
    resolucao_numero VARCHAR(100),
    data_publicacao DATE,
    link_dou TEXT,
    favorito BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_processos_user_id ON public.processos_monitorados(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_protocolo ON public.processos_monitorados(protocolo);
CREATE INDEX IF NOT EXISTS idx_processos_status ON public.processos_monitorados(status);

ALTER TABLE public.processos_monitorados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can crud their own processes" 
ON public.processos_monitorados 
USING (auth.uid() = user_id);


-- Tabela de Histórico de Status
CREATE TABLE IF NOT EXISTS public.historico_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id UUID NOT NULL REFERENCES public.processos_monitorados(id) ON DELETE CASCADE,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    resolucao_numero VARCHAR(100),
    data_mudanca TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_processo_id ON public.historico_status(processo_id);

ALTER TABLE public.historico_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view history of their processes" 
ON public.historico_status FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.processos_monitorados pm 
    WHERE pm.id = historico_status.processo_id AND pm.user_id = auth.uid()
));


-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('status_mudanca', 'novo_ato', 'sistema')),
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON public.notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can crud their own notifications" 
ON public.notificacoes 
USING (auth.uid() = user_id);


-- Tabela de Atos Normativos
CREATE TABLE IF NOT EXISTS public.atos_normativos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(100) NOT NULL,
    orgao_emissor VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) CHECK (categoria IN ('medicamentos', 'dispositivos_medicos', 'alimentos', 'cosmeticos')),
    data_publicacao DATE NOT NULL,
    titulo TEXT NOT NULL,
    resumo TEXT,
    link_pdf TEXT,
    metadados JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atos_numero ON public.atos_normativos(numero);
CREATE INDEX IF NOT EXISTS idx_atos_categoria ON public.atos_normativos(categoria);
CREATE INDEX IF NOT EXISTS idx_atos_data_pub ON public.atos_normativos(data_publicacao DESC);

ALTER TABLE public.atos_normativos ENABLE ROW LEVEL SECURITY;

-- Todos podem ler atos normativos (público ou autenticado)
CREATE POLICY "Anyone can read normative acts" 
ON public.atos_normativos FOR SELECT 
USING (true);


-- Tabela de Logs de Auditoria
CREATE TABLE IF NOT EXISTS public.logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(100) NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs_auditoria(user_id);

ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs" 
ON public.logs_auditoria FOR SELECT
USING (auth.uid() = user_id);

-- Admins policy would go here (omitted for brevity in this step)
