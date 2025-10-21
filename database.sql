-- Tabela principal 
CREATE TABLE planos_aula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Inputs do usuário
  tema VARCHAR NOT NULL,
  serie VARCHAR NOT NULL,
  componente_curricular VARCHAR NOT NULL,
  duracao_aula INTEGER,
  
  -- Resposta da IA em JSON
  plano_gerado JSONB NOT NULL,
  
  -- Metadados
  usuario_id UUID REFERENCES auth.users(id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE planos_aula ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados (opcional)
CREATE POLICY "Usuários podem ver seus planos" ON planos_aula
  FOR ALL USING (auth.uid() = usuario_id);

-- Dados para teste
INSERT INTO planos_aula (tema, serie, componente_curricular, duracao_aula, plano_gerado) VALUES
('Fotossíntese', '6ano', 'ciencias', 50, '{"introducao_ludica": "Vamos explorar o mistério das plantas que comem luz!", "objetivo_bncc": "Compreender o processo de fotossíntese", "passo_a_passo": ["Passo 1: Apresentação do tema", "Passo 2: Experimento prático"], "rubrica_avaliacao": "Participação e compreensão dos conceitos"}');