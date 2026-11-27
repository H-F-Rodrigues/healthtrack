// Quem pode ver o quê no sistema.
// É a única fonte dessas regras: o menu, as telas carregadas e a
// tabela de "Controle de acesso" são montados a partir daqui.

export const PERFIS = {
    paciente: {
        nome: 'Paciente',
        telaInicial: 'paciente',
        telas: ['paciente', 'notificacoes']
    },
    recepcionista: {
        nome: 'Recepcionista',
        telaInicial: 'recepcao',
        telas: ['recepcao', 'agendamento', 'historico', 'notificacoes', 'geral', 'acesso']
    },
    medico: {
        nome: 'Médico',
        telaInicial: 'recepcao',
        telas: ['recepcao', 'agendamento', 'prontuario', 'historico', 'alertas', 'notificacoes', 'geral']
    }
}

// Linhas da tabela de Controle de acesso: [funcionalidade, médico, paciente, recepção]
export const FUNCIONALIDADES = [
    ['Painel da clínica (consultas do dia e gráficos)', true, false, true],
    ['Agendar, remarcar, confirmar e cancelar consultas', false, false, true],
    ['Ver a própria agenda de consultas', true, true, true],
    ['Prontuário eletrônico (buscar paciente e registrar atendimento)', true, false, false],
    ['Histórico de consultas da clínica', true, false, true],
    ['Prescrever lembretes de medicação', true, false, false],
    ['Ver lembretes de medicação próprios', false, true, false],
    ['Notificações', true, true, true],
    ['Informações gerais da clínica', true, false, true],
    ['Controle de acesso', false, false, true]
]

export function perfil(tipo) {
    return PERFIS[tipo] || null
}

export function podeVer(tipo, tela) {
    return Boolean(PERFIS[tipo]?.telas.includes(tela))
}
