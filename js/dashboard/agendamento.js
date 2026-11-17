import * as data from '../dados.js'
import * as date from '../date.js'

let agendamentoData = new Date()

export async function load(referencia = new Date()) {
    const diaAtual = document.getElementById('dia-atual')
    const lista = document.querySelector('.screen-agendamento .appointment-list')

    if (!diaAtual || !lista) return false

    agendamentoData = new Date(referencia)
    agendamentoData.setHours(0, 0, 0, 0)

    diaAtual.textContent = formatarDataAgendamento(agendamentoData)

    configurarNavegacaoAgendamentos()

    const dados = await data.carregarDados()
    const consultas = dados['consultas'] || []

    const consultasDoDia = consultas
        .filter(c => date.compararData(c.dt_agendamento, agendamentoData))
        .sort((a, b) => (a.horario || '').localeCompare(b.horario || ''))

    if (consultasDoDia.length === 0) {
        lista.innerHTML = `
            <div class="appointment-card">
                <div class="patient">
                    <div>
                        <strong>Nenhum agendamento</strong>
                        <span>Não há consultas para este dia.</span>
                    </div>
                </div>
            </div>`

        return true
    }

    lista.innerHTML = consultasDoDia.map(criarCardAgendamento).join('')

    return true
}

function formatarDataAgendamento(dataReferencia) {
    const dataFormatada = dataReferencia.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })

    return dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)
}

function configurarNavegacaoAgendamentos() {
    const dateBar = document.querySelector('.screen-agendamento .date-bar')

    if (!dateBar || dateBar.dataset.configurado) return

    const [botaoAnterior, botaoProximo] = dateBar.querySelectorAll('button')

    botaoAnterior?.addEventListener('click', () => mudarDiaAgendamento(-1))
    botaoProximo?.addEventListener('click', () => mudarDiaAgendamento(1))

    dateBar.dataset.configurado = 'true'
}

function mudarDiaAgendamento(quantidade) {
    const novaData = new Date(agendamentoData)
    novaData.setDate(novaData.getDate() + quantidade)

    load(novaData)
}

function criarCardAgendamento(consulta) {
    const paciente = consulta.paciente?.nm_paciente || 'Paciente não identificado'
    const especialidade = consulta.medico?.especialidade?.nm_especialidade || 'Sem especialidade'
    const horario = consulta.horario
        || consulta.dt_agendamento?.split(' ')[1]?.substring(0, 5)
        || '--:--'
    const status = consulta.status?.nm_status || 'Sem status'

    const statusClass = {
        'Aguardando': 'waiting',
        'Confirmada': 'confirmed',
        'Cancelada': 'cancelled'
    }[status] || 'waiting'

    const cancelamentoBloqueado = !podeCancelarConsulta(consulta)

    const botaoCancelar = cancelamentoBloqueado
        ? `<button class="disabled-button" type="button" title="Cancelamento bloqueado a menos de 24h da consulta." aria-disabled="true">Cancelar</button>`
        : `<button class="danger-button" type="button">Cancelar</button>`

    return `
        <div class="appointment-card">
            <div class="patient">
                <div class="avatar">${iniciaisPaciente(paciente)}</div>

                <div>
                    <strong>${escaparHtml(paciente)}</strong>
                    <span>${escaparHtml(especialidade)}</span>
                </div>
            </div>

            <div class="appointment-time">${escaparHtml(horario)}</div>

            <span class="status ${statusClass}">${escaparHtml(status)}</span>

            <button class="outline-button" type="button">Remarcar</button>

            ${botaoCancelar}
        </div>`
}

function podeCancelarConsulta(consulta) {
    if (consulta.status?.nm_status === 'Cancelada') return false

    const dataConsulta = date.converterToNewDate(consulta.dt_agendamento || '')

    if (isNaN(dataConsulta)) return false

    const MS_POR_24H = 24 * 60 * 60 * 1000

    return dataConsulta.getTime() - Date.now() >= MS_POR_24H
}

function iniciaisPaciente(nome) {
    const partes = nome.trim().split(/\s+/).filter(Boolean)

    if (partes.length === 0) return '?'
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()

    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function escaparHtml(valor) {
    return String(valor).replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere])
}