import { FUNCIONALIDADES } from '../permissoes.js'
import { escaparHtml } from '../util.js'

// Monta a tabela a partir de permissoes.js, a mesma regra usada no menu
export function load() {
    const corpo = document.getElementById('tabela-permissoes')
    if (!corpo) return false

    const marca = permitido => permitido
        ? '<span class="permission yes" aria-label="Permitido">✓</span>'
        : '<span class="permission no" aria-label="Sem acesso">—</span>'

    corpo.innerHTML = FUNCIONALIDADES.map(([nome, medico, paciente, recepcao]) => `
        <tr>
            <td>${escaparHtml(nome)}</td>
            <td>${marca(medico)}</td>
            <td>${marca(paciente)}</td>
            <td>${marca(recepcao)}</td>
        </tr>`).join('')

    return true
}
