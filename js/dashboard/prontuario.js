import * as data from '../dados.js'
import * as date from '../date.js'
import * as alertas from './alertas.js'
import {
    escaparHtml, iniciais, somenteDigitos, formatarCPF, formatarTelefone, formatarData,
    formatarDataHora, calcularIdade, classeStatus, statusConsulta, usuarioLogado,
    dataISO, dataHoraBanco, avisarMudanca, abrirTela
} from '../util.js'

// Estado da tela
let pacienteAberto = null       // cd_paciente com o prontuário aberto
let pesquisou = false           // já fez alguma pesquisa?
let ordenacao = { coluna: 'nome', crescente: true }

export async function load() {
    const tela = document.querySelector('.screen-prontuario')
    if (!tela) return false

    configurarBusca()
    configurarDetalhe()

    if (pesquisou) await pesquisar()
    if (pacienteAberto) await renderizarProntuario()
    return true
}

// Chamado por outras telas (ex.: agenda do médico) para abrir direto um paciente
export async function abrirProntuario(cdPaciente) {
    pacienteAberto = cdPaciente
    mostrarDetalhe(true)
    await renderizarProntuario()
}

/* ------------------------------------------------------------------ */
/* Busca de pacientes                                                  */
/* ------------------------------------------------------------------ */

function configurarBusca() {
    const form = document.getElementById('form-busca-paciente')
    if (!form || form.dataset.configurado) return

    const termo = document.getElementById('busca-paciente-termo')
    const situacao = document.getElementById('busca-paciente-situacao')
    const limpar = document.getElementById('btn-limpar-busca')

    form.addEventListener('submit', evento => {
        evento.preventDefault()
        pesquisou = true
        pesquisar()
    })

    const atualizarLimpar = () => {
        limpar.disabled = !termo.value && situacao.value === 'todos' && !pesquisou
    }
    termo.addEventListener('input', atualizarLimpar)
    situacao.addEventListener('change', atualizarLimpar)

    limpar.addEventListener('click', () => {
        form.reset()
        pesquisou = false
        limpar.disabled = true
        document.getElementById('busca-paciente-resultado').hidden = true
        mostrarVazio('Pesquise um paciente', 'Digite o nome ou o CPF e clique em Pesquisar. Para ver todos, pesquise com o campo vazio.')
        termo.focus()
    })

    document.querySelectorAll('.tabela-pacientes .ordenar').forEach(botao => {
        botao.addEventListener('click', () => {
            const coluna = botao.dataset.coluna
            ordenacao = {
                coluna,
                crescente: ordenacao.coluna === coluna ? !ordenacao.crescente : true
            }
            pesquisar()
        })
    })

    document.getElementById('busca-paciente-corpo').addEventListener('click', evento => {
        const botao = evento.target.closest('button[data-acao]')
        if (!botao) return
        abrirProntuario(Number(botao.dataset.pacienteId)).then(() => {
            if (botao.dataset.acao === 'editar') editarClinico(true)
        })
    })

    form.dataset.configurado = 'true'
}

async function pesquisar() {
    const termo = document.getElementById('busca-paciente-termo').value.trim()
    const situacao = document.getElementById('busca-paciente-situacao').value
    document.getElementById('btn-limpar-busca').disabled = false

    const dados = await data.carregarDados()
    const agora = new Date()
    const hoje = dataISO()
    const termoTexto = normalizar(termo)
    const termoDigitos = somenteDigitos(termo)

    let pacientes = dados.pacientes.filter(paciente => {
        if (!termo) return true
        const porNome = normalizar(paciente.nm_paciente).includes(termoTexto)
        const porCpf = termoDigitos.length >= 3 && somenteDigitos(paciente.cd_cpf).includes(termoDigitos)
        return porNome || porCpf
    })

    pacientes = pacientes.filter(paciente => {
        const consultas = dados.consultas.filter(c => c.cd_paciente === paciente.cd_paciente)
        if (situacao === 'agendada') {
            return consultas.some(c => c.cd_status !== 3 && date.converterToNewDate(c.dt_agendamento) >= agora)
        }
        if (situacao === 'tratamento') {
            return dados.alertas.some(a => a.cd_paciente === paciente.cd_paciente && a.dt_inicio <= hoje && (!a.dt_fim || a.dt_fim >= hoje))
        }
        if (situacao === 'sem-consulta') return consultas.length === 0
        return true
    })

    ordenar(pacientes)

    const resultado = document.getElementById('busca-paciente-resultado')
    if (pacientes.length === 0) {
        resultado.hidden = true
        mostrarVazio('Nenhum paciente encontrado', 'Confira o nome ou o CPF digitado, ou mude o filtro de situação.')
        return
    }

    document.getElementById('busca-paciente-vazio').hidden = true
    resultado.hidden = false
    document.getElementById('busca-paciente-resumo').textContent =
        `${pacientes.length} paciente(s) encontrado(s)`

    document.querySelectorAll('.tabela-pacientes .ordenar').forEach(botao => {
        const ativo = botao.dataset.coluna === ordenacao.coluna
        botao.classList.toggle('ativo', ativo)
        botao.querySelector('span').textContent = ativo ? (ordenacao.crescente ? '↑' : '↓') : '⇅'
    })

    document.getElementById('busca-paciente-corpo').innerHTML = pacientes.map(paciente => `
        <tr>
            <td class="nome-paciente">${escaparHtml(paciente.nm_paciente.toLocaleUpperCase('pt-BR'))}</td>
            <td>${escaparHtml(formatarCPF(paciente.cd_cpf))}</td>
            <td>${escaparHtml(formatarData(paciente.dt_nascimento))}</td>
            <td>${escaparHtml(formatarTelefone(paciente.cd_telefone))}</td>
            <td class="coluna-acoes">
                <button type="button" class="icone-acao" data-acao="ver" data-paciente-id="${paciente.cd_paciente}" title="Ver prontuário" aria-label="Ver prontuário de ${escaparHtml(paciente.nm_paciente)}">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C6.5 5 2.7 9.4 1.5 12c1.2 2.6 5 7 10.5 7s9.3-4.4 10.5-7C21.3 9.4 17.5 5 12 5zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></svg>
                </button>
                <button type="button" class="icone-acao" data-acao="editar" data-paciente-id="${paciente.cd_paciente}" title="Editar prontuário" aria-label="Editar prontuário de ${escaparHtml(paciente.nm_paciente)}">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm17.7-10.2a1 1 0 0 0 0-1.42l-2.33-2.33a1 1 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
            </td>
        </tr>`).join('')
}

function ordenar(pacientes) {
    const chave = {
        nome: p => normalizar(p.nm_paciente),
        cpf: p => somenteDigitos(p.cd_cpf),
        nascimento: p => p.dt_nascimento || '',
        telefone: p => somenteDigitos(p.cd_telefone)
    }[ordenacao.coluna]

    pacientes.sort((a, b) => {
        const resultado = chave(a).localeCompare(chave(b), 'pt-BR')
        return ordenacao.crescente ? resultado : -resultado
    })
}

function mostrarVazio(titulo, texto) {
    document.getElementById('busca-paciente-vazio').hidden = false
    document.getElementById('busca-paciente-vazio-titulo').textContent = titulo
    document.getElementById('busca-paciente-vazio-texto').textContent = texto
}

function normalizar(texto) {
    return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/* ------------------------------------------------------------------ */
/* Prontuário do paciente                                              */
/* ------------------------------------------------------------------ */

function configurarDetalhe() {
    const voltar = document.getElementById('btn-voltar-pacientes')
    if (!voltar || voltar.dataset.configurado) return

    voltar.addEventListener('click', () => {
        pacienteAberto = null
        editarClinico(false)
        mostrarDetalhe(false)
    })

    document.getElementById('btn-editar-clinico').addEventListener('click', () => editarClinico(true))
    document.getElementById('btn-cancelar-clinico').addEventListener('click', () => {
        editarClinico(false)
        renderizarProntuario()   // descarta o que foi digitado
    })
    document.getElementById('form-prontuario-clinico').addEventListener('submit', salvarClinico)
    document.getElementById('form-evolucao').addEventListener('submit', salvarEvolucao)
    document.getElementById('btn-prescrever-prontuario').addEventListener('click', () => {
        alertas.novoLembreteParaPaciente(pacienteAberto)
        abrirTela('alertas')
    })

    voltar.dataset.configurado = 'true'
}

function mostrarDetalhe(mostrar) {
    document.getElementById('prontuario-busca').hidden = mostrar
    document.getElementById('prontuario-detalhe').hidden = !mostrar
    document.querySelector('.main-content')?.scrollTo(0, 0)
}

function editarClinico(editando) {
    document.getElementById('form-prontuario-clinico').hidden = !editando
    document.getElementById('prontuario-clinico-leitura').hidden = editando
    document.getElementById('btn-editar-clinico').hidden = editando
    if (editando) document.getElementById('prontuario-diagnostico').focus()
}

async function renderizarProntuario() {
    const dados = await data.carregarDados()
    const paciente = dados.pacientes.find(p => p.cd_paciente === pacienteAberto)
    if (!paciente) {
        mostrarDetalhe(false)
        return
    }

    const registro = obterRegistro(dados, pacienteAberto)
    const consultas = dados.consultas
        .filter(c => c.cd_paciente === pacienteAberto)
        .sort((a, b) => b.dt_agendamento.localeCompare(a.dt_agendamento))
    const { usuario } = usuarioLogado()

    document.getElementById('prontuario-responsavel').textContent = `Responsável: ${usuario?.nm_medico || 'Médico'}`

    renderizarPerfil(paciente, dados, consultas)
    renderizarClinico(registro, dados)
    renderizarEvolucoes(registro, dados)
    renderizarMedicamentos(dados)
    renderizarConsultas(consultas)
}

function renderizarPerfil(paciente, dados, consultas) {
    const idade = calcularIdade(paciente.dt_nascimento)
    const endereco = dados.enderecos.find(e => e.cd_paciente === paciente.cd_paciente)
    const agora = new Date()
    const ultima = consultas.find(c => statusConsulta(c) === 'Realizada')
    const proxima = [...consultas].reverse()
        .find(c => c.cd_status !== 3 && date.converterToNewDate(c.dt_agendamento) >= agora)
    const genero = { M: 'Masculino', F: 'Feminino' }[paciente.sg_genero] || 'Não informado'

    const campos = [
        ['CPF', formatarCPF(paciente.cd_cpf)],
        ['Data de nascimento', formatarData(paciente.dt_nascimento)],
        ['Sexo', genero],
        ['Tipo sanguíneo', paciente.sg_tipo_sanguineo || 'Não informado'],
        ['Telefone', formatarTelefone(paciente.cd_telefone)],
        ['E-mail', paciente.ds_email || '-'],
        ['Endereço', endereco
            ? `${endereco.nm_rua}, ${endereco.ds_numero} — ${endereco.cidade?.nm_cidade || ''}/${endereco.cidade?.sg_uf || ''}`
            : 'Não informado'],
        ['Última consulta', ultima ? formatarData(ultima.dt_agendamento) : 'Nenhuma'],
        ['Próxima consulta', proxima ? `${formatarData(proxima.dt_agendamento)} às ${proxima.horario}` : 'Nenhuma']
    ]

    document.getElementById('prontuario-perfil').innerHTML = `
        <div class="profile-avatar">${escaparHtml(iniciais(paciente.nm_paciente))}</div>
        <h3>${escaparHtml(paciente.nm_paciente)}</h3>
        <span>${idade === null ? 'Idade não informada' : `${idade} anos`}</span>
        <hr>
        ${campos.map(([rotulo, valor]) => `
            <div class="profile-data">
                <small>${rotulo}</small>
                <strong>${escaparHtml(valor)}</strong>
            </div>`).join('')}`
}

function renderizarClinico(registro, dados) {
    const diagnostico = dados.diagnosticos.find(d => d.cd_diagnostico === registro.cd_diagnostico)

    document.getElementById('prontuario-clinico-leitura').innerHTML = `
        <div>
            <dt>Diagnóstico principal</dt>
            <dd>${escaparHtml(diagnostico?.nm_diagnostico || 'Nenhum registrado')}</dd>
        </div>
        <div>
            <dt>Alergias</dt>
            <dd class="${registro.ds_alergias ? 'alerta-texto' : ''}">${escaparHtml(registro.ds_alergias || 'Nenhuma alergia conhecida')}</dd>
        </div>
        <div class="dados-clinicos-inteiro">
            <dt>Observações clínicas</dt>
            <dd>${escaparHtml(registro.ds_observacoes || 'Sem observações.')}</dd>
        </div>`

    // Preenche o formulário de edição só quando ele não está aberto (para não apagar o que está sendo digitado)
    if (document.getElementById('form-prontuario-clinico').hidden) {
        document.getElementById('prontuario-diagnostico').innerHTML =
            '<option value="">Nenhum</option>' +
            dados.diagnosticos.map(d => `<option value="${d.cd_diagnostico}">${escaparHtml(d.nm_diagnostico)}</option>`).join('')
        document.getElementById('prontuario-diagnostico').value = registro.cd_diagnostico ?? ''
        document.getElementById('prontuario-alergias').value = registro.ds_alergias || ''
        document.getElementById('prontuario-observacoes').value = registro.ds_observacoes || ''
    }
}

function renderizarEvolucoes(registro, dados) {
    const lista = document.getElementById('prontuario-evolucoes')
    const evolucoes = [...(registro.evolucoes || [])].sort((a, b) => b.dt_registro.localeCompare(a.dt_registro))
    document.getElementById('prontuario-evolucoes-resumo').textContent = `${evolucoes.length} registro(s)`

    lista.innerHTML = evolucoes.length
        ? evolucoes.map(evolucao => {
            const medico = dados.medicos.find(m => m.cd_medico === evolucao.cd_medico)
            return `
                <li>
                    <div class="linha-tempo-cabecalho">
                        <strong>${escaparHtml(formatarDataHora(evolucao.dt_registro))}</strong>
                        <span>${escaparHtml(medico?.nm_medico || 'Médico')}${medico?.especialidade ? ` · ${escaparHtml(medico.especialidade.nm_especialidade)}` : ''}</span>
                    </div>
                    <p>${escaparHtml(evolucao.ds_texto)}</p>
                </li>`
        }).join('')
        : '<li class="linha-tempo-vazia">Nenhum atendimento registrado ainda.</li>'
}

function renderizarMedicamentos(dados) {
    const hoje = dataISO()
    const lembretes = dados.alertas
        .filter(a => a.cd_paciente === pacienteAberto)
        .sort((a, b) => b.dt_inicio.localeCompare(a.dt_inicio))

    document.getElementById('prontuario-medicamentos').innerHTML = lembretes.length
        ? lembretes.map(a => {
            const situacao = a.dt_fim && a.dt_fim < hoje ? 'Encerrado' : a.dt_inicio > hoje ? 'Vai começar' : 'Em uso'
            const classe = { 'Em uso': 'confirmed', 'Vai começar': 'waiting', 'Encerrado': 'blocked' }[situacao]
            return `
                <tr>
                    <td><strong>${escaparHtml(a.medicamento?.nm_medicamento || '-')}</strong></td>
                    <td>${escaparHtml(a.ds_dosagem)} · ${escaparHtml(a.ds_horario)}</td>
                    <td>${formatarData(a.dt_inicio)} a ${a.dt_fim ? formatarData(a.dt_fim) : 'sem data de término'}</td>
                    <td><span class="status ${classe}">${situacao}</span></td>
                </tr>`
        }).join('')
        : '<tr><td colspan="4" class="celula-vazia">Nenhum medicamento prescrito.</td></tr>'
}

function renderizarConsultas(consultas) {
    document.getElementById('prontuario-consultas-resumo').textContent = `${consultas.length} consulta(s)`
    document.getElementById('prontuario-consultas').innerHTML = consultas.length
        ? consultas.map(c => {
            const status = statusConsulta(c)
            return `
                <tr>
                    <td>${formatarData(c.dt_agendamento)} · ${escaparHtml(c.horario)}</td>
                    <td>${escaparHtml(c.medico?.nm_medico || '-')}</td>
                    <td>${escaparHtml(c.diagnostico?.nm_diagnostico || '-')}</td>
                    <td><span class="status ${classeStatus(status)}">${escaparHtml(status)}</span></td>
                </tr>`
        }).join('')
        : '<tr><td colspan="4" class="celula-vazia">Nenhuma consulta.</td></tr>'
}

/* ------------------------------------------------------------------ */
/* Salvamento                                                          */
/* ------------------------------------------------------------------ */

function obterRegistro(dados, cdPaciente) {
    return dados.prontuarios.find(p => p.cd_paciente === cdPaciente) || {
        cd_paciente: cdPaciente,
        ds_alergias: '',
        cd_diagnostico: null,
        ds_observacoes: '',
        evolucoes: []
    }
}

function salvarRegistro(dados, registroAtualizado) {
    const outros = dados.prontuarios.filter(p => p.cd_paciente !== registroAtualizado.cd_paciente)
    data.salvarDados('prontuarios', [...outros, registroAtualizado])
}

async function salvarClinico(evento) {
    evento.preventDefault()
    if (usuarioLogado().tipo !== 'medico') return

    const dados = await data.carregarDados()
    const registro = obterRegistro(dados, pacienteAberto)
    const diagnostico = document.getElementById('prontuario-diagnostico').value

    salvarRegistro(dados, {
        ...registro,
        cd_diagnostico: diagnostico ? Number(diagnostico) : null,
        ds_alergias: document.getElementById('prontuario-alergias').value.trim(),
        ds_observacoes: document.getElementById('prontuario-observacoes').value.trim()
    })

    editarClinico(false)
    avisarMudanca()
}

async function salvarEvolucao(evento) {
    evento.preventDefault()
    const erro = document.getElementById('erro-evolucao')
    const campo = document.getElementById('prontuario-evolucao-texto')
    const texto = campo.value.trim()
    const { tipo, usuario } = usuarioLogado()

    erro.hidden = true
    if (tipo !== 'medico') return
    if (texto.length < 5) {
        erro.textContent = 'Descreva o atendimento antes de salvar.'
        erro.hidden = false
        return
    }

    const dados = await data.carregarDados()
    const registro = obterRegistro(dados, pacienteAberto)
    salvarRegistro(dados, {
        ...registro,
        evolucoes: [...(registro.evolucoes || []), {
            dt_registro: dataHoraBanco(new Date()),
            cd_medico: usuario.cd_medico,
            ds_texto: texto
        }]
    })

    campo.value = ''
    avisarMudanca()
}
