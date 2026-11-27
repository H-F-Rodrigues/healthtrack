import * as data from '../dados.js'
import {
    escaparHtml, formatarData, proximoId, usuarioLogado, dataISO, avisarMudanca
} from '../util.js'

let filtro = 'ativos'

export async function load() {
    const lista = document.getElementById('lista-alertas')
    if (!lista) return false

    const { tipo, usuario } = usuarioLogado()
    if (tipo !== 'medico') return false

    try {
        const dados = await data.carregarDados()
        preencherFormulario(dados)
        configurarFormulario()
        configurarFiltros()
        configurarLista(lista)

        const hoje = dataISO()
        const meus = dados.alertas
            .filter(alerta => alerta.cd_medico === usuario.cd_medico)
            .map(alerta => ({ ...alerta, situacao: situacao(alerta, hoje) }))
            .filter(alerta => {
                if (filtro === 'ativos') return alerta.situacao !== 'Encerrado'
                if (filtro === 'encerrados') return alerta.situacao === 'Encerrado'
                return true
            })
            .sort((a, b) => b.dt_inicio.localeCompare(a.dt_inicio))

        lista.innerHTML = meus.length
            ? meus.map(alerta => criarCard(alerta, dados.pacientes)).join('')
            : '<div class="empty-card">Nenhum lembrete nesta lista.</div>'
        return true
    } catch (erro) {
        console.error('Erro ao carregar lembretes:', erro)
        lista.textContent = 'Não foi possível carregar os lembretes.'
        return false
    }
}

// Usado pelo prontuário: abre o formulário já com o paciente escolhido
export async function novoLembreteParaPaciente(cdPaciente) {
    const dados = await data.carregarDados()
    preencherFormulario(dados)
    abrirFormulario()
    document.getElementById('alerta-paciente').value = String(cdPaciente)
}

function situacao(alerta, hoje) {
    if (alerta.dt_fim && alerta.dt_fim < hoje) return 'Encerrado'
    if (alerta.dt_inicio > hoje) return 'Vai começar'
    return 'Em uso'
}

function preencherFormulario(dados) {
    const pacientes = document.getElementById('alerta-paciente')
    const medicamentos = document.getElementById('alerta-medicamento')
    if (!pacientes || pacientes.options.length) return

    pacientes.innerHTML = '<option value="">Selecione o paciente</option>' + [...dados.pacientes]
        .sort((a, b) => a.nm_paciente.localeCompare(b.nm_paciente))
        .map(p => `<option value="${p.cd_paciente}">${escaparHtml(p.nm_paciente)}</option>`)
        .join('')
    medicamentos.innerHTML = '<option value="">Selecione o medicamento</option>' + [...dados.medicamentos]
        .sort((a, b) => a.nm_medicamento.localeCompare(b.nm_medicamento))
        .map(m => `<option value="${m.cd_medicamento}">${escaparHtml(m.nm_medicamento)}</option>`)
        .join('')
}

function abrirFormulario() {
    const form = document.getElementById('form-novo-alerta')
    form.reset()
    document.getElementById('erro-alerta').hidden = true
    document.getElementById('alerta-inicio').value = dataISO()
    configurarDataFim()
    form.hidden = false
}

function configurarFormulario() {
    const form = document.getElementById('form-novo-alerta')
    if (form.dataset.configurado) return

    document.getElementById('btn-abrir-form-alerta').addEventListener('click', abrirFormulario)
    document.getElementById('btn-cancelar-form-alerta').addEventListener('click', () => { form.hidden = true })
    document.getElementById('alerta-sem-fim').addEventListener('change', configurarDataFim)
    form.addEventListener('submit', salvarAlerta)
    form.dataset.configurado = 'true'
}

function configurarDataFim() {
    const semFim = document.getElementById('alerta-sem-fim').checked
    const fim = document.getElementById('alerta-fim')
    fim.disabled = semFim
    fim.required = !semFim
    if (semFim) fim.value = ''
}

function configurarFiltros() {
    const grupo = document.querySelector('.screen-alertas .filtro-abas')
    if (grupo.dataset.configurado) return

    grupo.addEventListener('click', evento => {
        const botao = evento.target.closest('button[data-filtro]')
        if (!botao) return
        filtro = botao.dataset.filtro
        grupo.querySelectorAll('.aba').forEach(aba => aba.classList.toggle('ativa', aba === botao))
        load()
    })
    grupo.dataset.configurado = 'true'
}

function configurarLista(lista) {
    if (lista.dataset.configurado) return

    lista.addEventListener('click', async evento => {
        const botao = evento.target.closest('button[data-suspender]')
        if (!botao) return
        if (!window.confirm('Suspender este medicamento a partir de hoje?')) return

        const dados = await data.carregarDados()
        const ontem = new Date()
        ontem.setDate(ontem.getDate() - 1)
        const id = Number(botao.dataset.suspender)

        // Se ainda não começou (ou começa hoje), a prescrição é removida; senão, termina ontem
        const atualizados = dados.alertas
            .filter(a => !(a.cd_alerta === id && a.dt_inicio >= dataISO()))
            .map(a => alertaCrua(a.cd_alerta === id ? { ...a, dt_fim: dataISO(ontem) } : a))

        data.salvarDados('alertas', atualizados)
        avisarMudanca()
    })
    lista.dataset.configurado = 'true'
}

async function salvarAlerta(evento) {
    evento.preventDefault()
    const erro = document.getElementById('erro-alerta')
    erro.hidden = true

    try {
        const { usuario } = usuarioLogado()
        const dados = await data.carregarDados()
        const pacienteId = Number(document.getElementById('alerta-paciente').value)
        const medicamentoId = Number(document.getElementById('alerta-medicamento').value)
        const inicio = document.getElementById('alerta-inicio').value
        const semFim = document.getElementById('alerta-sem-fim').checked
        const fim = semFim ? null : document.getElementById('alerta-fim').value

        if (!pacienteId) throw new Error('Selecione o paciente.')
        if (!medicamentoId) throw new Error('Selecione o medicamento.')
        if (!inicio) throw new Error('Informe a data de início.')
        if (!semFim && (!fim || fim < inicio)) {
            throw new Error('A data final deve ser igual ou posterior à data inicial.')
        }

        const alerta = {
            cd_alerta: proximoId(dados.alertas, 'cd_alerta'),
            cd_paciente: pacienteId,
            cd_medico: usuario.cd_medico,
            cd_medicamento: medicamentoId,
            ds_dosagem: document.getElementById('alerta-dosagem').value.trim(),
            ds_horario: document.getElementById('alerta-horario').value.trim(),
            dt_inicio: inicio,
            dt_fim: fim
        }

        data.salvarDados('alertas', [...dados.alertas.map(alertaCrua), alerta])

        const medicamento = dados.medicamentos.find(m => m.cd_medicamento === medicamentoId)
        const notificacoes = dados.notificacoes || []
        data.salvarDados('notificacoes', [{
            id: proximoId(notificacoes, 'id'),
            titulo: 'Novo lembrete de medicação',
            mensagem: `${medicamento?.nm_medicamento || 'Medicamento'} (${alerta.ds_dosagem}) — ${alerta.ds_horario}, de ${formatarData(inicio)} a ${fim ? formatarData(fim) : 'sem data de término'}.`,
            data: new Date().toISOString(),
            lida: false,
            cd_paciente: pacienteId,
            cd_medico: usuario.cd_medico
        }, ...notificacoes])

        document.getElementById('form-novo-alerta').hidden = true
        avisarMudanca()
    } catch (erroSalvamento) {
        erro.textContent = erroSalvamento.message || 'Não foi possível salvar o lembrete.'
        erro.hidden = false
    }
}

function criarCard(alerta, pacientes) {
    const paciente = pacientes.find(item => item.cd_paciente === alerta.cd_paciente)?.nm_paciente || 'Paciente'
    const medicamento = alerta.medicamento?.nm_medicamento || 'Medicamento'
    const classe = { 'Em uso': 'warning', 'Vai começar': 'warning', 'Encerrado': 'encerrado' }[alerta.situacao]
    const tag = { 'Em uso': 'confirmed', 'Vai começar': 'warning-tag', 'Encerrado': 'encerrado-tag' }[alerta.situacao]

    return `<div class="alert-card ${classe}">
        <div class="alert-icon">!</div>
        <div class="alert-content">
            <span class="alert-tag ${tag}">${alerta.situacao}</span>
            <h2>${escaparHtml(paciente)}</h2>
            <p><strong>${escaparHtml(medicamento)}</strong> — ${escaparHtml(alerta.ds_dosagem || '')} · ${escaparHtml(alerta.ds_horario || '')}</p>
            <span class="alert-periodo">${formatarData(alerta.dt_inicio)} a ${alerta.dt_fim ? formatarData(alerta.dt_fim) : 'sem data de término'}</span>
        </div>
        ${alerta.situacao !== 'Encerrado'
            ? `<button type="button" class="outline-button" data-suspender="${alerta.cd_alerta}">Suspender</button>`
            : ''}
    </div>`
}

function alertaCrua(alerta) {
    return {
        cd_alerta: alerta.cd_alerta,
        cd_paciente: alerta.cd_paciente,
        cd_medico: alerta.cd_medico,
        cd_medicamento: alerta.cd_medicamento,
        ds_dosagem: alerta.ds_dosagem,
        ds_horario: alerta.ds_horario,
        dt_inicio: alerta.dt_inicio,
        dt_fim: alerta.dt_fim
    }
}
