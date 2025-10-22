# Gerador de Planos de Aula com IA

Uma aplicação web que gera planos de aula personalizados utilizando a API Gemini da Google e armazena os resultados no Supabase.

[LINK - Gerador de Planos de Aula com IA](https://cintra444.github.io/escribo-gerar-aulas-ia/)

## 🚀 Funcionalidades

- Geração de planos de aula personalizados com IA
- Interface intuitiva e responsiva
- Alinhamento com a BNCC
- Armazenamento dos planos gerados
- Estrutura organizada com introdução lúdica, objetivos, passo a passo e rubricas de avaliação

## 📋 Pré-requisitos

- Navegador web moderno
- Servidor web local (como Live Server do VS Code)
- Chaves de API do Google Gemini e Supabase

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/cintra444/escribo-gerar-aulas-ia.git
cd gerador-aulas-ia
```

2. Crie um arquivo `.env` na raiz do projeto e configure as seguintes variáveis:

```env
GEMINI_API_KEY=sua_chave_gemini_aqui
SUPABASE_URL=sua_url_supabase_aqui
SUPABASE_ANON_PUBLIC_KEY=sua_chave_supabase_aqui
```

3. Substitua as chaves no arquivo `app.js` com suas variáveis de ambiente

## 💻 Como Executar

1. Abra o projeto no VS Code
2. Instale a extensão "Live Server"
3. Clique com o botão direito em `index.html` e selecione "Open with Live Server"
4. O projeto abrirá automaticamente no seu navegador padrão

## 🏗️ Decisões Técnicas

- **Vanilla JavaScript**: Optei por não usar framework para manter a aplicação leve e simples
- **Classes ES6**: Organização do código em uma classe principal `GeradorPlanoAula` para melhor encapsulamento
- **Supabase**: Escolhido para o desafio pela facilidade de integração e recursos de autenticação
- **Google Gemini**: API de IA selecionada por seu bom custo-benefício e qualidade das respostas
- **CSS Moderno**: Uso de gradientes, transições e flexbox para uma interface moderna

## 🎯 Desafios e Soluções

### Desafio 1: Parsing da Resposta da IA

- **Problema**: A IA ocasionalmente retornava JSON mal formatado
- **Solução**: Implementação de regex e tratamento robusto no método `parseRespostaIA`

### Desafio 2: Tratamento de Erros

- **Problema**: Diferentes tipos de erros da API precisavam de mensagens amigáveis
- **Solução**: Sistema centralizado de tratamento de erros com mensagens personalizadas

### Desafio 3: UX durante Carregamento

- **Problema**: Tempo de resposta da IA podia ser longo
- **Solução**: Feedback visual com spinner e estados de botão desabilitado

## 📦 Estrutura do Projeto

```
├── index.html      # Interface principal
├── style.css       # Estilos da aplicação
├── app.js          # Lógica principal
├── database.sql    # Esquema do banco de dados
└── README.md       # Documentação
```

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Google Gemini API
- Supabase

## ⚙️ Configuração do Banco de Dados

1. Crie um projeto no Supabase
2. Execute o script SQL em `database.sql`
3. Configure as políticas de segurança conforme necessário

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NomeFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NomeFeature`)
5. Abra um Pull Request

## 📊 Documentação da Escolha do Modelo de IA

### Por que o Google Gemini?

1. **Custo-Benefício**

   - Preços competitivos por requisição
   - Plano gratuito generoso para testes e desenvolvimento
   - Boa relação entre custo e qualidade das respostas

2. **Qualidade das Respostas**

   - Excelente compreensão do contexto educacional
   - Capacidade de gerar conteúdo estruturado em formato JSON
   - Respostas consistentes e bem formatadas

3. **Recursos Técnicos**

   - API REST de fácil integração
   - Documentação clara e abrangente
   - Suporte a múltiplos formatos de resposta
   - Baixa latência nas requisições

4. **Comparativo com Outras Opções**

| Aspecto           | Google Gemini | GPT-3.5  | Claude   |
| ----------------- | ------------- | -------- | -------- |
| Custo             | Baixo         | Médio    | Alto     |
| Tempo de Resposta | Rápido        | Médio    | Rápido   |
| Qualidade         | Alta          | Alta     | Alta     |
| Documentação      | Excelente     | Boa      | Boa      |
| Limite Gratuito   | Generoso      | Limitado | Limitado |

5. **Considerações de Implementação**
   - Facilidade na estruturação do prompt
   - Boa capacidade de seguir instruções específicas
   - Consistência no formato das respostas
   - Suporte robusto a erros e exceções

## Desenvolvedor

Eber Cintra - Desenvolvedor Fullstack<br><br>
[<img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" />](https://www.linkedin.com/in/ebercintra)
[<img src="https://img.shields.io/badge/Portfolio-255E63?style=for-the-badge&logo=About.me&logoColor=white" />](https://portifolio-eber.netlify.app)
