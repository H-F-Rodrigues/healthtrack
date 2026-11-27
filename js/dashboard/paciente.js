import * as data from '../dados.js'
import * as date from '../date.js'
import {
    escaparHtml, formatarData, classeStatus, statusConsulta, usuarioLogado, dataISO
} from '../util.js'

// Painel do paciente: só leitura. Agendamentos são feitos pela recepção.
export async function load() {
    const corpoConsultas = document.getElementById('paciente-consultas')
    if (!corpoConsultas) return false

    const { tipo, usuario: paciente } = usuarioLogado()
    if (tipo !== 'paciente' || !paciente) return false

    const dados = await data.carregarDados()
    const agora = new Date()

    const minhasConsultas = (dados.consultas || [])
        .filter(c => c.cd_paciente == paciente.cd_paciente)
        .map(c => ({ ...c, quando: date.converterToNewDate(c.dt_agendamento) }))

    const futuras = minhasConsultas
        .filter(c => c.quando >= agora)
        .sort((a, b) => a.quando - b.quando)

    const passadas = minhasConsultas
        .filter(c => c.quando < agora)
        .sort((a, b) => b.quando - a.quando)

    const primeiroNome = String(paciente.nm_paciente || '').split(' ')[0]
    document.getElementById('paciente-saudacao').textContent = `Olá, ${primeiroNome}`

    renderizarResumo(futuras, passadas)
    renderizarConsultas(futuras, corpoConsultas)
    renderizarLembretes(dados.alertas || [], paciente)
    renderizarHistorico(passadas)

    return true
}

function renderizarResumo(futuras, passadas) {
    const proxima = futuras.find(c => c.cd_status !== 3)
    const dataProxima = document.getElementById('paciente-proxima-data')
    const detalhe = document.getElementById('paciente-proxima-detalhe')

    if (proxima) {
        dataProxima.textContent = `${formatarData(proxima.dt_agendamento)} · ${proxima.horario}`
        detalhe.textContent = `Próxima consulta com ${proxima.medico?.nm_medico || 'médico'}`
    } else {
        dataProxima.textContent = 'Nenhuma'
        detalhe.textContent = 'Próxima consulta'
    }

    document.getElementById('paciente-total-realizadas').textContent =
        passadas.filter(c => statusConsulta(c) === 'Realizada').length
}

function renderizarConsultas(futuras, corpo) {
    const resumo = document.getElementById('paciente-consultas-resumo')
    const ativas = futuras.filter(c => c.cd_status !== 3)
    resumo.textContent = `${ativas.length} agendada(s)`

    if (futuras.length === 0) {
        corpo.innerHTML = `<tr><td colspan="5" class="celula-vazia">Você não tem consultas marcadas.</td></tr>`
        return
    }

    corpo.innerHTML = futuras.map(c => {
        const status = statusConsulta(c)
        return `
            <tr>
                <td>${formatarData(c.dt_agendamento)}</td>
                <td>${escaparHtml(c.horario || '--:--')}</td>
                <td>${escaparHtml(c.medico?.nm_medico || '-')}</td>
                <td>${escaparHtml(c.medico?.especialidade?.nm_especialidade || '-')}</td>
                <td><span class="status ${classeStatus(status)}">${escaparHtml(status)}</span></td>
            </tr>`
    }).join('')
}

function renderizarLembretes(alertas, paciente) {
    const corpo = document.getElementById('paciente-lembretes')
    const resumo = document.getElementById('paciente-lembretes-resumo')
    const hoje = dataISO()

    const meusLembretes = alertas
        .filter(a => a.cd_paciente == paciente.cd_paciente)
        .map(a => ({
            ...a,
            situacao: a.dt_fim && a.dt_fim < hoje ? 'Encerrado' : a.dt_inicio > hoje ? 'Vai começar' : 'Em uso'
        }))
        .sort((a, b) => ordemSituacao(a.situacao) - ordemSituacao(b.situacao) || b.dt_inicio.localeCompare(a.dt_inicio))

    const emUso = meusLembretes.filter(a => a.situacao === 'Em uso').length
    document.getElementById('paciente-total-lembretes').textContent = emUso
    resumo.textContent = `${emUso} em uso`

    if (meusLembretes.length === 0) {
        corpo.innerHTML = `<tr><td colspan="5" class="celula-vazia">Nenhum medicamento prescrito.</td></tr>`
        return
    }

    corpo.innerHTML = meusLembretes.map(a => {
        const classe = { 'Em uso': 'confirmed', 'Vai começar': 'waiting', 'Encerrado': 'blocked' }[a.situacao]
        return `
            <tr>
                <td><strong>${escaparHtml(a.medicamento?.nm_medicamento || '-')}</strong></td>
                <td>${escaparHtml(a.ds_dosagem || '-')}</td>
                <td>${escaparHtml(a.ds_horario || '-')}</td>
                <td>${formatarData(a.dt_inicio)} a ${a.dt_fim ? formatarData(a.dt_fim) : 'sem data de término'}</td>
                <td><span class="status ${classe}">${a.situacao}</span></td>
            </tr>`
    }).join('')
}

function ordemSituacao(situacao) {
    return { 'Em uso': 0, 'Vai começar': 1, 'Encerrado': 2 }[situacao]
}

function renderizarHistorico(passadas) {
    const corpo = document.getElementById('paciente-historico')
    document.getElementById('paciente-historico-resumo').textContent = `${passadas.length} consulta(s)`

    if (passadas.length === 0) {
        corpo.innerHTML = `<tr><td colspan="4" class="celula-vazia">Nenhuma consulta anterior.</td></tr>`
        return
    }

    corpo.innerHTML = passadas.map(c => {
        const status = statusConsulta(c)
        return `
            <tr>
                <td>${formatarData(c.dt_agendamento)} · ${escaparHtml(c.horario)}</td>
                <td>${escaparHtml(c.medico?.nm_medico || '-')}</td>
                <td>${escaparHtml(c.medico?.especialidade?.nm_especialidade || '-')}</td>
                <td><span class="status ${classeStatus(status)}">${escaparHtml(status)}</span></td>
            </tr>`
    }).join('')
}
