import * as data from '../dados.js'
import * as date from '../date.js'
import { escaparHtml, formatarData, classeStatus, statusConsulta, usuarioLogado } from '../util.js'

let consultasHistorico = []

// Histórico da clínica (recepção) ou do próprio médico
export async function load() {
    const corpo = document.getElementById('historico-consultas')
    if (!corpo) return false

    try {
        const dados = await data.carregarDados()
        const { tipo, usuario } = usuarioLogado()
        const agora = new Date()

        if (tipo === 'medico') {
            document.getElementById('historico-subtitulo').textContent = 'Seus atendimentos anteriores'
        }

        consultasHistorico = (dados.consultas || [])
            .filter(consulta => date.converterToNewDate(consulta.dt_agendamento) < agora)
            .filter(consulta => tipo !== 'medico' || consulta.cd_medico === usuario?.cd_medico)
            .sort((a, b) => b.dt_agendamento.localeCompare(a.dt_agendamento))

        configurarBusca()
        renderizar()
        return true
    } catch (erro) {
        console.error('Erro ao carregar histórico:', erro)
        corpo.innerHTML = '<tr><td colspan="6">Não foi possível carregar o histórico.</td></tr>'
        return false
    }
}

function configurarBusca() {
    const busca = document.getElementById('busca-historico')
    if (!busca || busca.dataset.configurado) return
    busca.addEventListener('input', renderizar)
    busca.dataset.configurado = 'true'
}

function renderizar() {
    const corpo = document.getElementById('historico-consultas')
    const termo = (document.getElementById('busca-historico')?.value || '').trim().toLocaleLowerCase('pt-BR')

    const resultados = consultasHistorico.filter(consulta => [
        consulta.paciente?.nm_paciente,
        consulta.medico?.nm_medico,
        consulta.medico?.especialidade?.nm_especialidade,
        consulta.diagnostico?.nm_diagnostico,
        statusConsulta(consulta),
        formatarData(consulta.dt_agendamento)
    ].join(' ').toLocaleLowerCase('pt-BR').includes(termo))

    document.getElementById('historico-resumo').textContent = `${resultados.length} consulta(s)`

    if (!resultados.length) {
        corpo.innerHTML = '<tr><td colspan="6" class="celula-vazia">Nenhuma consulta encontrada.</td></tr>'
        return
    }

    corpo.innerHTML = resultados.map(consulta => {
        const status = statusConsulta(consulta)
        return `<tr>
            <td>${formatarData(consulta.dt_agendamento)} · ${escaparHtml(consulta.horario)}</td>
            <td>${escaparHtml(consulta.paciente?.nm_paciente || '-')}</td>
            <td>${escaparHtml(consulta.medico?.nm_medico || '-')}</td>
            <td>${escaparHtml(consulta.medico?.especialidade?.nm_especialidade || '-')}</td>
            <td>${escaparHtml(consulta.diagnostico?.nm_diagnostico || '-')}</td>
            <td><span class="status ${classeStatus(status)}">${escaparHtml(status)}</span></td>
        </tr>`
    }).join('')
}
