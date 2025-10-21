const SUPABASE_URL = "https://txkubgewibjuvgbfejgw.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcXpld3dpdmh4Y3hrbXZrY2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDQ2NTMsImV4cCI6MjA3NjU4MDY1M30.UadMDRpJw0kGmo3etjnfL8xmnTH6zd6MIhFHG_m67hI";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcXpld3dpdmh4Y3hrbXZrY2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAwNDY1MywiZXhwIjoyMDc2NTgwNjUzfQ.yO_Oi1tn93ER5NqvrMApbsEcIrsRoXVMMqABgTFWaPs";
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
    this.form.addEventListener("submit", async (e) => this.gerarPlano(e));
  }

  async gerarPlano(e) {
    e.preventDefault();

    const dados = this.obterDadosFormulario();

    if (!this.validarDados(dados)) {
      this.exibirErro("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    this.mostrarLoading(true);
    this.ocultarMensagens();

    try {
      //Gerar plano com IA
      const planoIA = await this.gerarPlanoComIA(dados);

      //Salvar no Supabase
      await this.salvarNoSupabase(dados, planoIA);

      //Exibir plano gerado
      this.exibirResultado(planoIA);
      this.mostrarSucesso("Plano de aula gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar plano de aula:", error);
      this.exibirErro(
        "Ocorreu um erro ao gerar o plano de aula. Tente novamente."
      );
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro na resposta da API Gemini:", data);
      throw new Error(
        data.error?.message || "Erro ao gerar plano de aula com IA."
      );
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Resposta inesperada da API Gemini.");
    }

    const textoResposta = data.candidates[0].content.parts[0].text;
    return this.parseRespostaIA(textoResposta);
  }

  criarPrompt(dados) {
    const seriesMap = {
      1: "1º ano do Ensino Fundamental",
      2: "2º ano do Ensino Fundamental",
      3: "3º ano do Ensino Fundamental",
      4: "4º ano do Ensino Fundamental",
      5: "5º ano do Ensino Fundamental",
      6: "6º ano do Ensino Fundamental",
      7: "7º ano do Ensino Fundamental",
      8: "8º ano do Ensino Fundamental",
      9: "9º ano do Ensino Fundamental",
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
      fisica: "Física",
      quimica: "Química",
      biologia: "Biologia",
      sociologia: "Sociologia",
    };

    return `Crie um plano de aula detalhado 
        
        INFORMAÇÕES:
        
        - Tema da aula: ${dados.tema} 
        - Serie/Ano: ${seriesMap[dados.serie] || dados.serie} 
        - Componente Curricular: ${componentesMap[dados.componente]}
        - Duração da aula: ${dados.duracao} minutos
        - Detalhes adicionais: ${dados.detalhes || "Não informado"}

        ESTRUTURA OBRIGATÓRIA (retorne APENAS JSON):

{
  "introducao_ludica": "Texto criativo e engajador para introduzir o tema de forma lúdica e interessante para os alunos",
  "objetivo_bncc": "Objetivo de aprendizagem específico alinhado com a BNCC. Inclua o código da habilidade se possível",
  "passo_a_passo": [
    "Passo 1 detalhado (aproximadamente 10-15 minutos)",
    "Passo 2 detalhado (aproximadamente 10-15 minutos)", 
    "Passo 3 detalhado (aproximadamente 10-15 minutos)",
    "Passo 4 detalhado (até completar o tempo total)"
  ],
  "rubrica_avaliacao": "Critérios claros e objetivos para avaliação do aprendizado dos alunos"
}

REGRAS IMPORTANTES:
1. Retorne APENAS o JSON válido, sem markdown, sem texto adicional
2. O plano deve ser adequado para a série indicada
3. A introdução deve ser realmente lúdica e engajadora
4. Os passos devem ser práticos e executáveis em sala de aula
5. A rubrica deve ter critérios mensuráveis
6. Use linguagem clara e objetiva em português
        
        `.trim();
  }

  parseRespostaIA(textoResposta) {
    try {
      const jsonMatch = textoResposta.match(/(\{[\s\S]*\})/);
      if (!jsonMatch) {
        throw new Error("Json não encontrado na resposta.");
      }

      const plano = JSON.parse(jsonMatch[0]);

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
      console.error("Erro no parse :", error, "Texto", textoResposta);
      throw new Error(
        "Erro ao analisar o plano de aula gerado pela IA." + error.message
      );
    }
  }

  async salvarNoSupabase(dadosInput, planoIA) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/planos_aula`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,

        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        tema: dadosInput.tema,
        serie: dadosInput.serie,
        componente: dadosInput.componente,
        duracao: dadosInput.duracao,
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
            <ul>
                ${plano.passo_a_passo
                  .map((passo, index) => `<li>${index + 1}. ${passo}</li>`)
                  .join("")}
            </ul>
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
      : "Gerar Plano de Aula";
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

  tratarErro(mensagem) {
    console.error("Erro detalhado:", error);

    if (error.message.includes("API Key")) {
      return "Erro de configuração: chave de API inválida ou ausente.";
    } else if (
      error.message.includes("network failure") ||
      error.message.includes("Failed to fetch")
    ) {
      return "Erro de rede: verifique sua conexão com a internet.";
    } else if (error.message.includes("JSON")) {
      return "Erro ao processar a resposta da IA: formato inesperado.";
    } else {
      return "Erro desconhecido: tente novamente mais tarde.";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new GeradorPlanoAula();
});
