import * as data from '../dados.js'
import { escaparHtml, formatarDataHora, usuarioLogado } from '../util.js'

// Cada perfil vê só o que é dele: paciente (as próprias), médico (dos seus pacientes), recepção (todas)
function minhas(notificacoes) {
    const { tipo, usuario } = usuarioLogado()
    return (notificacoes || []).filter(n => {
        if (tipo === 'paciente') return n.cd_paciente === usuario?.cd_paciente
        if (tipo === 'medico') return n.cd_medico === usuario?.cd_medico
        return true
    })
}

export async function load() {
    const lista = document.getElementById('lista-notificacoes')
    if (!lista) return false

    try {
        const dados = await data.carregarDados()
        const notificacoes = minhas(dados.notificacoes)
            .sort((a, b) => new Date(b.data) - new Date(a.data))

        lista.innerHTML = notificacoes.length
            ? notificacoes.map(criarNotificacao).join('')
            : '<div class="empty-card">Nenhuma notificação.</div>'

        atualizarContador(notificacoes.filter(n => !n.lida).length)
        configurarBotao()
        return true
    } catch (erro) {
        console.error('Erro ao carregar notificações:', erro)
        lista.textContent = 'Não foi possível carregar as notificações.'
        return false
    }
}

function atualizarContador(naoLidas) {
    const badge = document.getElementById('menu-badge-notificacoes')
    const botao = document.getElementById('btn-marcar-notificacoes-lidas')
    if (badge) {
        badge.textContent = naoLidas
        badge.hidden = naoLidas === 0
    }
    if (botao) botao.disabled = naoLidas === 0
}

function configurarBotao() {
    const botao = document.getElementById('btn-marcar-notificacoes-lidas')
    if (!botao || botao.dataset.configurado) return

    botao.addEventListener('click', async () => {
        const dados = await data.carregarDados()
        const ids = new Set(minhas(dados.notificacoes).map(n => n.id))
        data.salvarDados('notificacoes', dados.notificacoes.map(n => ids.has(n.id) ? { ...n, lida: true } : n))
        await load()
    })
    botao.dataset.configurado = 'true'
}

function criarNotificacao(notificacao) {
    return `<div class="notification-card ${notificacao.lida ? '' : 'unread'}">
        <span class="notification-dot" aria-hidden="true"></span>
        <div class="notification-content">
            <strong>${escaparHtml(notificacao.titulo || 'Atualização')}</strong>
            <p>${escaparHtml(notificacao.mensagem || '')}</p>
            <small>${escaparHtml(formatarDataHora(notificacao.data))}</small>
        </div>
    </div>`
}
