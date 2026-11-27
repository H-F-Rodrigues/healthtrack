import * as data from '../dados.js'
import * as date from '../date.js'
import * as prontuario from './prontuario.js'
import {
    escaparHtml, iniciais, classeStatus, statusConsulta, proximoId, usuarioLogado,
    dataISO, dataHoraBanco, formatarDataHora, avisarMudanca, abrirTela
} from '../util.js'

// Horários de atendimento da clínica (consultas de 30 minutos)
const HORARIOS = []
for (let hora = 8; hora < 18; hora++) {
    HORARIOS.push(`${String(hora).padStart(2, '0')}:00`, `${String(hora).padStart(2, '0')}:30`)
}

const MS_24H = 24 * 60 * 60 * 1000
const STATUS = { AGUARDANDO: 1, CONFIRMADA: 2, CANCELADA: 3 }

let diaSelecionado = hojeSemHora()
let consultaEmEdicao = null   // cd_consulta quando o formulário está remarcando

export async function load() {
    const diaAtual = document.getElementById('dia-atual')
    const lista = document.querySelector('.screen-agendamento .appointment-list')
    if (!diaAtual || !lista) return false

    const { tipo } = usuarioLogado()
    configurarCabecalho(tipo)
    configurarNavegacao()
    configurarFormulario()
    configurarAcoesLista(lista)

    diaAtual.textContent = formatarDia(diaSelecionado)

    try {
        const dados = await data.carregarDados()
        const consultasDoDia = filtrarPorUsuario(dados.consultas || [])
            .filter(consulta => date.compararData(consulta.dt_agendamento, diaSelecionado))
            .sort((a, b) => (a.horario || '').localeCompare(b.horario || ''))

        lista.innerHTML = consultasDoDia.length
            ? consultasDoDia.map(consulta => criarCard(consulta, tipo)).join('')
            : '<div class="empty-card">Não há consultas para este dia.</div>'

        await preencherSelects(dados)
        return true
    } catch (erro) {
        console.error('Erro ao carregar agendamentos:', erro)
        lista.textContent = 'Não foi possível carregar os agendamentos.'
        return false
    }
}

function configurarCabecalho(tipo) {
    if (tipo !== 'medico') return
    document.getElementById('agendamento-titulo').textContent = 'Minha agenda'
    document.getElementById('agendamento-subtitulo').textContent =
        'Suas consultas do dia. Alterações na agenda são feitas pela recepção.'
}

/* ------------------------------------------------------------------ */
/* Navegação entre dias                                                */
/* ------------------------------------------------------------------ */

function configurarNavegacao() {
    const dateBar = document.querySelector('.screen-agendamento .date-bar')
    if (!dateBar || dateBar.dataset.configurado) return

    dateBar.addEventListener('click', evento => {
        const botao = evento.target.closest('button[data-dia]')
        if (!botao) return

        if (botao.dataset.dia === 'hoje') {
            diaSelecionado = hojeSemHora()
        } else {
            diaSelecionado = new Date(diaSelecionado)
            diaSelecionado.setDate(diaSelecionado.getDate() + Number(botao.dataset.dia))
        }
        load()
    })
    dateBar.dataset.configurado = 'true'
}

/* ------------------------------------------------------------------ */
/* Formulário de nova consulta / remarcação (somente recepção)         */
/* ------------------------------------------------------------------ */

function configurarFormulario() {
    const form = document.getElementById('form-nova-consulta')
    if (!form || form.dataset.configurado) return

    document.getElementById('btn-abrir-form-agendamento')?.addEventListener('click', () => abrirFormulario())
    document.getElementById('btn-cancelar-form-agendamento').addEventListener('click', fecharFormulario)

    // Ao trocar médico ou data, recalcula os horários livres
    document.getElementById('agendamento-medico').addEventListener('change', atualizarHorarios)
    document.getElementById('agendamento-data').addEventListener('change', atualizarHorarios)

    form.addEventListener('submit', salvarConsulta)
    form.dataset.configurado = 'true'
}

async function preencherSelects(dados) {
    const pacientes = document.getElementById('agendamento-paciente')
    const medicos = document.getElementById('agendamento-medico')
    if (!pacientes || !medicos) return

    const pacienteAtual = pacientes.value
    const medicoAtual = medicos.value

    pacientes.innerHTML = '<option value="">Selecione o paciente</option>' + [...dados.pacientes]
        .sort((a, b) => a.nm_paciente.localeCompare(b.nm_paciente))
        .map(p => `<option value="${p.cd_paciente}">${escaparHtml(p.nm_paciente)}</option>`)
        .join('')

    medicos.innerHTML = '<option value="">Selecione o médico</option>' + [...dados.medicos]
        .sort((a, b) => a.nm_medico.localeCompare(b.nm_medico))
        .map(m => `<option value="${m.cd_medico}">${escaparHtml(m.nm_medico)} — ${escaparHtml(m.especialidade?.nm_especialidade || 'Clínico')}</option>`)
        .join('')

    pacientes.value = pacienteAtual
    medicos.value = medicoAtual
}

async function abrirFormulario(consulta = null) {
    const form = document.getElementById('form-nova-consulta')
    const pacientes = document.getElementById('agendamento-paciente')
    const medicos = document.getElementById('agendamento-medico')
    const dataInput = document.getElementById('agendamento-data')

    consultaEmEdicao = consulta?.cd_consulta ?? null
    document.getElementById('erro-agendamento').hidden = true
    document.getElementById('form-agendamento-titulo').textContent = consulta ? 'Remarcar consulta' : 'Nova consulta'
    document.getElementById('btn-salvar-agendamento').textContent = consulta ? 'Salvar nova data' : 'Salvar consulta'

    dataInput.min = dataISO()
    pacientes.disabled = Boolean(consulta)

    if (consulta) {
        pacientes.value = String(consulta.cd_paciente)
        medicos.value = String(consulta.cd_medico)
        dataInput.value = dataISO(consulta.dt_agendamento)
    } else {
        form.reset()
        dataInput.value = dataISO(diaSelecionado < hojeSemHora() ? new Date() : diaSelecionado)
    }

    form.hidden = false
    await atualizarHorarios(consulta?.horario)
    form.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function fecharFormulario() {
    const form = document.getElementById('form-nova-consulta')
    form.reset()
    form.hidden = true
    consultaEmEdicao = null
    document.getElementById('agendamento-paciente').disabled = false
}

// Lista só os horários em que o médico está livre (e que ainda não passaram)
async function atualizarHorarios(horarioPreferido) {
    const select = document.getElementById('agendamento-horario')
    const medicoId = Number(document.getElementById('agendamento-medico').value)
    const dia = document.getElementById('agendamento-data').value

    if (!medicoId || !dia) {
        select.innerHTML = '<option value="">Escolha médico e data</option>'
        return
    }

    const dados = await data.carregarDados()
    const agora = new Date()
    const ocupados = new Set(
        dados.consultas
            .filter(c => c.cd_medico === medicoId && c.cd_status !== STATUS.CANCELADA && c.cd_consulta !== consultaEmEdicao)
            .filter(c => c.dt_agendamento.startsWith(dia))
            .map(c => c.horario)
    )

    const livres = HORARIOS.filter(h => !ocupados.has(h) && date.converterToNewDate(`${dia}T${h}:00`) > agora)

    select.innerHTML = livres.length
        ? livres.map(h => `<option value="${h}">${h}</option>`).join('')
        : '<option value="">Sem horários livres neste dia</option>'

    if (typeof horarioPreferido === 'string' && livres.includes(horarioPreferido)) {
        select.value = horarioPreferido
    }
}

async function salvarConsulta(evento) {
    evento.preventDefault()
    const erro = document.getElementById('erro-agendamento')
    erro.hidden = true

    try {
        const { tipo, usuario } = usuarioLogado()
        if (tipo !== 'recepcionista') throw new Error('Somente a recepção pode agendar consultas.')

        const dados = await data.carregarDados()
        const pacienteId = Number(document.getElementById('agendamento-paciente').value)
        const medicoId = Number(document.getElementById('agendamento-medico').value)
        const dia = document.getElementById('agendamento-data').value
        const horario = document.getElementById('agendamento-horario').value
        const inicio = date.converterToNewDate(`${dia}T${horario}:00`)

        if (!pacienteId) throw new Error('Selecione o paciente.')
        if (!medicoId) throw new Error('Selecione o médico.')
        if (!horario || isNaN(inicio)) throw new Error('Selecione um horário disponível.')
        if (inicio <= new Date()) throw new Error('Escolha um horário no futuro.')

        validarConflito(dados.consultas, pacienteId, medicoId, inicio, consultaEmEdicao)

        const paciente = dados.pacientes.find(p => p.cd_paciente === pacienteId)
        const medico = dados.medicos.find(m => m.cd_medico === medicoId)
        let consultas

        if (consultaEmEdicao) {
            consultas = dados.consultas.map(c => c.cd_consulta === consultaEmEdicao
                ? { ...c, cd_medico: medicoId, cd_status: STATUS.AGUARDANDO, dt_agendamento: dataHoraBanco(inicio) }
                : c)
        } else {
            consultas = [...dados.consultas, {
                cd_consulta: proximoId(dados.consultas, 'cd_consulta'),
                cd_paciente: pacienteId,
                cd_medico: medicoId,
                cd_recepcionista: usuario?.cd_recepcionista ?? null,
                cd_diagnostico: null,
                cd_status: STATUS.AGUARDANDO,
                dt_agendamento: dataHoraBanco(inicio)
            }]
        }

        data.salvarDados('consultas', consultas.map(consultaCrua))
        adicionarNotificacao(
            dados.notificacoes,
            consultaEmEdicao ? 'Consulta remarcada' : 'Consulta agendada',
            `${paciente?.nm_paciente || 'Paciente'} com ${medico?.nm_medico || 'médico'} em ${formatarDataHora(inicio)}.`,
            pacienteId,
            medicoId
        )

        diaSelecionado = hojeSemHora(inicio)
        fecharFormulario()
        avisarMudanca()
    } catch (erroSalvamento) {
        erro.textContent = erroSalvamento.message || 'Não foi possível salvar o agendamento.'
        erro.hidden = false
    }
}

/* ------------------------------------------------------------------ */
/* Ações dos cards                                                     */
/* ------------------------------------------------------------------ */

function configurarAcoesLista(lista) {
    if (lista.dataset.acoesConfiguradas) return

    lista.addEventListener('click', async evento => {
        const botao = evento.target.closest('button[data-acao]')
        if (!botao || botao.disabled) return

        const consultaId = Number(botao.dataset.consultaId)
        const acao = botao.dataset.acao

        if (acao === 'prontuario') {
            prontuario.abrirProntuario(Number(botao.dataset.pacienteId))
            abrirTela('prontuario')
            return
        }

        const dados = await data.carregarDados()
        const consulta = dados.consultas.find(c => c.cd_consulta === consultaId)
        if (!consulta) return

        if (acao === 'confirmar') alterarStatus(consulta, STATUS.CONFIRMADA, 'Consulta confirmada')
        if (acao === 'cancelar' && window.confirm(`Cancelar a consulta de ${consulta.paciente?.nm_paciente} às ${consulta.horario}?`)) {
            alterarStatus(consulta, STATUS.CANCELADA, 'Consulta cancelada')
        }
        if (acao === 'remarcar') abrirFormulario(consulta)
    })
    lista.dataset.acoesConfiguradas = 'true'
}

async function alterarStatus(consulta, novoStatus, titulo) {
    if (usuarioLogado().tipo !== 'recepcionista') return

    const dados = await data.carregarDados()
    const consultas = dados.consultas.map(c => c.cd_consulta === consulta.cd_consulta ? { ...c, cd_status: novoStatus } : c)
    data.salvarDados('consultas', consultas.map(consultaCrua))
    adicionarNotificacao(
        dados.notificacoes,
        titulo,
        `${consulta.paciente?.nm_paciente || 'Paciente'} com ${consulta.medico?.nm_medico || 'médico'} em ${formatarDataHora(consulta.dt_agendamento)}.`,
        consulta.cd_paciente,
        consulta.cd_medico
    )
    avisarMudanca()
}

function criarCard(consulta, tipo) {
    const paciente = consulta.paciente?.nm_paciente || 'Paciente não identificado'
    const medico = consulta.medico?.nm_medico || 'Médico'
    const especialidade = consulta.medico?.especialidade?.nm_especialidade || 'Clínico'
    const status = statusConsulta(consulta)
    const atributos = `data-consulta-id="${consulta.cd_consulta}"`
    const detalhe = tipo === 'medico' ? especialidade : `${medico} · ${especialidade}`

    let acoes = ''
    const encerrada = consulta.cd_status === STATUS.CANCELADA || date.converterToNewDate(consulta.dt_agendamento) <= new Date()

    if (tipo === 'recepcionista' && !encerrada) {
        const podeAlterar = podeAlterarConsulta(consulta)
        const bloqueio = podeAlterar ? '' : 'disabled title="Bloqueado: faltam menos de 24h para a consulta."'
        acoes = `
            ${status === 'Aguardando'
                ? `<button class="primary-button" type="button" data-acao="confirmar" ${atributos}>Confirmar</button>`
                : ''}
            <button class="${podeAlterar ? 'outline-button' : 'disabled-button'}" type="button" data-acao="remarcar" ${atributos} ${bloqueio}>Remarcar</button>
            <button class="${podeAlterar ? 'danger-button' : 'disabled-button'}" type="button" data-acao="cancelar" ${atributos} ${bloqueio}>Cancelar</button>`
    } else if (tipo === 'medico' && status !== 'Cancelada') {
        acoes = `<button class="outline-button" type="button" data-acao="prontuario" data-paciente-id="${consulta.cd_paciente}">Abrir prontuário</button>`
    }

    return `
        <div class="appointment-card">
            <div class="patient">
                <div class="avatar">${escaparHtml(iniciais(paciente))}</div>
                <div>
                    <strong>${escaparHtml(paciente)}</strong>
                    <span>${escaparHtml(detalhe)}</span>
                </div>
            </div>
            <div class="appointment-time">${escaparHtml(consulta.horario || '--:--')}</div>
            <span class="status ${classeStatus(status)}">${escaparHtml(status)}</span>
            ${acoes}
        </div>`
}

/* ------------------------------------------------------------------ */
/* Regras e utilitários                                                */
/* ------------------------------------------------------------------ */

function podeAlterarConsulta(consulta) {
    if (consulta.cd_status === STATUS.CANCELADA) return false
    const dataConsulta = date.converterToNewDate(consulta.dt_agendamento || '')
    return !isNaN(dataConsulta) && dataConsulta.getTime() - Date.now() >= MS_24H
}

function validarConflito(consultas, pacienteId, medicoId, inicio, ignorarId = null) {
    const conflito = consultas.find(consulta => {
        if (consulta.cd_consulta === ignorarId || consulta.cd_status === STATUS.CANCELADA) return false
        const inicioExistente = date.converterToNewDate(consulta.dt_agendamento)
        if (isNaN(inicioExistente)) return false
        const sobrepoe = Math.abs(inicioExistente - inicio) < 30 * 60 * 1000
        return sobrepoe && (consulta.cd_medico === medicoId || consulta.cd_paciente === pacienteId)
    })

    if (!conflito) return
    if (conflito.cd_medico === medicoId) throw new Error('O médico já tem uma consulta nesse horário.')
    throw new Error('O paciente já tem outra consulta nesse horário.')
}

function filtrarPorUsuario(consultas) {
    const { tipo, usuario } = usuarioLogado()
    if (tipo === 'paciente') return consultas.filter(c => c.cd_paciente === usuario?.cd_paciente)
    if (tipo === 'medico') return consultas.filter(c => c.cd_medico === usuario?.cd_medico)
    return consultas
}

function adicionarNotificacao(notificacoes, titulo, mensagem, pacienteId, medicoId) {
    const lista = notificacoes || []
    data.salvarDados('notificacoes', [{
        id: proximoId(lista, 'id'),
        titulo,
        mensagem,
        data: new Date().toISOString(),
        lida: false,
        cd_paciente: pacienteId,
        cd_medico: medicoId
    }, ...lista])
}

// Remove os objetos relacionados (paciente, médico...) antes de salvar
function consultaCrua(consulta) {
    return {
        cd_consulta: consulta.cd_consulta,
        cd_paciente: consulta.cd_paciente,
        cd_medico: consulta.cd_medico,
        cd_recepcionista: consulta.cd_recepcionista ?? null,
        cd_diagnostico: consulta.cd_diagnostico ?? null,
        cd_status: consulta.cd_status,
        dt_agendamento: consulta.dt_agendamento
    }
}

function hojeSemHora(referencia = new Date()) {
    const d = new Date(referencia)
    d.setHours(0, 0, 0, 0)
    return d
}

function formatarDia(dia) {
    const texto = dia.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const prefixo = date.compararData(dia) ? 'Hoje, ' : ''
    return prefixo + texto.charAt(0).toUpperCase() + texto.slice(1)
}
