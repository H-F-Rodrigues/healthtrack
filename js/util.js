// Funções pequenas usadas por várias telas do sistema
import * as date from './date.js'

export function escaparHtml(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere])
}

export function iniciais(nome) {
    const partes = String(nome || '')
        .replace(/^(Dra?\.)\s+/i, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)

    if (partes.length === 0) return '?'
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export function somenteDigitos(valor) {
    return String(valor || '').replace(/\D/g, '')
}

export function formatarCPF(valor) {
    const d = somenteDigitos(valor)
    if (d.length !== 11) return valor || '-'
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function formatarTelefone(valor) {
    const d = somenteDigitos(valor)
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return valor || '-'
}

export function formatarData(valor) {
    const d = date.converterToNewDate(valor)
    return isNaN(d) ? '-' : d.toLocaleDateString('pt-BR')
}

export function formatarDataHora(valor) {
    const d = date.converterToNewDate(valor)
    if (isNaN(d)) return '-'
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

// Data no formato AAAA-MM-DD (horário local)
export function dataISO(valor = new Date()) {
    const d = date.converterToNewDate(valor)
    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0')
    ].join('-')
}

// Data e hora no formato usado em dt_agendamento: AAAA-MM-DD HH:MM:00
export function dataHoraBanco(valor) {
    const d = date.converterToNewDate(valor)
    return `${dataISO(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`
}

export function calcularIdade(nascimento) {
    const d = date.converterToNewDate(nascimento)
    if (isNaN(d)) return null
    const hoje = new Date()
    let idade = hoje.getFullYear() - d.getFullYear()
    const aindaNaoFezAniversario = hoje.getMonth() < d.getMonth()
        || (hoje.getMonth() === d.getMonth() && hoje.getDate() < d.getDate())
    if (aindaNaoFezAniversario) idade--
    return idade
}

export function classeStatus(status) {
    return {
        'Aguardando': 'waiting',
        'Confirmada': 'confirmed',
        'Realizada': 'confirmed',
        'Cancelada': 'cancelled'
    }[status] || 'waiting'
}

// Status exibido: consultas confirmadas que já passaram aparecem como "Realizada"
export function statusConsulta(consulta) {
    const nome = consulta.status?.nm_status || 'Aguardando'
    const quando = date.converterToNewDate(consulta.dt_agendamento)
    if (nome === 'Confirmada' && !isNaN(quando) && quando < new Date()) return 'Realizada'
    return nome
}

export function proximoId(registros, campo) {
    return (registros || []).reduce((maior, registro) => Math.max(maior, Number(registro[campo]) || 0), 0) + 1
}

export function usuarioLogado() {
    const tipo = sessionStorage.getItem('tipoUsuario')
    let usuario = null
    try {
        usuario = tipo ? JSON.parse(sessionStorage.getItem(tipo) || 'null') : null
    } catch {
        usuario = null
    }
    return { tipo, usuario }
}

// Avisa todas as telas que os dados mudaram, para elas se atualizarem
export function avisarMudanca() {
    window.dispatchEvent(new Event('healthtrack:data-changed'))
}

// Troca a tela visível (as telas são controladas pelos radios do login.html)
export function abrirTela(nome) {
    const radio = document.getElementById(nome)
    if (radio) radio.checked = true
    document.querySelector('.main-content')?.scrollTo(0, 0)
}
