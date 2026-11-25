import * as mock from './mock.js'
import * as date from './date.js'

export const CHAVES = [
  'consultas', 'pacientes', 'medicos', 'recepcionistas',
  'status', 'especialidades', 'diagnosticos', 'enderecos',
  'cidades', 'uf', 'alertas', 'medicamentos',
]

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

    const enderecos = await carregarEnderecos()

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

    dados.forEach(d => {
        d.endereco = enderecos.find(en => en.cd_endereco == d.cd_endereco) || null
    })

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
  try {
    if (!CHAVES.includes(tipoDado)) {
      throw new Error(`Tipo de dado desconhecido: "${tipoDado}"`)
    }

    const raw = localStorage.getItem(tipoDado)

    let dados
    if (!raw) {
      // Primeira gravação: começa com os mocks para não "sumir" com o resto
      dados = structuredClone(mock[tipoDado] ?? [])
    } else {
      dados = JSON.parse(raw)
      if (!Array.isArray(dados)) {
        throw new Error(`Conteúdo de "${tipoDado}" no localStorage não é um array.`)
      }
    }

    dados.push(dado)
    localStorage.setItem(tipoDado, JSON.stringify(dados))  // ← salva o ARRAY
    return true
  } catch (error) {
    console.error('Erro em criarDados:', error)
    return false
  }
}

/**
 * Exporta TODAS as chaves conhecidas do localStorage em um único arquivo JSON.
 * Formato: { "pacientes": [...], "medicos": [...], ... }
 */
export function exportarDadosJSON() {
  const backup = {}

  for (const chave of CHAVES) {
    const raw = localStorage.getItem(chave)
    if (!raw) continue
    try {
      backup[chave] = JSON.parse(raw)
    } catch {
      backup[chave] = raw   // se não for JSON, mantém como string
    }
  }

  if (Object.keys(backup).length === 0) {
    alert('Não há dados para exportar.')
    return
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)

  const linkTemp = document.createElement('a')
  linkTemp.href = url
  linkTemp.download = `healthtrack_backup_${new Date().toISOString().split('T')[0]}.json`

  document.body.appendChild(linkTemp)
  linkTemp.click()
  document.body.removeChild(linkTemp)
  URL.revokeObjectURL(url)
}

/**
 * Importa um arquivo JSON no formato { "pacientes": [...], "medicos": [...], ... }
 * e grava cada chave no localStorage. Funciona em conjunto com criarDados().
 * @param {Event} evento
 */
export function importarDadosJSON(evento) {
  const arquivo = evento.target.files[0]
  if (!arquivo) return

  const leitor = new FileReader()

  leitor.onload = (e) => {
    try {
      const conteudo = JSON.parse(e.target.result)

      // Precisa ser um objeto { chave: array }
      if (
        typeof conteudo !== 'object' ||
        conteudo === null ||
        Array.isArray(conteudo)
      ) {
        throw new Error('O arquivo deve conter um objeto no formato { "tabela": [...] }.')
      }

      // Filtra apenas chaves válidas do app
      const chavesValidas = Object.keys(conteudo).filter(k => CHAVES.includes(k))

      if (chavesValidas.length === 0) {
        throw new Error(
          `Nenhuma chave reconhecida. Chaves esperadas: ${CHAVES.join(', ')}.`
        )
      }

      // Valida que cada valor é um array
      for (const k of chavesValidas) {
        if (!Array.isArray(conteudo[k])) {
          throw new Error(`A chave "${k}" não contém um array.`)
        }
      }

      if (!confirm(
        `Isso substituirá os dados de: ${chavesValidas.join(', ')}.\nContinuar?`
      )) return

      // Grava cada chave — mesma estrutura que criarDados usa
      for (const k of chavesValidas) {
        localStorage.setItem(k, JSON.stringify(conteudo[k]))
      }

      alert('Dados importados com sucesso! Recarregando…')
      location.reload()
    } catch (erro) {
      alert(`Erro ao importar o arquivo JSON: ${erro.message}`)
      console.error(erro)
    } finally {
      evento.target.value = ''   // permite reimportar o mesmo arquivo
    }
  }

  leitor.onerror = () => {
    alert('Falha ao ler o arquivo.')
    evento.target.value = ''
  }

  leitor.readAsText(arquivo)
}
