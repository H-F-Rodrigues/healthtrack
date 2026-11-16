import * as data from './dados.js'

const loginInput = document.getElementById("tipo-login");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("btn-login");
const loginError = document.getElementById("login-error");

const tipoUsuario = sessionStorage.getItem('tipoUsuario')

if (tipoUsuario) {
    redirecionar(tipoUsuario)
}

function showError(message) {
    loginError.textContent = message;
    loginError.hidden = false;
}

async function validateLogin() {
    const tipoLogin = loginInput.value;
    const email = emailInput.value.trim();
    const senha = passwordInput.value;
    let usuario = false;

    const dados = await data.carregarDados();
    const pacientes = dados['pacientes'];
    const medicos = dados['medicos'];
    const recepcionistas = dados['recepcionistas'];

    if (!email || !senha) {
        return showError("Preencha e-mail e senha.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showError("Digite um e-mail válido.");
    }
    if (senha.length < 6) {
        return showError("A senha deve ter pelo menos 6 caracteres.");
    }

    switch (tipoLogin) {
        case 'paciente':
            usuario = pacientes.find(p => p.ds_email === email)
            break;

        case 'medico': 
            usuario = medicos.find(m => m.ds_email === email)
            break;

        case 'recepcionista':
            usuario = recepcionistas.find(r => r.ds_email === email)
            break;

        default:
            throw new Error('Tipo de login inválido: ' + 403);
    }

    if (!usuario) {
        return showError("Email inválido");
    }

    loginError.hidden = true;

    if (usuario.ds_senha !== senha) {
        return showError("Senha inválida");
    }

    sessionStorage.setItem(tipoLogin, JSON.stringify(usuario));
    sessionStorage.setItem("tipoUsuario", tipoLogin);

    redirecionar(tipoLogin)
}

function redirecionar(tipoLogin) {
    switch (tipoLogin) {
        case 'paciente':
            document.getElementById("paciente").checked = true;
            break;

        case 'medico': 
            document.getElementById("medico").checked = true;
            break;

        case 'recepcionista':
            document.getElementById("recepcao").checked = true;
            break;
    }
}

loginButton.addEventListener("click", validateLogin);
[emailInput, passwordInput].forEach((input) =>
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") validateLogin();
    })
);
