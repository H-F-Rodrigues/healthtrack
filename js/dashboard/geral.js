import * as data from '../dados.js'
import * as date from '../date.js'

// Duração considerada para uma consulta (em minutos). Enquanto o horário
// atual estiver dentro desse intervalo, contado a partir do início da
// consulta, o médico é considerado "Em atendimento".
const DURACAO_CONSULTA_MINUTOS = 30

export async function load(referencia = new Date()) {
    configurarBackup()
    await loadInfo(referencia)
}

function configurarBackup() {
    const exportar = document.getElementById('btn-exportar-backup')
    const importar = document.getElementById('btn-importar-backup')
    const arquivo = document.getElementById('arquivo-backup')
    if (!exportar || !importar || !arquivo || exportar.dataset.configurado) return

    exportar.addEventListener('click', data.exportarDadosJSON)
    importar.addEventListener('click', () => arquivo.click())
    arquivo.addEventListener('change', evento => data.importarDadosJSON(evento))
    exportar.dataset.configurado = 'true'
}

async function loadInfo(referencia) {
    const dados = await data.carregarDados()
    const consultas = dados.consultas || []
    const medicos = dados.medicos || []

    loadPacientes(consultas, referencia)
    loadMedicosDisponiveis(consultas, medicos, referencia)
    loadAtendimentosHoje(consultas, referencia)

    return true
}

/* ------------------------------------------------------------------ */
/* Pacientes atendidos (hoje, semana e mês)                            */
/* ------------------------------------------------------------------ */

function loadPacientes(consultas, referencia) {
    const htmlPacientesHoje = document.getElementById('pacientes-hoje')
    const htmlPacientesSemana = document.getElementById('pacientes-semana')
    const htmlPacientesMes = document.getElementById('pacientes-mes')

    const pacientesHoje = new Set()
    const pacientesSemana = new Set()
    const pacientesMes = new Set()

    consultas.forEach(c => {
        if (!c.dt_agendamento || !c.cd_paciente) return

        const dataConsulta = date.converterToNewDate(c.dt_agendamento)
        if (c.cd_status === 2 && !isNaN(dataConsulta) && dataConsulta <= referencia) {
            if (date.compararData(c.dt_agendamento, referencia)) {
                pacientesHoje.add(c.cd_paciente)
            }
            if (date.mesmaSemana(c.dt_agendamento, referencia)) {
                pacientesSemana.add(c.cd_paciente)
            }
            if (date.mesmoMes(c.dt_agendamento, referencia)) {
                pacientesMes.add(c.cd_paciente)
            }
        }
    })

    if (htmlPacientesHoje) htmlPacientesHoje.innerHTML = pacientesHoje.size
    if (htmlPacientesSemana) htmlPacientesSemana.innerHTML = pacientesSemana.size
    if (htmlPacientesMes) htmlPacientesMes.innerHTML = pacientesMes.size
}

/* ------------------------------------------------------------------ */
/* Médicos disponíveis hoje                                            */
/* ------------------------------------------------------------------ */

function loadMedicosDisponiveis(consultas, medicos, referencia) {
    const lista = document.getElementById('medicos-disponiveis-lista')
    const resumo = document.getElementById('medicos-disponiveis-resumo')
    const total = document.getElementById('medicos-hoje')

    if (!lista) return

    // Um médico está disponível quando possui consulta agendada para o dia.
    // Consultas canceladas não colocam o médico em atendimento.
    const consultasDoDia = consultas.filter(c =>
        c.dt_agendamento &&
        c.cd_medico &&
        consultaAtiva(c) &&
        date.compararData(c.dt_agendamento, referencia)
    )

    const porMedico = new Map()

    consultasDoDia.forEach(c => {
        if (!porMedico.has(c.cd_medico)) porMedico.set(c.cd_medico, [])
        porMedico.get(c.cd_medico).push(c)
    })

    const disponiveis = []

    porMedico.forEach((consultasMedico, cdMedico) => {
        const medico = medicos.find(m => m.cd_medico == cdMedico)
        if (!medico) return

        disponiveis.push({
            medico,
            emAtendimento: consultasMedico.some(c => dentroDoHorario(c.dt_agendamento, referencia)),
            inicio: menorHorario(consultasMedico)
        })
    })

    // Quem está em atendimento aparece primeiro; depois, ordem de horário.
    disponiveis.sort((a, b) => {
        if (a.emAtendimento !== b.emAtendimento) return a.emAtendimento ? -1 : 1
        return a.inicio - b.inicio
    })

    if (disponiveis.length === 0) {
        lista.innerHTML = `
            <div class="appointment-card">
                <div class="patient">
                    <div>
                        <strong>Nenhum médico disponível</strong>
                        <span>Não há consultas agendadas para hoje.</span>
                    </div>
                </div>
            </div>`
    } else {
        lista.innerHTML = disponiveis.map(criarCardMedico).join('')
    }

    if (total) total.innerHTML = disponiveis.length
    if (resumo) resumo.textContent = `${disponiveis.length} de ${medicos.length} no quadro`
}

function criarCardMedico({ medico, emAtendimento }) {
    const nome = medico.nm_medico || 'Médico não identificado'
    const especialidade = medico.especialidade?.nm_especialidade || 'Sem especialidade'

    const status = emAtendimento ? 'Em atendimento' : 'Disponível'
    const statusClass = emAtendimento ? 'waiting' : 'confirmed'

    return `
        <div class="appointment-card">
            <div class="patient">
                <div class="avatar">${iniciaisMedico(nome)}</div>

                <div>
                    <strong>${escaparHtml(nome)}</strong>
                    <span>${escaparHtml(especialidade)}</span>
                </div>
            </div>

            <span class="status ${statusClass}">${status}</span>
        </div>`
}

/* ------------------------------------------------------------------ */
/* Atendimentos de hoje por médico                                     */
/* ------------------------------------------------------------------ */

function loadAtendimentosHoje(consultas, referencia) {
    const corpo = document.getElementById('atendimentos-hoje-corpo')
    const dataEl = document.getElementById('atendimentos-hoje-data')

    if (!corpo) return

    if (dataEl) dataEl.textContent = formatarData(referencia)

    const consultasDoDia = consultas
        .filter(c => c.dt_agendamento && date.compararData(c.dt_agendamento, referencia))
        .sort((a, b) => (a.dt_agendamento || '').localeCompare(b.dt_agendamento || ''))

    if (consultasDoDia.length === 0) {
        corpo.innerHTML = `
            <tr>
                <td colspan="4">Nenhum atendimento agendado para hoje.</td>
            </tr>`

        return
    }

    corpo.innerHTML = consultasDoDia.map(c => {
        const paciente = c.paciente?.nm_paciente || 'Paciente não identificado'
        const medico = c.medico?.nm_medico || 'Médico não identificado'
        const status = c.status?.nm_status || 'Sem status'

        return `
            <tr>
                <td>${escaparHtml(paciente)}</td>
                <td>${escaparHtml(medico)}</td>
                <td>${escaparHtml(horarioConsulta(c))}</td>
                <td>
                    <span class="status ${classeStatus(status)}">${escaparHtml(status)}</span>
                </td>
            </tr>`
    }).join('')
}

/* ------------------------------------------------------------------ */
/* Utilitários                                                         */
/* ------------------------------------------------------------------ */

function consultaAtiva(consulta) {
    return consulta.status?.nm_status !== 'Cancelada'
}

function dentroDoHorario(dtAgendamento, referencia) {
    const inicio = date.converterToNewDate(dtAgendamento)
    if (isNaN(inicio)) return false

    const fim = new Date(inicio.getTime() + DURACAO_CONSULTA_MINUTOS * 60 * 1000)

    return referencia >= inicio && referencia < fim
}

function menorHorario(consultas) {
    const horarios = consultas
        .map(c => date.converterToNewDate(c.dt_agendamento).getTime())
        .filter(t => !isNaN(t))

    return horarios.length ? Math.min(...horarios) : Infinity
}

function horarioConsulta(consulta) {
    return consulta.horario
        || consulta.dt_agendamento?.split(' ')[1]?.substring(0, 5)
        || '--:--'
}

function classeStatus(status) {
    return {
        'Aguardando': 'waiting',
        'Confirmada': 'confirmed',
        'Cancelada': 'cancelled'
    }[status] || 'waiting'
}

function formatarData(dataReferencia) {
    const dia = String(dataReferencia.getDate()).padStart(2, '0')
    const mes = String(dataReferencia.getMonth() + 1).padStart(2, '0')

    return `${dia}/${mes}/${dataReferencia.getFullYear()}`
}

function iniciaisMedico(nome) {
    const titulos = /^(dr|dra|drs|dras)\.?$/i
    const partes = String(nome)
        .trim()
        .split(/\s+/)
        .filter(palavra => palavra && !titulos.test(palavra))

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
