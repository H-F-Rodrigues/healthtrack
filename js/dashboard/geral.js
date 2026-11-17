import * as data from '../dados.js'
import * as date from '../date.js'

export async function load() {
    await loadInfo()
}

async function loadInfo() {
    const dados = await data.carregarDados()
    const consultas = dados.consultas || []

    const htmlPacientesHoje = document.getElementById('pacientes-hoje')
    const htmlPacientesSemana = document.getElementById('pacientes-semana')
    const htmlPacientesMes = document.getElementById('pacientes-mes')

    const pacientesHoje = new Set()
    const pacientesSemana = new Set()
    const pacientesMes = new Set()

    consultas.forEach(c => {
        if (!c.dt_agendamento || !c.cd_paciente) return

        if (c.cd_status === 2) {
            if (date.compararData(c.dt_agendamento)) {
                pacientesHoje.add(c.cd_paciente)
            }
            if (date.mesmaSemana(c.dt_agendamento)) {
                pacientesSemana.add(c.cd_paciente)
            }
            if (date.mesmoMes(c.dt_agendamento)) {
                pacientesMes.add(c.cd_paciente)
            }
        }
    })

    if (htmlPacientesHoje) htmlPacientesHoje.innerHTML = pacientesHoje.size
    if (htmlPacientesSemana) htmlPacientesSemana.innerHTML = pacientesSemana.size
    if (htmlPacientesMes) htmlPacientesMes.innerHTML = pacientesMes.size

    return true
}