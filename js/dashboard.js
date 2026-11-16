import * as grafico from './grafico.js'
import * as data from './dados.js'
import * as date from './date.js'

const dashboardNames = [
    "recepcao",
    "agendamento",
    "historico",
    "prontuario",
    "notificacoes",
    "alertas",
    "acesso",
    "geral"
];

const dashboardContainer = document.querySelector("#dashboard-screens");

async function loadDashboards() {
    try {
        const dashboards = await Promise.all(
            dashboardNames.map(async (name) => {
                const response = await fetch(`dashboard/${name}.html`);

                if (!response.ok) {
                    throw new Error(`Não foi possível carregar ${name}.html`);
                }

                return response.text();
            })
        );

        dashboardContainer.innerHTML = dashboards.join("\n");

        await loadSidebar();
        await loadData();
        await loadTable();

        await grafico.gerar();
    } catch (error) {
        dashboardContainer.innerHTML = "<p>Não foi possível carregar os dashboards.</p>";
        console.error(error);
    }
}

async function loadSidebar() {
    const sidebarUser = document.getElementById('sidebar-user')

    const tipoUsuario = sessionStorage.getItem('tipoUsuario')
    const usuario = tipoUsuario
        ? JSON.parse(sessionStorage.getItem(tipoUsuario))
        : null

    let userPhoto;
    let nome;

    switch (tipoUsuario) {
        case 'paciente':
            userPhoto = usuario.nm_paciente
                .split(" ")
                .map(palavra => palavra[0])
                .join('')
            nome = usuario.nm_paciente
            break;

        case 'medico': 
            userPhoto = 'DR'
            nome = usuario.nm_medico
            break;

        case 'recepcionista':
            userPhoto = usuario.nm_recepcionista
                .split(" ")
                .map(palavra => palavra[0])
                .join('')
            nome = usuario.nm_recepcionista
            break;
    }

    const funcao = tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1)

    sidebarUser.innerHTML = `
        <div class="user-photo">${userPhoto}</div>
        <div class="user-info">
            <strong>${nome}</strong>
            <span>${funcao}</span>
        </div>`;
}

async function loadData() {
    const htmlConsultasHoje = document.getElementById('consultas-hoje')
    const htmlConsultasAguardando = document.getElementById('consultas-aguardando')
    const htmlConsultasCanceladas = document.getElementById('consultas-canceladas')

    const dados = await data.carregarDados()
    const consultas = dados['consultas']

    const consultasHoje = consultas.filter(c => (date.compararData(c.dt_agendamento)))

    const consultasAguardando = consultasHoje.filter(c => c.status.nm_status == 'Aguardando')
    const consultasCanceladas = consultasHoje.filter(c => c.status.nm_status == 'Cancelada')

    htmlConsultasHoje.innerHTML = consultasHoje.length
    htmlConsultasAguardando.innerHTML = consultasAguardando.length
    htmlConsultasCanceladas.innerHTML = consultasCanceladas.length

    return true
}

async function loadTable() {
    const consultasTable = document.getElementById('consultas-table')

    const dados = await data.carregarDados()
    const consultas = dados['consultas']

    const consultasHoje = consultas.filter(c => (date.compararData(c.dt_agendamento)))

    let statusClass
    consultasHoje.forEach(c => {
        switch (c.status.nm_status) {
            case 'Aguardando':
                statusClass = 'waiting'
                break

            case 'Confirmada':
                statusClass = 'confirmed'
                break

            case 'Cancelada':
                statusClass = 'cancelled'
                break
        }
        consultasTable.innerHTML += `
            <tr>
                <td>${c.paciente.nm_paciente}</td>
                <td>${c.horario}</td>
                <td>${c.medico.nm_medico}</td>
                <td>
                    <span class="status ${statusClass}">${c.status.nm_status}</span>
                </td>
            </tr>  
        `
    })

    return true
}

const tipoUsuario = sessionStorage.getItem('tipoUsuario')

if (tipoUsuario) {
    loadDashboards()
}