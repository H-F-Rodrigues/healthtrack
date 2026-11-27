import * as data from './dados.js'
import { iniciarSistema } from './dashboard/dashboard.js'

const loginInput = document.getElementById("tipo-login");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("btn-login");
const logoutButton = document.getElementById("btn-logout");
const esqueciSenha = document.getElementById("esqueci-senha");
const loginError = document.getElementById("login-error");

const TABELAS = {
    paciente: 'pacientes',
    medico: 'medicos',
    recepcionista: 'recepcionistas'
};

function showError(message) {
    loginError.textContent = message;
    loginError.hidden = false;
}

async function validateLogin() {
    const tipoLogin = loginInput.value;
    const email = emailInput.value.trim().toLowerCase();
    const senha = passwordInput.value;

    if (!email || !senha) {
        return showError("Preencha e-mail e senha.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showError("Digite um e-mail válido.");
    }

    const tabela = TABELAS[tipoLogin];
    if (!tabela) {
        return showError("Selecione como deseja entrar.");
    }

    const dados = await data.carregarDados();
    const usuario = (dados[tabela] || []).find(u => String(u.ds_email).toLowerCase() === email);

    // Mesma mensagem para e-mail ou senha errados: não revela quais e-mails existem
    if (!usuario || usuario.ds_senha !== senha) {
        return showError("E-mail ou senha incorretos.");
    }

    loginError.hidden = true;

    sessionStorage.setItem(tipoLogin, JSON.stringify(usuario));
    sessionStorage.setItem("tipoUsuario", tipoLogin);

    passwordInput.value = '';
    iniciarSistema();
}

function logout() {
    ['paciente', 'medico', 'recepcionista', 'tipoUsuario'].forEach((chave) => {
        sessionStorage.removeItem(chave);
    });

    // Recarrega a página para não sobrar nenhum dado do usuário anterior na tela
    window.location.reload();
}

loginButton.addEventListener("click", validateLogin);
logoutButton.addEventListener("click", logout);
esqueciSenha.addEventListener("click", (e) => {
    e.preventDefault();
    showError("Para redefinir sua senha, procure a recepção da clínica ou ligue para (13) 3333-0000.");
});
[emailInput, passwordInput].forEach((input) =>
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") validateLogin();
    })
);

// Já existe uma sessão aberta nesta aba: entra direto
if (sessionStorage.getItem('tipoUsuario')) {
    iniciarSistema();
}
