import * as data from './dados.js'

const cores = [
  '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
  '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'
];

const TEAL = '#0f7d78';
const TEAL_AREA = 'rgba(15, 125, 120, 0.12)';
const TEXTO = '#6d8189';
const TEXTO_FORTE = '#12324a';
const GRADE = '#e3ebe9';
const FONTE = '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif';

export async function gerar() {
    const dados = await data.carregarDados();
    const consultas = dados['consultas'] || [];
    const medicos = dados['medicos'] || [];
    const pacientes = dados['pacientes'] || [];

    // Recepção
    graficoConsultasPorDia(consultas);
    graficoPorEspecialidade(consultas);

    // Informações Gerais
    graficoTopMedicos(consultas, medicos);
    graficoFaixaEtaria(pacientes);
}

/* ------------------------------------------------------------------ */
/* Utilitários                                                         */
/* ------------------------------------------------------------------ */

// Registra um canvas e redesenha sempre que o tamanho muda.
// Isso também cobre as telas escondidas (display: none) que só
// ganham tamanho quando o usuário navega até elas.
function registrar(id, desenhar) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;

    const render = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (!w || !h) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        desenhar(ctx, w, h);
    };

    new ResizeObserver(render).observe(canvas);
    render();
    return { canvas, render };
}

function semDados(ctx, w, h) {
    ctx.fillStyle = TEXTO;
    ctx.font = `13px ${FONTE}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sem dados para exibir', w / 2, h / 2);
}

function truncar(ctx, texto, larguraMax) {
    if (ctx.measureText(texto).width <= larguraMax) return texto;
    while (texto.length > 1 && ctx.measureText(texto + '…').width > larguraMax) {
        texto = texto.slice(0, -1);
    }
    return texto + '…';
}

function chaveData(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
}

function formatarDia(d) {
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

let tooltipEl = null;
function tooltip() {
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.style.cssText =
            'position:fixed;z-index:1000;pointer-events:none;display:none;' +
            'background:#12324a;color:#fff;font-size:12px;padding:5px 9px;' +
            'border-radius:6px;white-space:nowrap;box-shadow:0 4px 12px rgba(18,50,74,.25);';
        document.body.appendChild(tooltipEl);
    }
    return tooltipEl;
}

/* ------------------------------------------------------------------ */
/* 1. Linha — consultas por dia (últimos 30 dias)                      */
/* ------------------------------------------------------------------ */

function graficoConsultasPorDia(consultas) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dias = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date(hoje);
        d.setDate(d.getDate() - i);
        dias.push({ chave: chaveData(d), data: d, valor: 0 });
    }
    const mapa = new Map(dias.map(d => [d.chave, d]));

    // 30 dias anteriores, só para responder "mais ou menos demanda?"
    const iniAnterior = new Date(hoje);
    iniAnterior.setDate(iniAnterior.getDate() - 59);
    const fimAnterior = new Date(hoje);
    fimAnterior.setDate(fimAnterior.getDate() - 30);
    const kIni = chaveData(iniAnterior);
    const kFim = chaveData(fimAnterior);

    let anterior = 0;
    consultas.forEach(c => {
        const k = (c.dt_agendamento || '').slice(0, 10);
        if (mapa.has(k)) mapa.get(k).valor++;
        else if (k >= kIni && k <= kFim) anterior++;
    });

    const total = dias.reduce((s, d) => s + d.valor, 0);

    const resumo = document.getElementById('resumo-linha');
    if (resumo) {
        const diff = total - anterior;
        const comparacao = anterior > 0
            ? `${diff >= 0 ? '+' : ''}${Math.round((diff / anterior) * 100)}%`
            : `${diff >= 0 ? '+' : ''}${diff}`;
        resumo.textContent = `${total} no período · ${comparacao} vs. 30 dias anteriores`;
    }

    let hover = null;
    const margem = { esq: 26, dir: 16, topo: 8, base: 20 };

    const grafico = registrar('grafico-linha', (ctx, w, h) => {
        if (total === 0 && anterior === 0) return semDados(ctx, w, h);

        const larg = w - margem.esq - margem.dir;
        const alt = h - margem.topo - margem.base;

        const maximo = Math.max(...dias.map(d => d.valor), 1);
        const passo = Math.max(1, Math.ceil(maximo / 4));
        const topo = passo * Math.ceil(maximo / passo);

        const x = i => margem.esq + (i / (dias.length - 1)) * larg;
        const y = v => margem.topo + alt - (v / topo) * alt;

        // grade + eixo Y
        ctx.font = `11px ${FONTE}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let v = 0; v <= topo; v += passo) {
            ctx.strokeStyle = GRADE;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(margem.esq, y(v));
            ctx.lineTo(w - margem.dir, y(v));
            ctx.stroke();
            ctx.fillStyle = TEXTO;
            ctx.fillText(v, margem.esq - 6, y(v));
        }

        // eixo X (uma data a cada 5 dias)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = TEXTO;
        dias.forEach((d, i) => {
            if (i % 5 === 4) ctx.fillText(formatarDia(d.data), x(i), h - margem.base + 6);
        });

        // área
        ctx.beginPath();
        ctx.moveTo(x(0), y(0));
        dias.forEach((d, i) => ctx.lineTo(x(i), y(d.valor)));
        ctx.lineTo(x(dias.length - 1), y(0));
        ctx.closePath();
        ctx.fillStyle = TEAL_AREA;
        ctx.fill();

        // linha
        ctx.beginPath();
        dias.forEach((d, i) => (i === 0 ? ctx.moveTo(x(i), y(d.valor)) : ctx.lineTo(x(i), y(d.valor))));
        ctx.strokeStyle = TEAL;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // pontos só nos dias com consultas (menos poluição visual)
        dias.forEach((d, i) => {
            if (d.valor === 0) return;
            ctx.beginPath();
            ctx.arc(x(i), y(d.valor), 3, 0, Math.PI * 2);
            ctx.fillStyle = TEAL;
            ctx.fill();
        });

        // destaque do dia sob o mouse
        if (hover !== null) {
            ctx.strokeStyle = 'rgba(18, 50, 74, 0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x(hover), margem.topo);
            ctx.lineTo(x(hover), margem.topo + alt);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x(hover), y(dias[hover].valor), 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = TEAL;
            ctx.stroke();
        }
    });

    if (!grafico) return;
    const { canvas, render } = grafico;
    const tip = tooltip();

    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const larg = rect.width - margem.esq - margem.dir;
        const rel = (e.clientX - rect.left - margem.esq) / larg;
        const i = Math.min(dias.length - 1, Math.max(0, Math.round(rel * (dias.length - 1))));

        if (i !== hover) {
            hover = i;
            render();
        }
        const d = dias[i];
        tip.textContent = `${formatarDia(d.data)} — ${d.valor} ${d.valor === 1 ? 'consulta' : 'consultas'}`;
        tip.style.display = 'block';
        tip.style.left = `${e.clientX + 12}px`;
        tip.style.top = `${e.clientY - 34}px`;
    });

    canvas.addEventListener('mouseleave', () => {
        hover = null;
        tip.style.display = 'none';
        render();
    });
}

/* ------------------------------------------------------------------ */
/* 2. Barras horizontais — top médicos por consultas                   */
/* ------------------------------------------------------------------ */

function graficoTopMedicos(consultas, medicos) {
    const lista = medicos
        .map(m => ({
            nome: m.nm_medico,
            valor: consultas.filter(c => c.cd_medico == m.cd_medico).length
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 6);

    const resumo = document.getElementById('resumo-medicos');
    if (resumo) resumo.textContent = `${medicos.length} ${medicos.length === 1 ? 'médico' : 'médicos'}`;

    registrar('grafico-medicos', (ctx, w, h) => {
        if (lista.length === 0) return semDados(ctx, w, h);

        ctx.font = `12px ${FONTE}`;
        const maxNome = Math.max(...lista.map(d => ctx.measureText(d.nome).width));
        const larguraNome = Math.min(maxNome, w * 0.42);

        const areaX = larguraNome + 12;
        const areaW = w - areaX - 30; // 30px reservados para o número
        const maximo = Math.max(...lista.map(d => d.valor), 1);

        const linha = Math.min(30, h / lista.length);
        const barra = Math.min(16, linha * 0.6);
        const offsetY = (h - linha * lista.length) / 2;

        lista.forEach((d, i) => {
            const cy = offsetY + linha * i + linha / 2;

            ctx.fillStyle = TEXTO_FORTE;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(truncar(ctx, d.nome, larguraNome), 0, cy);

            // trilho de fundo
            ctx.fillStyle = '#eef4f3';
            ctx.beginPath();
            ctx.roundRect(areaX, cy - barra / 2, areaW, barra, 4);
            ctx.fill();

            const compr = (d.valor / maximo) * areaW;
            if (compr > 0) {
                ctx.fillStyle = TEAL;
                ctx.beginPath();
                ctx.roundRect(areaX, cy - barra / 2, Math.max(compr, 6), barra, 4);
                ctx.fill();
            }

            ctx.fillStyle = TEXTO_FORTE;
            ctx.font = `bold 12px ${FONTE}`;
            ctx.textAlign = 'left';
            ctx.fillText(d.valor, areaX + areaW + 8, cy);
            ctx.font = `12px ${FONTE}`;
        });
    });
}

/* ------------------------------------------------------------------ */
/* 3. Rosca — consultas por especialidade                              */
/* ------------------------------------------------------------------ */

function graficoPorEspecialidade(consultas) {
    const contagem = new Map();
    consultas.forEach(c => {
        const nome = c.medico?.especialidade?.nm_especialidade || 'Sem especialidade';
        contagem.set(nome, (contagem.get(nome) || 0) + 1);
    });

    const fatias = [...contagem.entries()]
        .map(([label, valor], i) => ({ label, valor }))
        .sort((a, b) => b.valor - a.valor)
        .map((d, i) => ({ ...d, cor: cores[i % cores.length] }));

    const total = fatias.reduce((s, d) => s + d.valor, 0);

    const legenda = document.getElementById('legenda-rosca');
    if (legenda) {
        legenda.innerHTML = fatias.map(d => `
            <div class="legenda-item">
                <span class="legenda-cor" style="background:${d.cor}"></span>
                <span class="legenda-nome">${d.label}</span>
                <strong>${d.valor}</strong>
            </div>
        `).join('');
    }

    registrar('grafico-rosca', (ctx, w, h) => {
        if (total === 0) return semDados(ctx, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const raio = Math.min(w, h) / 2 - 2;
        const interno = raio * 0.62;

        let angulo = -Math.PI / 2;
        fatias.forEach(d => {
            const fim = angulo + (d.valor / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(cx, cy, raio, angulo, fim);
            ctx.arc(cx, cy, interno, fim, angulo, true);
            ctx.closePath();
            ctx.fillStyle = d.cor;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            angulo = fim;
        });

        ctx.fillStyle = TEXTO_FORTE;
        ctx.font = `bold 22px ${FONTE}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(total, cx, cy - 6);
        ctx.fillStyle = TEXTO;
        ctx.font = `11px ${FONTE}`;
        ctx.fillText(total === 1 ? 'consulta' : 'consultas', cx, cy + 12);
    });
}

/* ------------------------------------------------------------------ */
/* 4. Barras — distribuição etária dos pacientes                       */
/* ------------------------------------------------------------------ */

function graficoFaixaEtaria(pacientes) {
    const faixas = [
        { label: '0–17', min: 0, max: 17, valor: 0 },
        { label: '18–30', min: 18, max: 30, valor: 0 },
        { label: '31–45', min: 31, max: 45, valor: 0 },
        { label: '46–60', min: 46, max: 60, valor: 0 },
        { label: '60+', min: 61, max: Infinity, valor: 0 }
    ];

    let total = 0;
    pacientes.forEach(p => {
        if (p.idade === null || p.idade === undefined || p.idade < 0) return;
        const faixa = faixas.find(f => p.idade >= f.min && p.idade <= f.max);
        if (faixa) {
            faixa.valor++;
            total++;
        }
    });

    const resumo = document.getElementById('resumo-idade');
    if (resumo) resumo.textContent = `${total} ${total === 1 ? 'paciente' : 'pacientes'}`;

    registrar('grafico-idade', (ctx, w, h) => {
        if (total === 0) return semDados(ctx, w, h);

        const margemTopo = 20;
        const margemBase = 22;
        const alt = h - margemTopo - margemBase;
        const slot = w / faixas.length;
        const largBarra = Math.min(48, slot * 0.55);
        const maximo = Math.max(...faixas.map(f => f.valor), 1);

        // linha de base
        ctx.strokeStyle = GRADE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, margemTopo + alt);
        ctx.lineTo(w, margemTopo + alt);
        ctx.stroke();

        faixas.forEach((f, i) => {
            const cx = slot * i + slot / 2;
            const altBarra = (f.valor / maximo) * alt;
            const yTopo = margemTopo + alt - altBarra;

            if (f.valor > 0) {
                ctx.fillStyle = TEAL;
                ctx.beginPath();
                ctx.roundRect(cx - largBarra / 2, yTopo, largBarra, altBarra, [5, 5, 0, 0]);
                ctx.fill();
            }

            ctx.fillStyle = TEXTO_FORTE;
            ctx.font = `bold 12px ${FONTE}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(f.valor, cx, yTopo - 4);

            ctx.fillStyle = TEXTO;
            ctx.font = `11px ${FONTE}`;
            ctx.textBaseline = 'top';
            ctx.fillText(f.label, cx, margemTopo + alt + 6);
        });
    });
}