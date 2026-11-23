
const telaInicio = document.getElementById("telaInicio");
const telaJogo = document.getElementById("telaJogo");
const telaFinal = document.getElementById("telaFinal");

const mapa = document.getElementById("mapa");
const cenario = document.getElementById("cenario");
const modal = document.getElementById("modal");

let nome = "";
let localAtual = "";
let itemSelecionado = null;
let inventario = [];
let evidencias = [];
let anotacoes = [];

let estado = {
  medalhao: false,
  chave: false,
  diario: false,
  relatorio: false,
  gravacao: false,
  retrato: false,
  finalizado: false
};

const locais = {
  mansao: {
    nome: "Mansão Blackwood",
    categoria: "CENA DO DESAPARECIMENTO",
    descricao: "A antiga mansão permanece abandonada. O ar é gelado e há marcas de mãos nas paredes. Parece que alguém saiu daqui às pressas.",
    fundo: "linear-gradient(135deg, #292536, #11121b 70%)",
    objetos: [
      { id: "retrato", nome: "Retrato antigo", icone: "🖼️", texto: "Um retrato de Eleanor e sua família." },
      { id: "gaveta", nome: "Escrivaninha", icone: "🗄️", texto: "Uma gaveta parece estar trancada." },
      { id: "janela", nome: "Janela", icone: "🪟", texto: "A janela está quebrada por dentro." },
      { id: "espelho", nome: "Espelho", icone: "🪞", texto: "Você sente que há algo escrito no espelho." }
    ]
  },

  cemiterio: {
    nome: "Cemitério antigo",
    categoria: "LOCAL DE SEPULTAMENTO",
    descricao: "A neblina cobre as lápides. Uma sepultura parece ter sido mexida recentemente, apesar de ninguém visitar o lugar há anos.",
    fundo: "linear-gradient(135deg, #1d302e, #10191c 70%)",
    objetos: [
      { id: "tumulo", nome: "Túmulo de Eleanor", icone: "⚰️", texto: "O nome de Eleanor está gravado na pedra." },
      { id: "estatua", nome: "Estátua", icone: "🗿", texto: "Uma estátua segura uma pequena caixa." },
      { id: "arvore", nome: "Árvore seca", icone: "🌳", texto: "Há alguma coisa presa entre as raízes." }
    ]
  },

  delegacia: {
    nome: "Delegacia abandonada",
    categoria: "ARQUIVOS POLICIAIS",
    descricao: "O prédio foi fechado há anos. Os arquivos do desaparecimento ainda estão guardados em uma sala trancada.",
    fundo: "linear-gradient(135deg, #30313c, #151620 70%)",
    objetos: [
      { id: "arquivo", nome: "Arquivo do caso", icone: "📁", texto: "Uma pasta com o número 024." },
      { id: "computador", nome: "Computador antigo", icone: "💻", texto: "A tela pede uma senha." },
      { id: "telefone", nome: "Telefone", icone: "☎️", texto: "O telefone toca, mas não há linha conectada." }
    ]
  },

  antiquario: {
    nome: "Antiquário de Elias",
    categoria: "LOJA DE OBJETOS ANTIGOS",
    descricao: "A loja está fechada, mas a porta foi deixada entreaberta. Relógios antigos continuam funcionando, embora estejam sem pilhas.",
    fundo: "linear-gradient(135deg, #3b2b2a, #171419 70%)",
    objetos: [
      { id: "caixaMusica", nome: "Caixa de música", icone: "🎵", texto: "A caixa está fechada por um mecanismo de símbolos." },
      { id: "relogio", nome: "Relógio", icone: "🕰️", texto: "Os ponteiros estão parados em 11h45." },
      { id: "livro", nome: "Livro antigo", icone: "📖", texto: "Há uma anotação na última página." }
    ]
  },

  asilo: {
    nome: "Asilo abandonado",
    categoria: "ÚLTIMO LOCAL INVESTIGADO",
    descricao: "O prédio onde Eleanor foi vista pela última vez está em ruínas. Há uma luz acesa no fim do corredor.",
    fundo: "linear-gradient(135deg, #30252f, #12121c 70%)",
    objetos: [
      { id: "porta", nome: "Porta trancada", icone: "🚪", texto: "Uma porta com três fechaduras." },
      { id: "quadro", nome: "Quadro de avisos", icone: "📌", texto: "Papéis antigos estão presos na parede." },
      { id: "fantasma", nome: "Aparição", icone: "👻", texto: "Uma sombra parece observar você." }
    ]
  }
};

document.getElementById("comecar").addEventListener("click", iniciar);
document.getElementById("btnMapa").addEventListener("click", mostrarMapa);
document.getElementById("voltarMapa").addEventListener("click", mostrarMapa);
document.getElementById("fecharModal").addEventListener("click", fecharModal);
document.getElementById("reiniciar").addEventListener("click", reiniciar);

document.querySelectorAll(".local").forEach(botao => {
  botao.addEventListener("click", () => {
    entrarLocal(botao.dataset.local);
  });
});

function iniciar() {
  nome = document.getElementById("nome").value.trim();

  if (!nome) {
    alert("Digite o nome do detetive para começar.");
    return;
  }

  document.getElementById("nomeDetetive").textContent = nome;
  telaInicio.classList.add("escondido");
  telaJogo.classList.remove("escondido");

  registrar("Você chegou a Hollow Creek. A carta de Eleanor menciona cinco lugares importantes.");
  atualizarInventario();
}

function mostrarMapa() {
  mapa.classList.remove("escondido");
  cenario.classList.add("escondido");
  localAtual = "";
}

function entrarLocal(id) {
  localAtual = id;

  const local = locais[id];

  mapa.classList.add("escondido");
  cenario.classList.remove("escondido");

  document.getElementById("nomeLocal").textContent = local.nome;
  document.getElementById("categoriaLocal").textContent = local.categoria;
  document.getElementById("descricaoLocal").textContent = local.descricao;
  document.getElementById("imagemCenario").style.background = local.fundo;

  const objetos = document.getElementById("objetos");
  objetos.innerHTML = "";

  local.objetos.forEach(objeto => {
    const botao = document.createElement("button");

    botao.className = "objeto";
    botao.innerHTML = `
      <span>${objeto.icone}</span>
      <strong>${objeto.nome}</strong>
      <small>Investigar</small>
    `;

    botao.addEventListener("click", () => investigar(objeto.id));

    objetos.appendChild(botao);
  });
}

function investigar(id) {
  if (estado.finalizado) return;

  if (localAtual === "cemiterio") {
    investigarCemiterio(id);
  } else if (localAtual === "mansao") {
    investigarMansao(id);
  } else if (localAtual === "delegacia") {
    investigarDelegacia(id);
  } else if (localAtual === "antiquario") {
    investigarAntiquario(id);
  } else if (localAtual === "asilo") {
    investigarAsilo(id);
  }
}

// CEMITÉRIO
function investigarCemiterio(id) {
  if (id === "tumulo") {
    abrirDialogo(
      "⚰️ Túmulo de Eleanor",
      "A lápide está rachada. Na parte de trás, você encontra uma inscrição: 'A verdade está onde o tempo parou.'",
      "Anotar inscrição",
      () => registrar("Inscrição encontrada no túmulo: A verdade está onde o tempo parou.")
    );
  }

  if (id === "estatua") {
    if (!estado.medalhao) {
      abrirDialogo(
        "🗿 Estátua misteriosa",
        "A estátua segura uma caixa com um encaixe circular. Parece faltar alguma coisa.",
        "Examinar",
        () => registrar("A caixa da estátua precisa de um objeto circular.")
      );
    } else if (!estado.chave) {
      abrirDialogo(
        "🗿 A caixa se abriu!",
        "O medalhão encaixou perfeitamente. Dentro da caixa há uma chave antiga.",
        "Pegar chave",
        () => {
          estado.chave = true;
          adicionarItem("🗝️ Chave antiga", "chave");
          registrar("Você encontrou uma chave antiga dentro da caixa da estátua.");
        }
      );
    } else {
      mostrarDialogo("🗿 Estátua", "A caixa está vazia.");
    }
  }

  if (id === "arvore") {
    if (!estado.medalhao) {
      abrirDialogo(
        "🌳 Raízes da árvore",
        "Entre as raízes existe um objeto brilhante parcialmente enterrado.",
        "Pegar objeto",
        () => {
          estado.medalhao = true;
          adicionarItem("📿 Medalhão", "medalhao");
          registrar("Você encontrou um medalhão enterrado no cemitério.");
        }
      );
    } else {
      mostrarDialogo("🌳 Árvore seca", "Você já encontrou tudo que estava escondido entre as raízes.");
    }
  }
}

// MANSÃO
function investigarMansao(id) {
  if (id === "retrato") {
    if (!estado.retrato) {
      abrirDialogo(
        "🖼️ Retrato da família",
        "No verso do retrato está escrito: 'Eleanor, 1996. Nunca confie em quem guarda as chaves.'",
        "Guardar fotografia",
        () => {
          estado.retrato = true;
          adicionarItem("📷 Fotografia", "fotografia");
          registrar("A fotografia revela uma frase suspeita sobre alguém que guardava as chaves.");
        }
      );
    } else {
      mostrarDialogo("🖼️ Retrato", "Você já examinou o retrato. A frase continua sendo uma pista importante.");
    }
  }

  if (id === "gaveta") {
    if (!estado.chave) {
      mostrarDialogo("🗄️ Escrivaninha", "A gaveta está trancada. Você precisa encontrar uma chave.");
    } else if (!estado.diario) {
      abrirDialogo(
        "🗄️ Gaveta aberta",
        "Dentro há um diário de Eleanor. Uma página foi arrancada, mas restou uma frase: 'O doutor sabia que eu estava viva.'",
        "Pegar diário",
        () => {
          estado.diario = true;
          adicionarItem("📓 Diário de Eleanor", "diario");
          registrar("O diário indica que um médico sabia que Eleanor estava viva.");
        }
      );
    } else {
      mostrarDialogo("🗄️ Escrivaninha", "A gaveta está vazia.");
    }
  }

  if (id === "janela") {
    mostrarDialogo("🪟 Janela quebrada", "Os cacos estão espalhados do lado de dentro. Alguém quebrou a janela de propósito para simular uma invasão.");
    registrar("A janela foi quebrada de dentro para fora.");
  }

  if (id === "espelho") {
    mostrarDialogo("🪞 Espelho antigo", "Ao limpar a poeira, você consegue ler: '11:45. O som revela o caminho.'");
    registrar("O espelho indica o horário 11h45 e menciona um som.");
  }
}

// DELEGACIA
function investigarDelegacia(id) {
  if (id === "arquivo") {
    if (!estado.diario) {
      mostrarDialogo("📁 Arquivo 024", "O arquivo está preso em uma gaveta. Uma anotação diz que a senha está relacionada ao diário de Eleanor.");
    } else {
      abrirDialogo(
        "📁 Arquivo do caso",
        "O documento informa que Eleanor foi declarada morta em 1996, mas nunca houve registro de corpo encontrado.",
        "Coletar relatório",
        () => {
          if (!estado.relatorio) {
            estado.relatorio = true;
            adicionarItem("📄 Relatório policial", "relatorio");
            registrar("O relatório confirma que não havia corpo encontrado no desaparecimento.");
          } else {
            mostrarDialogo("📁 Arquivo", "Você já recolheu o relatório.");
          }
        }
      );
    }
  }

  if (id === "computador") {
    abrirCodigo(
      "💻 Computador antigo",
      "Digite o ano em que Eleanor desapareceu.",
      "1996",
      () => {
        registrar("Você acessou o computador e encontrou uma mensagem apagada: 'O doutor levou a paciente para o prédio antigo.'");
        mostrarDialogo("💻 Mensagem recuperada", "A mensagem aponta para o asilo abandonado. Alguém levou Eleanor para lá.");
      }
    );
  }

  if (id === "telefone") {
    mostrarDialogo("☎️ Telefone", "O telefone toca três vezes. Uma voz sussurra: 'Ele ainda está aqui...'");
    registrar("Uma voz misteriosa afirmou que o responsável ainda está na cidade.");
  }
}

// ANTIQUÁRIO
function investigarAntiquario(id) {
  if (id === "caixaMusica") {
    if (!estado.medalhao) {
      mostrarDialogo("🎵 Caixa de música", "A caixa possui um espaço circular vazio. Talvez um objeto encontrado na cidade possa abri-la.");
    } else if (!estado.gravacao) {
      abrirDialogo(
        "🎵 A melodia escondida",
        "Você encaixa o medalhão. A caixa toca uma melodia estranha e revela uma pequena gravação.",
        "Guardar gravação",
        () => {
          estado.gravacao = true;
          adicionarItem("📼 Gravação antiga", "gravacao");
          registrar("A gravação contém uma voz dizendo: 'Doutor, ninguém pode descobrir o que fizemos.'");
        }
      );
    } else {
      mostrarDialogo("🎵 Caixa de música", "A caixa já revelou seu segredo.");
    }
  }

  if (id === "relogio") {
    abrirCodigo(
      "🕰️ Relógio parado",
      "O relógio está parado às 11h45. Qual horário aparece no espelho da mansão? Digite sem os dois pontos.",
      "1145",
      () => {
        registrar("O relógio abriu um compartimento secreto com uma anotação: 'A última visita foi feita pelo doutor às 23h45.'");
        mostrarDialogo("🕰️ Compartimento secreto", "Você encontrou uma anotação que confirma a visita do médico pouco antes do desaparecimento.");
      }
    );
  }

  if (id === "livro") {
    mostrarDialogo("📖 Livro antigo", "Na última página está escrito: 'A melodia abre aquilo que a chave não consegue.'");
    registrar("O livro indica que a caixa de música esconde algo importante.");
  }
}

// ASILO
function investigarAsilo(id) {
  if (id === "porta") {
    if (estado.diario && estado.relatorio && estado.gravacao && estado.retrato) {
      abrirDialogo(
        "🚪 Porta destrancada",
        "Você reuniu evidências suficientes. A porta se abre lentamente. No quarto, há uma mesa com documentos e uma cadeira vazia.",
        "Entrar no quarto",
        () => abrirFinal()
      );
    } else {
      mostrarDialogo(
        "🚪 Porta trancada",
        "Você ainda não reuniu todas as evidências. Investigue os outros locais e procure o diário, o relatório, a gravação e a fotografia."
      );
    }
  }

  if (id === "quadro") {
    mostrarDialogo("📌 Quadro de avisos", "Há uma lista de pacientes. O nome de Eleanor foi riscado, mas a data de entrada está registrada: 1996.");
    registrar("O quadro confirma que Eleanor esteve internada no asilo em 1996.");
  }

  if (id === "fantasma") {
    mostrarDialogo("👻 Aparição", "A sombra aponta para o corredor e sussurra: 'Não foi a morte que me levou. Foi aquele em quem todos confiavam.'");
    registrar("A aparição afirma que alguém de confiança foi responsável pelo desaparecimento.");
  }
}

// DIÁLOGOS
function abrirDialogo(titulo, texto, nomeBotao, acao) {
  document.getElementById("modalIcone").textContent = "🔎";
  document.getElementById("modalTitulo").textContent = titulo;
  document.getElementById("modalTexto").textContent = texto;

  const acoes = document.getElementById("modalAcoes");
  acoes.innerHTML = "";

  const botao = document.createElement("button");
  botao.className = "botao";
  botao.textContent = nomeBotao;

  botao.addEventListener("click", () => {
    fecharModal();
    acao();
    atualizarInventario();
  });

  acoes.appendChild(botao);
  modal.classList.remove("escondido");
}

function mostrarDialogo(titulo, texto) {
  document.getElementById("modalIcone").textContent = "💬";
  document.getElementById("modalTitulo").textContent = titulo;
  document.getElementById("modalTexto").textContent = texto;
  document.getElementById("modalAcoes").innerHTML = "";
  modal.classList.remove("escondido");
}

function abrirCodigo(titulo, texto, senha, sucesso) {
  document.getElementById("modalIcone").textContent = "🔐";
  document.getElementById("modalTitulo").textContent = titulo;
  document.getElementById("modalTexto").textContent = texto;

  const acoes = document.getElementById("modalAcoes");
  acoes.innerHTML = `
    <input id="codigoDigitado" type="text" placeholder="Digite o código" maxlength="10">
    <button id="confirmarCodigo" class="botao">CONFIRMAR</button>
  `;

  document.getElementById("confirmarCodigo").addEventListener("click", () => {
    const digitado = document.getElementById("codigoDigitado").value.trim();

    if (digitado === senha) {
      fecharModal();
      sucesso();
      atualizarInventario();
    } else {
      document.getElementById("modalTexto").textContent =
        "Código incorreto. Observe as pistas encontradas e tente novamente.";
    }
  });

  modal.classList.remove("escondido");
}

function fecharModal() {
  modal.classList.add("escondido");
}

// INVENTÁRIO
function adicionarItem(nomeItem, id) {
  if (inventario.some(item => item.id === id)) return;

  inventario.push({ nome: nomeItem, id });
  atualizarInventario();
}

function atualizarInventario() {
  const lista = document.getElementById("itens");
  const vazio = document.getElementById("inventarioVazio");

  lista.innerHTML = "";
  vazio.classList.toggle("escondido", inventario.length > 0);

  inventario.forEach(item => {
    const botao = document.createElement("button");

    botao.className = "item";
    botao.textContent = item.nome;

    if (itemSelecionado === item.id) {
      botao.classList.add("selecionado");
    }

    botao.addEventListener("click", () => {
      itemSelecionado = itemSelecionado === item.id ? null : item.id;
      atualizarInventario();
      usarItem();
    });

    lista.appendChild(botao);
  });

  document.getElementById("contador").textContent =
    `${evidencias.length}/5`;
}

function usarItem() {
  if (!itemSelecionado) return;

  if (localAtual === "cemiterio" && itemSelecionado === "medalhao") {
    investigar("estatua");
    itemSelecionado = null;
    atualizarInventario();
    return;
  }

  if (localAtual === "mansao" && itemSelecionado === "chave") {
    investigar("gaveta");
    itemSelecionado = null;
    atualizarInventario();
    return;
  }

  if (localAtual === "antiquario" && itemSelecionado === "medalhao") {
    investigar("caixaMusica");
    itemSelecionado = null;
    atualizarInventario();
    return;
  }

  mostrarDialogo("🎒 Inventário", "Este objeto não parece ser útil aqui. Experimente utilizá-lo em outro local.");
}

function registrar(texto) {
  if (anotacoes.includes(texto)) return;

  anotacoes.push(texto);

  const lista = document.getElementById("anotacoes");
  const paragrafo = document.createElement("p");

  paragrafo.textContent = "• " + texto;
  lista.appendChild(paragrafo);

  atualizarEvidencias();
}

function atualizarEvidencias() {
  evidencias = [];

  if (estado.medalhao) evidencias.push("Medalhão");
  if (estado.chave) evidencias.push("Chave");
  if (estado.diario) evidencias.push("Diário");
  if (estado.relatorio) evidencias.push("Relatório");
  if (estado.gravacao) evidencias.push("Gravação");
  if (estado.retrato) evidencias.push("Fotografia");

  document.getElementById("contador").textContent =
    `${Math.min(evidencias.length, 5)}/5`;
}

// CONFRONTO FINAL
function abrirFinal() {
  document.getElementById("modalIcone").textContent = "🕵️";
  document.getElementById("modalTitulo").textContent = "A verdade está próxima";
  document.getElementById("modalTexto").textContent =
    "Os documentos revelam que o doutor Adrian Vale falsificou o desaparecimento de Eleanor e a manteve escondida para impedir que ela revelasse um segredo. Mas você precisa decidir quem será acusado.";

  const acoes = document.getElementById("modalAcoes");
  acoes.innerHTML = "";

  const suspeitos = [
    { nome: "Doutor Adrian Vale", correto: true },
    { nome: "Elias, o antiquário", correto: false },
    { nome: "Thomas, o policial", correto: false }
  ];

  suspeitos.forEach(suspeito => {
    const botao = document.createElement("button");
    botao.className = "botao";
    botao.textContent = suspeito.nome;

    botao.addEventListener("click", () => {
      fecharModal();
      finalizar(suspeito.correto);
    });

    acoes.appendChild(botao);
  });

  modal.classList.remove("escondido");
}

function finalizar(acertou) {
  telaJogo.classList.add("escondido");
  telaFinal.classList.remove("escondido");

  if (acertou) {
    document.getElementById("iconeFinal").textContent = "🏆";
    document.getElementById("tituloFinal").textContent = "Mistério solucionado!";
    document.getElementById("textoFinal").textContent =
      `Parabéns, ${nome}! Você descobriu que o doutor Adrian Vale foi responsável pelo desaparecimento de Eleanor. A verdade finalmente veio à tona e a alma dela pode descansar. Você se tornou o grande detetive de Hollow Creek.`;
  } else {
    document.getElementById("iconeFinal").textContent = "🌫️";
    document.getElementById("tituloFinal").textContent = "O mistério continua...";
    document.getElementById("textoFinal").textContent =
      "Você acusou a pessoa errada. O verdadeiro responsável escapou e os segredos de Hollow Creek continuam escondidos. Talvez outra investigação consiga revelar a verdade.";
  }
}

function reiniciar() {
  inventario = [];
  evidencias = [];
  anotacoes = [];
  itemSelecionado = null;
  localAtual = "";

  estado = {
    medalhao: false,
    chave: false,
    diario: false,
    relatorio: false,
    gravacao: false,
    retrato: false,
    finalizado: false
  };

  document.getElementById("nome").value = "";
  document.getElementById("anotacoes").innerHTML =
    "<p>Uma carta misteriosa trouxe você até Hollow Creek...</p>";

  mostrarTelaInicio();
}

function mostrarTelaInicio() {
  telaFinal.classList.add("escondido");
  telaJogo.classList.add("escondido");
  telaInicio.classList.remove("escondido");
  mostrarMapa();
}
