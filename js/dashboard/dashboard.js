import * as grafico from './grafico.js'
import * as data from '../dados.js'
import * as date from '../date.js'
import * as agendamento from './agendamento.js'
import * as geral from './geral.js'
import * as paciente from './paciente.js'
import * as historico from './historico.js'
import * as notificacoes from './notificacoes.js'
import * as alertas from './alertas.js'
import * as prontuario from './prontuario.js'
import * as acesso from './acesso.js'
import { perfil, podeVer } from '../permissoes.js'
import { escaparHtml, iniciais, classeStatus, statusConsulta, usuarioLogado, abrirTela } from '../util.js'

const dashboardContainer = document.querySelector("#dashboard-screens");

// Abre o sistema para o usuário que está na sessão.
// Só as telas que o perfil pode ver são carregadas na página.
export async function iniciarSistema() {
    const { tipo, usuario } = usuarioLogado()
    const configuracao = perfil(tipo)

    if (!configuracao || !usuario) {
        sessionStorage.clear()
        window.location.reload()
        return
    }

    document.body.dataset.perfil = tipo
    configurarMenu(tipo)
    abrirTela(configuracao.telaInicial)

    try {
        const telas = await Promise.all(
            configuracao.telas.map(async (nome) => {
                const response = await fetch(`dashboard/${nome}.html`);

                if (!response.ok) {
                    throw new Error(`Não foi possível carregar ${nome}.html`);
                }

                return response.text();
            })
        );

        dashboardContainer.innerHTML = telas.join("\n");
        esconderElementosDeOutrosPerfis(tipo)

        loadSidebar(tipo, usuario);
        await carregarTelas();
    } catch (error) {
        dashboardContainer.innerHTML = "<p>Não foi possível carregar o sistema. Abra o site por um servidor local (ex.: Live Server).</p>";
        console.error(error);
    }
}

// Preenche (ou atualiza) os dados de todas as telas carregadas
async function carregarTelas() {
    await loadData();
    await loadTable();
    await agendamento.load();
    await geral.load();
    await paciente.load();
    await historico.load();
    await notificacoes.load();
    await alertas.load();
    await prontuario.load();
    acesso.load();

    await grafico.gerar();
}

function configurarMenu(tipo) {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.hidden = !podeVer(tipo, item.htmlFor)
    })

    // Para o médico, a tela de agendamento é a agenda dele (só leitura)
    const itemAgenda = document.querySelector('.menu-item[for="agendamento"] .menu-texto')
    if (itemAgenda) itemAgenda.textContent = tipo === 'medico' ? 'Minha agenda' : 'Agendamento'

    // Bloqueia qualquer tentativa de abrir uma tela que o perfil não pode ver
    document.querySelectorAll('input[name="dashboard"]').forEach(radio => {
        if (radio.dataset.protegido) return
        radio.addEventListener('change', () => {
            const atual = usuarioLogado().tipo
            if (radio.checked && !podeVer(atual, radio.id)) {
                abrirTela(perfil(atual)?.telaInicial)
            }
        })
        radio.dataset.protegido = 'true'
    })
}

// Elementos marcados com data-perfis="medico recepcionista" só aparecem para esses perfis
function esconderElementosDeOutrosPerfis(tipo) {
    document.querySelectorAll('[data-perfis]').forEach(elemento => {
        const permitidos = elemento.dataset.perfis.split(/\s+/)
        if (!permitidos.includes(tipo)) elemento.remove()
    })
}

function loadSidebar(tipo, usuario) {
    const sidebarUser = document.getElementById('sidebar-user')
    if (!sidebarUser) return

    const nome = usuario.nm_paciente || usuario.nm_medico || usuario.nm_recepcionista || 'Usuário'
    const detalhe = tipo === 'medico'
        ? `CRM ${usuario.cd_crm || '-'}`
        : perfil(tipo).nome

    sidebarUser.innerHTML = `
        <div class="user-photo">${escaparHtml(iniciais(nome))}</div>
        <div class="user-info">
            <strong>${escaparHtml(nome)}</strong>
            <span>${escaparHtml(detalhe)}</span>
        </div>`;
}

async function loadData() {
    const htmlConsultasHoje = document.getElementById('consultas-hoje')
    if (!htmlConsultasHoje) return false

    const htmlConsultasAguardando = document.getElementById('consultas-aguardando')
    const htmlConsultasCanceladas = document.getElementById('consultas-canceladas')

    const dados = await data.carregarDados()
    const consultasHoje = (dados.consultas || []).filter(c => date.compararData(c.dt_agendamento))

    const consultasAguardando = consultasHoje.filter(c => c.status?.nm_status === 'Aguardando')
    const consultasCanceladas = consultasHoje.filter(c => c.status?.nm_status === 'Cancelada')

    htmlConsultasHoje.textContent = consultasHoje.length
    if (htmlConsultasAguardando) htmlConsultasAguardando.textContent = consultasAguardando.length
    if (htmlConsultasCanceladas) htmlConsultasCanceladas.textContent = consultasCanceladas.length

    return true
}

async function loadTable() {
    const consultasTable = document.getElementById('consultas-table')
    if (!consultasTable) return false

    const dataAtual = document.getElementById('data-atual')
    if (dataAtual) dataAtual.textContent = new Date().toLocaleDateString('pt-BR')

    const dados = await data.carregarDados()
    const consultasHoje = (dados.consultas || [])
        .filter(c => date.compararData(c.dt_agendamento))
        .sort((a, b) => (a.horario || '').localeCompare(b.horario || ''))

    if (!consultasHoje.length) {
        consultasTable.innerHTML = '<tr><td colspan="4">Nenhuma consulta agendada para hoje.</td></tr>'
        return true
    }

    consultasTable.innerHTML = consultasHoje.map(c => {
        const status = statusConsulta(c)
        return `
            <tr>
                <td>${escaparHtml(c.paciente?.nm_paciente || 'Paciente')}</td>
                <td>${escaparHtml(c.horario || '--:--')}</td>
                <td>${escaparHtml(c.medico?.nm_medico || 'Médico')}</td>
                <td><span class="status ${classeStatus(status)}">${escaparHtml(status)}</span></td>
            </tr>`
    }).join('')

    return true
}

// Quando alguma tela salva dados, todas as outras se atualizam sem recarregar o HTML
window.addEventListener('healthtrack:data-changed', () => {
    if (usuarioLogado().tipo) carregarTelas()
})
