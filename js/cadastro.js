import * as data from './dados.js'
import { somenteDigitos, formatarCPF, formatarTelefone, proximoId, dataISO } from './util.js'

const form = document.getElementById('form-cadastro')
const nomeInput = document.getElementById('nome')
const cpfInput = document.getElementById('cpf')
const nascimentoInput = document.getElementById('nascimento')
const telefoneInput = document.getElementById('telefone')
const emailInput = document.getElementById('email')
const senhaInput = document.getElementById('senha')
const confirmacaoInput = document.getElementById('senha-confirmacao')
const erroCadastro = document.getElementById('erro-cadastro')

nascimentoInput.max = dataISO()

function mostrarErro(mensagem, campo) {
    erroCadastro.textContent = mensagem
    erroCadastro.hidden = false
    campo?.focus()
}

// Confere os dígitos verificadores do CPF
function cpfValido(cpf) {
    const d = somenteDigitos(cpf)
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false

    const digito = tamanho => {
        let soma = 0
        for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i)
        const resto = (soma * 10) % 11
        return resto === 10 ? 0 : resto
    }
    return digito(9) === Number(d[9]) && digito(10) === Number(d[10])
}

// Máscaras enquanto digita
cpfInput.addEventListener('input', () => {
    const d = somenteDigitos(cpfInput.value).slice(0, 11)
    cpfInput.value = d.length === 11 ? formatarCPF(d) : d
})
telefoneInput.addEventListener('input', () => {
    const d = somenteDigitos(telefoneInput.value).slice(0, 11)
    telefoneInput.value = d.length >= 10 ? formatarTelefone(d) : d
})

async function cadastrar(evento) {
    evento.preventDefault()
    erroCadastro.hidden = true

    const nome = nomeInput.value.trim().replace(/\s+/g, ' ')
    const cpf = somenteDigitos(cpfInput.value)
    const telefone = somenteDigitos(telefoneInput.value)
    const email = emailInput.value.trim().toLowerCase()
    const senha = senhaInput.value

    if (nome.split(' ').length < 2) return mostrarErro('Informe o nome completo.', nomeInput)
    if (!cpfValido(cpf)) return mostrarErro('CPF inválido. Confira os números digitados.', cpfInput)
    if (!nascimentoInput.value || nascimentoInput.value > dataISO()) return mostrarErro('Informe uma data de nascimento válida.', nascimentoInput)
    if (telefone.length < 10) return mostrarErro('Informe o celular com DDD.', telefoneInput)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return mostrarErro('Digite um e-mail válido.', emailInput)
    if (senha.length < 6) return mostrarErro('A senha deve ter pelo menos 6 caracteres.', senhaInput)
    if (senha !== confirmacaoInput.value) return mostrarErro('As senhas não conferem.', confirmacaoInput)

    try {
        const dados = await data.carregarDados()
        const usuarios = [...dados.pacientes, ...dados.medicos, ...dados.recepcionistas]

        if (usuarios.some(usuario => String(usuario.ds_email).toLowerCase() === email)) {
            return mostrarErro('Já existe uma conta com esse e-mail.', emailInput)
        }
        if (dados.pacientes.some(paciente => somenteDigitos(paciente.cd_cpf) === cpf)) {
            return mostrarErro('Já existe um paciente com esse CPF. Procure a recepção se não lembra do acesso.', cpfInput)
        }

        const conta = {
            cd_paciente: proximoId(dados.pacientes, 'cd_paciente'),
            nm_paciente: nome,
            ds_email: email,
            ds_senha: senha,
            cd_cpf: cpf,
            cd_telefone: telefone,
            sg_genero: '',
            sg_tipo_sanguineo: '',
            dt_nascimento: nascimentoInput.value
        }

        // Salva sem o campo "idade", que é calculado na leitura
        const pacientes = dados.pacientes.map(({ idade, endereco, ...paciente }) => paciente)
        data.salvarDados('pacientes', [...pacientes, conta])

        window.alert('Conta criada! Entre com seu e-mail e senha.')
        window.location.href = 'login.html'
    } catch (erro) {
        mostrarErro(erro.message || 'Não foi possível criar a conta.')
    }
}

form.addEventListener('submit', cadastrar)
