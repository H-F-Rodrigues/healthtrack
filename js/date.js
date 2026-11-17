import * as data from './dados.js'

export function converterToNewDate(valor) {
    if (valor instanceof Date) return valor
    if (typeof valor !== 'string' || !valor.trim()) return new Date(NaN)

    // "YYYY-MM-DD" puro: força horário LOCAL (evita o UTC da spec)
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return new Date(valor + 'T00:00:00')

    return new Date(valor.includes('T') ? valor : valor.replace(' ', 'T'))
}

export function compararData(data, referencia = new Date()) {
    const d = converterToNewDate(data)
    if (isNaN(d)) return false; // proteção contra datas inválidas
    return (
        d.getFullYear() === referencia.getFullYear() &&
        d.getMonth()    === referencia.getMonth() &&
        d.getDate()     === referencia.getDate()
    );
}

export function mesmaSemana(data, referencia = new Date()) {
    const d = converterToNewDate(data)
    const r = converterToNewDate(referencia)
    if (isNaN(d.getTime()) || isNaN(r.getTime())) return false

    const domingoD = new Date(d)
    domingoD.setHours(0, 0, 0, 0)
    domingoD.setDate(domingoD.getDate() - domingoD.getDay())

    const domingoR = new Date(r)
    domingoR.setHours(0, 0, 0, 0)
    domingoR.setDate(domingoR.getDate() - domingoR.getDay())

    return domingoD.getTime() === domingoR.getTime()
}

export function mesmoMes(data, referencia = new Date()) {
    const d = converterToNewDate(data)
    const r = converterToNewDate(referencia)
    if (isNaN(d.getTime()) || isNaN(r.getTime())) return false

    return (
        d.getFullYear() === r.getFullYear() &&
        d.getMonth()    === r.getMonth()
    )
}

export async function filtrarConsultas(referencia = new Date()) {
    const dados = await data.carregarDados()
    const consultas = dados.consultas || []

    // Normaliza para "início do dia" para comparar apenas a data (ignora a hora)
    const inicio = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate())

    return consultas.filter(c => {
        if (!c.dt_agendamento) return false

        const d = new Date(c.dt_agendamento.replace(' ', 'T'))
        if (isNaN(d)) return false

        // Ignora a hora da consulta na comparação
        const dia = new Date(d.getFullYear(), d.getMonth(), d.getDate())

        return dia >= inicio   // só o limite inferior agora
    })
}