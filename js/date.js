import * as data from './dados.js'

export function converterToNewDate(data) {
    return new Date(data.replace(' ', 'T'));
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