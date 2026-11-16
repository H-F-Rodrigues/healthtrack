import * as mock from './mock.js'
import * as date from './date.js'

export async function carregarDados() {
    const consultas = await carregarConsultas()
    const recepcionistas = await carregarRecepcionistas()
    const medicos = await carregarMedicos()
    const pacientes = await carregarPacientes()
    const status = await carregarStatus()
    const especialidades = await carregarEspecialidades()
    const diagnosticos = await carregarDiagnosticos()
    const enderecos = await carregarEnderecos()
    const cidades = await carregarCidades()
    const uf = await carregarUf()
    const alertas = await carregarAlertas()
    const medicamentos = await carregarMedicamentos()

    return {
       'consultas': consultas,
       'pacientes': pacientes,
       'medicos': medicos,
       'recepcionistas': recepcionistas,
       'status': status,
       'especialidades': especialidades,
       'diagnosticos': diagnosticos,
       'enderecos': enderecos,
       'cidades': cidades,
       'uf': uf,
       'alertas': alertas,
       'medicamentos': medicamentos,
    }
}

async function carregarConsultas() {
    const dadosMockados = mock.consultas

    const recepcionistas = await carregarRecepcionistas()
    const medicos = await carregarMedicos()
    const pacientes = await carregarPacientes()
    const status = await carregarStatus()
    const diagnosticos = await carregarDiagnosticos()

    const raw = localStorage.getItem("consultas")

    let dados
    if (!raw) {
        dados = dadosMockados
    } else {
        try {
            let parsed = JSON.parse(dados)
            dados = Array.isArray(parsed) ? parsed : dadosMockados
        } catch (erro) {
            console.log('Erro ao ler do localStorage: ', erro)
            dados = dadosMockados
        }
    }

    dados.forEach(d => {
        d.paciente = pacientes.find(p => p.cd_paciente == d.cd_paciente)
        d.medico = medicos.find(m => m.cd_medico == d.cd_medico)
        d.recepcionista = recepcionistas.find(r => r.cd_recepcionista == d.cd_recepcionista)
        d.status = status.find(s => s.cd_status == d.cd_status)
        d.diagnostico = diagnosticos.find(di => di.cd_diagnostico == d.cd_diagnostico)
        d.horario = d.dt_agendamento.split(' ')[1].substring(0, 5);
    })

    return dados
}

async function carregarStatus() {
    const dadosMockados = mock.status
    const raw = localStorage.getItem("status")   

    let dados
    if (!raw) {
        dados = dadosMockados
    } else {
        try {
            const parsed = JSON.parse(raw)
            dados = Array.isArray(parsed) ? parsed : dadosMockados
        } catch (erro) {
            console.log('Erro ao ler do localStorage: ', erro)
            dados = dadosMockados
        }
    }

    return dados
}

async function carregarDiagnosticos() {
    const dadosMockados = mock.diagnosticos
    const raw = localStorage.getItem("diagnosticos")   

    let dados
    if (!raw) {
        dados = dadosMockados
    } else {
        try {
            const parsed = JSON.parse(raw)
            dados = Array.isArray(parsed) ? parsed : dadosMockados
        } catch (erro) {
            console.log('Erro ao ler do localStorage: ', erro)
            dados = dadosMockados
        }
    }

    return dados
}

async function carregarRecepcionistas() {
    const dadosMockados = mock.recepcionistas
    const raw = localStorage.getItem("recepcionistas")   

    let dados
    if (!raw) {
        dados = dadosMockados
    } else {
        try {
            const parsed = JSON.parse(raw)
            dados = Array.isArray(parsed) ? parsed : dadosMockados
        } catch (erro) {
            console.log('Erro ao ler do localStorage: ', erro)
            dados = dadosMockados
        }
    }

    return dados
}

async function carregarMedicos() {
    const dadosMockados = mock.medicos

    const especialidades = await carregarEspecialidades()

    const raw = localStorage.getItem("medicos")   

    let dados
    if (!raw) {
        dados = dadosMockados
    } else {
        try {
            const parsed = JSON.parse(raw)
            dados = Array.isArray(parsed) ? parsed : dadosMockados
        } catch (erro) {
            console.log('Erro ao ler do localStorage: ', erro)
            dados = dadosMockados
        }
    }

    dados.forEach(d => {
        d.especialidade = especialidades.find(e => e.cd_especialidade == d.cd_especialidade) || null
    })

    return dados
}

async function carregarEspecialidades() {
    const dadosMockados = mock.especialidades
    const raw = localStorage.getItem("especialidades")   

    let dados
    if (!raw) {
        dados = dadosMockados
    } else {
        try {
            const parsed = JSON.parse(raw)
            dados = Array.isArray(parsed) ? parsed : dadosMockados
        } catch (erro) {
            console.log('Erro ao ler do localStorage: ', erro)
            dados = dadosMockados
        }
    }

    return dados
}

async function carregarPacientes() {
    const dadosMockados = mock.pacientes
    const raw = localStorage.getItem("pacientes")

    let dados
    if (!raw) {
        dados = dadosMockados
    } else {
        try {
            const parsed = JSON.parse(raw)
            dados = Array.isArray(parsed) ? parsed : dadosMockados
        } catch (erro) {
            console.log('Erro ao ler do localStorage: ', erro)
            dados = dadosMockados
        }
    }

    const dataAtual = new Date()
    const MS_POR_ANO = 1000 * 60 * 60 * 24 * 365.25

    return dados.map(d => {
        const dataNascimento = date.converterToNewDate(d.dt_nascimento)
        return {
            ...d,
            idade: isNaN(dataNascimento)
                ? null
                : Math.floor((dataAtual - dataNascimento) / MS_POR_ANO)
        }
    })
}

async function carregarEnderecos() {
    const dadosMockados = mock.enderecos

    const pacientes = await carregarPacientes()
    const cidades = await carregarCidades()
    
    const raw = localStorage.getItem("enderecos")   

    let dados
    if (!raw) {
        dados = dadosMockados
    } else {
        try {
            const parsed = JSON.parse(raw)
            dados = Array.isArray(parsed) ? parsed : dadosMockados
        } catch (erro) {
            console.log('Erro ao ler do localStorage: ', erro)
            dados = dadosMockados
        }
    }

    dados.forEach(d => {
        d.paciente = pacientes.find(e => e.cd_paciente == d.cd_paciente) || null
        d.cidade = cidades.find(c => c.cd_cidade == d.cd_cidade) || null
    })

    return dados
}

async function carregarCidades() {
    const dadosMockados = mock.cidades

    const uf = await carregarUf()
    
    const raw = localStorage.getItem("cidades")   

    let dados
    if (!raw) {
        dados = dadosMockados
    } else {
        try {
            const parsed = JSON.parse(raw)
            dados = Array.isArray(parsed) ? parsed : dadosMockados
        } catch (erro) {
            console.log('Erro ao ler do localStorage: ', erro)
            dados = dadosMockados
        }
    }

    dados.forEach(d => {
        d.uf = uf.find(e => e.cd_uf == d.cd_uf) || null
    })

    return dados
}

async function carregarUf() {
    const dadosMockados = mock.uf
    const raw = localStorage.getItem("medicos")   

    let dados
    if (!raw) {
        dados = dadosMockados
    } else {
        try {
            const parsed = JSON.parse(raw)
            dados = Array.isArray(parsed) ? parsed : dadosMockados
        } catch (erro) {
            console.log('Erro ao ler do localStorage: ', erro)
            dados = dadosMockados
        }
    }

    return dados
}

async function carregarAlertas() {
    const dadosMockados = mock.alertas

    const medicamentos = await carregarMedicamentos()
    
    const raw = localStorage.getItem("alertas")   

    let dados
    if (!raw) {
        dados = dadosMockados
    } else {
        try {
            const parsed = JSON.parse(raw)
            dados = Array.isArray(parsed) ? parsed : dadosMockados
        } catch (erro) {
            console.log('Erro ao ler do localStorage: ', erro)
            dados = dadosMockados
        }
    }

    dados.forEach(d => {
        d.medicamento = medicamentos.find(e => e.cd_medicamento == d.cd_medicamento) || null
    })

    return dados
}

async function carregarMedicamentos() {
    const dadosMockados = mock.medicamentos
    const raw = localStorage.getItem("medicos")   

    let dados
    if (!raw) {
        dados = dadosMockados
    } else {
        try {
            const parsed = JSON.parse(raw)
            dados = Array.isArray(parsed) ? parsed : dadosMockados
        } catch (erro) {
            console.log('Erro ao ler do localStorage: ', erro)
            dados = dadosMockados
        }
    }

    return dados
}

// Usar como criarDados(paciente, 'pacientes') ou criarDados(consulta, 'consultas')
export async function criarDados(dado, tipoDado) {
    const dados = JSON.parse(localStorage.getItem(tipoDado) || '[]') // tipoDado deve ser algo como 'pacientes'
    dados.push(dado)    
    try {
        localStorage.setItem(tipoDado, JSON.stringify(dado))
        return true
    } catch (error) {
        console.error(error);
        return false
    }
}
