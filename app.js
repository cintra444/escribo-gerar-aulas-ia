const SUPABASE_URL = "https://opqzewwivhxcxkmvkcgz.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcXpld3dpdmh4Y3hrbXZrY2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDQ2NTMsImV4cCI6MjA3NjU4MDY1M30.UadMDRpJw0kGmo3etjnfL8xmnTH6zd6MIhFHG_m67hI";
const GEMINI_API_KEY = "AIzaSyBjWVI6rAzvoEWcJb24GIaZneKLutky4eo";

class GeradorPlanoAula {
  constructor() {
    this.form = document.getElementById("geradorForm");
    this.loading = document.getElementById("loading");
    this.resultSection = document.getElementById("resultSection");
    this.planoConteudo = document.getElementById("planoConteudo");
    this.errorMessage = document.getElementById("errorMessage");
    this.successMessage = document.getElementById("successMessage");
    this.gerarBtn = document.getElementById("gerarBtn");

    this.inicializarEventos();
  }

  inicializarEventos() {
    this.form.addEventListener("submit", (e) => this.gerarPlano(e));
  }

  async gerarPlano(e) {
    e.preventDefault();

    const dados = this.obterDadosFormulario();

    if (!this.validarDados(dados)) {
      return;
    }

    this.mostrarLoading(true);
    this.ocultarMensagens();

    try {
      // Gerar plano com IA
      const planoIA = await this.gerarPlanoComIA(dados);

      // Salvar no Supabase
      await this.salvarNoSupabase(dados, planoIA);

      // Exibir plano gerado
      this.exibirResultado(planoIA);
      this.mostrarSucesso("Plano de aula gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar plano de aula:", error);
      this.mostrarErro(this.tratarErro(error));
    } finally {
      this.mostrarLoading(false);
    }
  }

  obterDadosFormulario() {
    return {
      tema: document.getElementById("tema").value.trim(),
      serie: document.getElementById("serie").value,
      componente: document.getElementById("componente").value,
      duracao: document.getElementById("duracao").value,
      detalhes: document.getElementById("detalhes").value,
    };
  }

  validarDados(dados) {
    if (!dados.tema) {
      this.mostrarErro("Por favor, insira o tema da aula.");
      return false;
    }
    if (!dados.serie) {
      this.mostrarErro("Por favor, selecione a série/ano.");
      return false;
    }
    if (!dados.componente) {
      this.mostrarErro("Por favor, selecione o componente curricular.");
      return false;
    }
    if (!dados.duracao) {
      this.mostrarErro("Por favor, selecione a duração da aula.");
      return false;
    }
    return true;
  }

  async gerarPlanoComIA(dados) {
    const prompt = this.criarPrompt(dados);

    const model = "gemini-2.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "Você é um planejador que cria planos de aula detalhados e estruturados para professores brasileiros.",
              },
            ],
          },
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            topP: 0.8,
            topK: 40,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro na resposta da API Gemini:", data);
      throw new Error(
        data.error?.message || "Erro de servidor ao gerar plano de aula com IA."
      );
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Resposta vazia ou inesperada da API Gemini.");
    }

    const textoResposta = data.candidates[0].content.parts[0].text;
    return this.parseRespostaIA(textoResposta);
  }

  criarPrompt(dados) {
    const seriesMap = {
      "1ano": "1º ano do Ensino Fundamental",
      "2ano": "2º ano do Ensino Fundamental",
      "3ano": "3º ano do Ensino Fundamental",
      "4ano": "4º ano do Ensino Fundamental",
      "5ano": "5º ano do Ensino Fundamental",
      "6ano": "6º ano do Ensino Fundamental",
      "7ano": "7º ano do Ensino Fundamental",
      "8ano": "8º ano do Ensino Fundamental",
      "9ano": "9º ano do Ensino Fundamental",
      "1medio": "1º ano do Ensino Médio",
      "2medio": "2º ano do Ensino Médio",
      "3medio": "3º ano do Ensino Médio",
    };

    const componentesMap = {
      portugues: "Língua Portuguesa",
      matematica: "Matemática",
      ciencias: "Ciências",
      historia: "História",
      geografia: "Geografia",
      artes: "Artes",
      educacao_fisica: "Educação Física",
      ingles: "Língua Inglesa",
    };

    return `Como especialista em educação brasileira, crie um plano de aula em formato JSON.

DADOS:
- Tema: ${dados.tema}
- Série: ${seriesMap[dados.serie] || dados.serie}
- Matéria: ${componentesMap[dados.componente] || dados.componente}
- Duração: ${dados.duracao} minutos
- Observações: ${dados.detalhes || "Nenhuma"}

ESTRUTURA DO JSON (retorne APENAS isso):

{
  "introducao_ludica": "Abordagem criativa para engajar os alunos",
  "objetivo_bncc": "Objetivo alinhado à Base Nacional Comum Curricular",
  "passo_a_passo": [
    "Atividade 1 com tempo estimado",
    "Atividade 2 com tempo estimado",
    "Atividade 3 com tempo estimado",
    "Atividade 4 com tempo estimado"
  ],
  "rubrica_avaliacao": "Critérios de avaliação mensuráveis"
}

REGRAS:
1. JSON válido apenas, sem texto extra
2. Conteúdo adequado para a série
3. Linguagem clara em português
4. Atividades práticas e executáveis`.trim();
  }

  parseRespostaIA(textoResposta) {
    try {
      let jsonString = textoResposta.trim();

      if (jsonString.startsWith("```")) {
        jsonString = jsonString.substring(jsonString.indexOf("\n") + 1);
      }
      if (jsonString.endsWith("```")) {
        jsonString = jsonString.substring(0, jsonString.lastIndexOf("```"));
      }

      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error(
          "JSON completo não foi encontrado na resposta.Resposta da IA truncada."
        );
      }

      const plano = JSON.parse(jsonMatch[0].trim());

      // Valida estrutura básica
      const camposObrigatorios = [
        "introducao_ludica",
        "objetivo_bncc",
        "passo_a_passo",
        "rubrica_avaliacao",
      ];

      for (const campo of camposObrigatorios) {
        if (!plano[campo]) {
          throw new Error(
            `Campo obrigatório "${campo}" ausente no plano gerado.`
          );
        }
      }

      return plano;
    } catch (error) {
      console.error("Erro no parse:", error, "Texto:", textoResposta);
      throw new Error(`Erro ao processar resposta da IA:  ${error.message}`);
    }
  }

  async salvarNoSupabase(dadosInput, planoIA) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/planos_aula`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_PUBLIC_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_PUBLIC_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        tema: dadosInput.tema,
        serie: dadosInput.serie,
        componente_curricular: dadosInput.componente,
        duracao_aula: parseInt(dadosInput.duracao),
        plano_gerado: planoIA,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro ao salvar no Supabase:", errorData);
      throw new Error("Erro ao salvar o plano de aula no banco de dados.");
    }
  }

  exibirResultado(plano) {
    this.planoConteudo.innerHTML = `
        <div class="plano-item">
            <h3>🎲 Introdução Lúdica</h3>
            <p>${plano.introducao_ludica}</p>
        </div>

        <div class="plano-item">
            <h3>🎯 Objetivo de Aprendizagem (BNCC)</h3>
            <p>${plano.objetivo_bncc}</p>
        </div>

        <div class="plano-item">
            <h3>📝 Passo a passo da atividade</h3>
            <ol>
                ${plano.passo_a_passo
                  .map((passo) => `<li>${passo}</li>`)
                  .join("")}
            </ol>
        </div>

        <div class="plano-item">
            <h3>✅ Rubrica de Avaliação</h3>
            <p>${plano.rubrica_avaliacao}</p>
        </div>
        `;

    this.resultSection.style.display = "block";
    this.resultSection.scrollIntoView({ behavior: "smooth" });
  }

  mostrarLoading(mostrar) {
    this.loading.style.display = mostrar ? "block" : "none";
    this.gerarBtn.disabled = mostrar;
    this.gerarBtn.textContent = mostrar
      ? "⏳ Gerando..."
      : "🚀 Gerar Plano de Aula";
  }

  mostrarErro(mensagem) {
    this.errorMessage.textContent = mensagem;
    this.errorMessage.style.display = "block";
  }

  mostrarSucesso(mensagem) {
    this.successMessage.textContent = mensagem;
    this.successMessage.style.display = "block";
  }

  ocultarMensagens() {
    this.errorMessage.style.display = "none";
    this.successMessage.style.display = "none";
  }

  tratarErro(error) {
    console.error("Erro detalhado:", error);

    if (
      error.message.includes("API key") ||
      error.message.includes("API_KEY")
    ) {
      return "Erro de configuração: Verifique a chave da API Gemini.";
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      return "Erro de conexão: Verifique sua internet.";
    } else if (error.message.includes("JSON")) {
      return "Erro ao processar resposta da IA. Tente novamente.";
    } else if (
      error.message.includes("not found") ||
      error.message.includes("404") ||
      error.message.includes("descontinuado")
    ) {
      return "Modelo de IA não disponível. Atualizando para versão mais recente...";
    } else {
      return "Erro ao gerar plano. Tente novamente em alguns segundos.";
    }
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  new GeradorPlanoAula();
});
