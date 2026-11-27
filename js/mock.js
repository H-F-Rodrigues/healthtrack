// DADOS MOCKADOS PARA dados.js
//
// As datas são relativas ao dia de hoje (dataDemonstracao), para que a
// agenda, os gráficos e os lembretes sempre tenham dados ao abrir o sistema.

function dataDemonstracao(dias, horario) {
    const data = new Date()
    data.setHours(0, 0, 0, 0)
    data.setDate(data.getDate() + dias)
    const dataLocal = [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, '0'),
        String(data.getDate()).padStart(2, '0')
    ].join('-')

    return horario ? `${dataLocal} ${horario}:00` : dataLocal
}

// [dias a partir de hoje, horário, paciente, médico, status, diagnóstico]
// status: 1 = Aguardando, 2 = Confirmada, 3 = Cancelada
const agendaDemonstracao = [
    [-28, '08:00', 1, 1, 2, 1],
    [-27, '09:00', 2, 2, 2, 8],
    [-26, '10:00', 3, 3, 2, 15],
    [-25, '08:30', 4, 4, 3, null],
    [-24, '14:00', 5, 5, 2, 10],
    [-22, '09:30', 6, 6, 2, 15],
    [-21, '11:00', 7, 7, 2, 15],
    [-20, '15:00', 8, 8, 2, 11],
    [-19, '08:00', 9, 9, 2, 9],
    [-18, '10:30', 10, 10, 2, 5],
    [-17, '13:30', 11, 11, 3, null],
    [-15, '09:00', 12, 12, 2, 7],
    [-14, '10:00', 13, 13, 2, 14],
    [-13, '16:00', 14, 14, 2, 3],
    [-12, '08:30', 15, 15, 2, 15],
    [-11, '09:00', 2, 1, 2, 1],
    [-10, '14:30', 4, 15, 2, 15],
    [-8, '10:00', 6, 2, 2, 8],
    [-7, '11:30', 3, 15, 2, 13],
    [-6, '08:00', 8, 1, 2, 1],
    [-5, '09:30', 10, 10, 3, null],
    [-4, '15:30', 1, 15, 2, 12],
    [-3, '10:00', 5, 5, 2, 10],
    [-2, '13:00', 7, 9, 2, 9],
    [-1, '09:00', 9, 1, 2, 1],
    [-1, '11:00', 11, 4, 2, 3],
    [0, '08:00', 12, 1, 2, null],
    [0, '09:00', 1, 1, 2, null],
    [0, '10:00', 3, 2, 1, null],
    [0, '11:00', 13, 15, 3, null],
    [0, '14:00', 5, 1, 1, null],
    [0, '15:30', 14, 6, 2, null],
    [0, '16:30', 7, 15, 1, null],
    [1, '08:30', 2, 1, 1, null],
    [1, '10:00', 6, 2, 2, null],
    [2, '09:00', 8, 3, 1, null],
    [2, '14:00', 15, 1, 2, null],
    [3, '10:30', 1, 2, 1, null],
    [4, '08:00', 10, 10, 2, null],
    [5, '11:00', 4, 4, 1, null],
    [7, '09:30', 11, 1, 1, null],
    [8, '15:00', 1, 1, 2, null],
    [10, '10:00', 9, 9, 1, null],
    [12, '14:30', 12, 12, 1, null]
]

export const consultas = agendaDemonstracao.map(([dias, horario, paciente, medico, status, diagnostico], indice) => ({
    'cd_consulta': indice + 1,
    'cd_paciente': paciente,
    'cd_medico': medico,
    'cd_recepcionista': (indice % 3) + 1,
    'cd_diagnostico': diagnostico,
    'cd_status': status,
    'dt_agendamento': dataDemonstracao(dias, horario)
}))

export const status = [
    {
        'cd_status': 1,
        'nm_status': 'Aguardando'
    },
    {
        'cd_status': 2,
        'nm_status': 'Confirmada'
    },
    {
        'cd_status': 3,
        'nm_status': 'Cancelada'
    }
]

export const diagnosticos = [
    {
        'cd_diagnostico': 1,
        'nm_diagnostico': 'Hipertensão arterial',
        'ds_diagnostico': 'Pressão arterial elevada que necessita de acompanhamento médico.'
    },
    {
        'cd_diagnostico': 2,
        'nm_diagnostico': 'Diabetes tipo 2',
        'ds_diagnostico': 'Alteração no controle da glicose sanguínea.'
    },
    {
        'cd_diagnostico': 3,
        'nm_diagnostico': 'Enxaqueca',
        'ds_diagnostico': 'Cefaleia recorrente que pode exigir tratamento específico.'
    },
    {
        'cd_diagnostico': 4,
        'nm_diagnostico': 'Rinite alérgica',
        'ds_diagnostico': 'Inflamação nasal associada a agentes alérgenos.'
    },
    {
        'cd_diagnostico': 5,
        'nm_diagnostico': 'Gastrite',
        'ds_diagnostico': 'Inflamação da mucosa do estômago.'
    },
    {
        'cd_diagnostico': 6,
        'nm_diagnostico': 'Anemia',
        'ds_diagnostico': 'Condição associada à redução da hemoglobina.'
    },
    {
        'cd_diagnostico': 7,
        'nm_diagnostico': 'Asma',
        'ds_diagnostico': 'Doença respiratória que requer acompanhamento.'
    },
    {
        'cd_diagnostico': 8,
        'nm_diagnostico': 'Dermatite',
        'ds_diagnostico': 'Inflamação da pele com diferentes causas possíveis.'
    },
    {
        'cd_diagnostico': 9,
        'nm_diagnostico': 'Hipotireoidismo',
        'ds_diagnostico': 'Produção insuficiente de hormônios tireoidianos.'
    },
    {
        'cd_diagnostico': 10,
        'nm_diagnostico': 'Lombalgia',
        'ds_diagnostico': 'Dor localizada na região inferior das costas.'
    },
    {
        'cd_diagnostico': 11,
        'nm_diagnostico': 'Ansiedade',
        'ds_diagnostico': 'Condição que pode necessitar de avaliação e acompanhamento.'
    },
    {
        'cd_diagnostico': 12,
        'nm_diagnostico': 'Refluxo gastroesofágico',
        'ds_diagnostico': 'Retorno do conteúdo gástrico ao esôfago.'
    },
    {
        'cd_diagnostico': 13,
        'nm_diagnostico': 'Sinusite',
        'ds_diagnostico': 'Inflamação dos seios paranasais.'
    },
    {
        'cd_diagnostico': 14,
        'nm_diagnostico': 'Osteoartrite',
        'ds_diagnostico': 'Doença articular que pode causar dor e rigidez.'
    },
    {
        'cd_diagnostico': 15,
        'nm_diagnostico': 'Consulta de rotina',
        'ds_diagnostico': 'Avaliação clínica preventiva sem diagnóstico específico registrado.'
    },
]

export const recepcionistas = [
    {
        'cd_recepcionista': 1,
        'nm_recepcionista': 'Ana Beatriz Souza',
        'cd_cpf': '10000000001',
        'ds_email': 'ana.souza@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 2,
        'nm_recepcionista': 'Lucas Martins',
        'cd_cpf': '10000000002',
        'ds_email': 'lucas.martins@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 3,
        'nm_recepcionista': 'Mariana Oliveira',
        'cd_cpf': '10000000003',
        'ds_email': 'mariana.oliveira@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 4,
        'nm_recepcionista': 'Pedro Henrique Lima',
        'cd_cpf': '10000000004',
        'ds_email': 'pedro.lima@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 5,
        'nm_recepcionista': 'Camila Ferreira',
        'cd_cpf': '10000000005',
        'ds_email': 'camila.ferreira@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 6,
        'nm_recepcionista': 'Rafael Costa',
        'cd_cpf': '10000000006',
        'ds_email': 'rafael.costa@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 7,
        'nm_recepcionista': 'Juliana Almeida',
        'cd_cpf': '10000000007',
        'ds_email': 'juliana.almeida@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 8,
        'nm_recepcionista': 'Gabriel Santos',
        'cd_cpf': '10000000008',
        'ds_email': 'gabriel.santos@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 9,
        'nm_recepcionista': 'Beatriz Rodrigues',
        'cd_cpf': '10000000009',
        'ds_email': 'beatriz.rodrigues@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 10,
        'nm_recepcionista': 'Felipe Gomes',
        'cd_cpf': '10000000010',
        'ds_email': 'felipe.gomes@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 11,
        'nm_recepcionista': 'Larissa Ribeiro',
        'cd_cpf': '10000000011',
        'ds_email': 'larissa.ribeiro@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 12,
        'nm_recepcionista': 'Matheus Carvalho',
        'cd_cpf': '10000000012',
        'ds_email': 'matheus.carvalho@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 13,
        'nm_recepcionista': 'Isabela Nunes',
        'cd_cpf': '10000000013',
        'ds_email': 'isabela.nunes@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 14,
        'nm_recepcionista': 'Bruno Mendes',
        'cd_cpf': '10000000014',
        'ds_email': 'bruno.mendes@example.com',
        'ds_senha': 'teste123'
    },
    {
        'cd_recepcionista': 15,
        'nm_recepcionista': 'Leticia Barbosa',
        'cd_cpf': '10000000015',
        'ds_email': 'leticia.barbosa@example.com',
        'ds_senha': 'teste123'
    },
]

export const medicos = [
    {
        'cd_medico': 1,
        'cd_crm': '10001',
        'nm_medico': 'Dra. Manuela Melilo Gaspar',
        'ds_email': 'dramanuela.melilo@example.com',
        'ds_senha': 'dra.manuela09',
        'cd_especialidade': 1
    },
    {
        'cd_medico': 2,
        'cd_crm': '10002',
        'nm_medico': 'Dr. Carlos Eduardo Mendes',
        'ds_email': 'carlos.mendes@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 2
    },
    {
        'cd_medico': 3,
        'cd_crm': '10003',
        'nm_medico': 'Dra. Juliana Prado Lima',
        'ds_email': 'juliana.lima@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 3
    },
    {
        'cd_medico': 4,
        'cd_crm': '10004',
        'nm_medico': 'Dr. Felipe Augusto Rocha',
        'ds_email': 'felipe.rocha@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 4
    },
    {
        'cd_medico': 5,
        'cd_crm': '10005',
        'nm_medico': 'Dra. Renata Oliveira Costa',
        'ds_email': 'renata.costa@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 5
    },
    {
        'cd_medico': 6,
        'cd_crm': '10006',
        'nm_medico': 'Dr. Gustavo Martins Alves',
        'ds_email': 'gustavo.alves@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 6
    },
    {
        'cd_medico': 7,
        'cd_crm': '10007',
        'nm_medico': 'Dra. Patricia Souza Nunes',
        'ds_email': 'patricia.nunes@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 7
    },
    {
        'cd_medico': 8,
        'cd_crm': '10008',
        'nm_medico': 'Dr. Marcelo Ribeiro Dias',
        'ds_email': 'marcelo.dias@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 8
    },
    {
        'cd_medico': 9,
        'cd_crm': '10009',
        'nm_medico': 'Dra. Amanda Ferreira Lopes',
        'ds_email': 'amanda.lopes@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 9
    },
    {
        'cd_medico': 10,
        'cd_crm': '10010',
        'nm_medico': 'Dr. Ricardo Barbosa Melo',
        'ds_email': 'ricardo.melo@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 10
    },
    {
        'cd_medico': 11,
        'cd_crm': '10011',
        'nm_medico': 'Dra. Carolina Santos Freitas',
        'ds_email': 'carolina.freitas@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 11
    },
    {
        'cd_medico': 12,
        'cd_crm': '10012',
        'nm_medico': 'Dr. Thiago Pereira Gomes',
        'ds_email': 'thiago.gomes@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 12
    },
    {
        'cd_medico': 13,
        'cd_crm': '10013',
        'nm_medico': 'Dra. Vanessa Carvalho Pinto',
        'ds_email': 'vanessa.pinto@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 13
    },
    {
        'cd_medico': 14,
        'cd_crm': '10014',
        'nm_medico': 'Dr. Leonardo Castro Silva',
        'ds_email': 'leonardo.silva@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 14
    },
    {
        'cd_medico': 15,
        'cd_crm': '10015',
        'nm_medico': 'Dra. Beatriz Almeida Torres',
        'ds_email': 'beatriz.torres@example.com',
        'ds_senha': 'teste123',
        'cd_especialidade': 15
    },
]

export const especialidades = [
    {
        'cd_especialidade': 1,
        'nm_especialidade': 'Cardiologia'
    },
    {
        'cd_especialidade': 2,
        'nm_especialidade': 'Dermatologia'
    },
    {
        'cd_especialidade': 3,
        'nm_especialidade': 'Pediatria'
    },
    {
        'cd_especialidade': 4,
        'nm_especialidade': 'Neurologia'
    },
    {
        'cd_especialidade': 5,
        'nm_especialidade': 'Ortopedia'
    },
    {
        'cd_especialidade': 6,
        'nm_especialidade': 'Oftalmologia'
    },
    {
        'cd_especialidade': 7,
        'nm_especialidade': 'Ginecologia'
    },
    {
        'cd_especialidade': 8,
        'nm_especialidade': 'Psiquiatria'
    },
    {
        'cd_especialidade': 9,
        'nm_especialidade': 'Endocrinologia'
    },
    {
        'cd_especialidade': 10,
        'nm_especialidade': 'Gastroenterologia'
    },
    {
        'cd_especialidade': 11,
        'nm_especialidade': 'Urologia'
    },
    {
        'cd_especialidade': 12,
        'nm_especialidade': 'Pneumologia'
    },
    {
        'cd_especialidade': 13,
        'nm_especialidade': 'Reumatologia'
    },
    {
        'cd_especialidade': 14,
        'nm_especialidade': 'Oncologia'
    },
    {
        'cd_especialidade': 15,
        'nm_especialidade': 'Clínica Geral'
    },
]

export const pacientes = [
    {
        'cd_paciente': 1,
        'nm_paciente': 'Marcos Vinicius Silva',
        'ds_email': 'marcos.silva@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000001',
        'cd_telefone': '13999990001',
        'sg_genero': 'M',
        'sg_tipo_sanguineo': 'O+',
        'dt_nascimento': '1990-04-12'
    },
    {
        'cd_paciente': 2,
        'nm_paciente': 'Fernanda Alves Costa',
        'ds_email': 'fernanda.costa@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000002',
        'cd_telefone': '13999990002',
        'sg_genero': 'F',
        'sg_tipo_sanguineo': 'A+',
        'dt_nascimento': '1985-08-23'
    },
    {
        'cd_paciente': 3,
        'nm_paciente': 'Joao Pedro Santos',
        'ds_email': 'joao.santos@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000003',
        'cd_telefone': '13999990003',
        'sg_genero': 'M',
        'sg_tipo_sanguineo': 'B+',
        'dt_nascimento': '2001-02-17'
    },
    {
        'cd_paciente': 4,
        'nm_paciente': 'Beatriz Lima Rocha',
        'ds_email': 'beatriz.rocha@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000004',
        'cd_telefone': '13999990004',
        'sg_genero': 'F',
        'sg_tipo_sanguineo': 'AB+',
        'dt_nascimento': '1998-11-05'
    },
    {
        'cd_paciente': 5,
        'nm_paciente': 'Gabriel Oliveira Melo',
        'ds_email': 'gabriel.melo@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000005',
        'cd_telefone': '13999990005',
        'sg_genero': 'M',
        'sg_tipo_sanguineo': 'O-',
        'dt_nascimento': '1979-06-30'
    },
    {
        'cd_paciente': 6,
        'nm_paciente': 'Camila Souza Pereira',
        'ds_email': 'camila.pereira@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000006',
        'cd_telefone': '13999990006',
        'sg_genero': 'F',
        'sg_tipo_sanguineo': 'A-',
        'dt_nascimento': '2003-09-14'
    },
    {
        'cd_paciente': 7,
        'nm_paciente': 'Lucas Ferreira Gomes',
        'ds_email': 'lucas.gomes@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000007',
        'cd_telefone': '13999990007',
        'sg_genero': 'M',
        'sg_tipo_sanguineo': 'B-',
        'dt_nascimento': '1995-12-01'
    },
    {
        'cd_paciente': 8,
        'nm_paciente': 'Isabela Martins Dias',
        'ds_email': 'isabela.dias@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000008',
        'cd_telefone': '13999990008',
        'sg_genero': 'F',
        'sg_tipo_sanguineo': 'AB-',
        'dt_nascimento': '1988-03-22'
    },
    {
        'cd_paciente': 9,
        'nm_paciente': 'Rafael Carvalho Nunes',
        'ds_email': 'rafael.nunes@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000009',
        'cd_telefone': '13999990009',
        'sg_genero': 'M',
        'sg_tipo_sanguineo': 'O+',
        'dt_nascimento': '1972-07-19'
    },
    {
        'cd_paciente': 10,
        'nm_paciente': 'Laura Rodrigues Pinto',
        'ds_email': 'laura.pinto@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000010',
        'cd_telefone': '13999990010',
        'sg_genero': 'F',
        'sg_tipo_sanguineo': 'A+',
        'dt_nascimento': '2000-01-28'
    },
    {
        'cd_paciente': 11,
        'nm_paciente': 'Thiago Ribeiro Lopes',
        'ds_email': 'thiago.lopes@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000011',
        'cd_telefone': '13999990011',
        'sg_genero': 'M',
        'sg_tipo_sanguineo': 'B+',
        'dt_nascimento': '1993-05-09'
    },
    {
        'cd_paciente': 12,
        'nm_paciente': 'Manuela Castro Freitas',
        'ds_email': 'manuela.freitas@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000012',
        'cd_telefone': '13999990012',
        'sg_genero': 'F',
        'sg_tipo_sanguineo': 'AB+',
        'dt_nascimento': '1982-10-16'
    },
    {
        'cd_paciente': 13,
        'nm_paciente': 'Eduardo Mendes Barros',
        'ds_email': 'eduardo.barros@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000013',
        'cd_telefone': '13999990013',
        'sg_genero': 'M',
        'sg_tipo_sanguineo': 'O-',
        'dt_nascimento': '1968-02-04'
    },
    {
        'cd_paciente': 14,
        'nm_paciente': 'Sofia Barbosa Teixeira',
        'ds_email': 'sofia.teixeira@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000014',
        'cd_telefone': '13999990014',
        'sg_genero': 'F',
        'sg_tipo_sanguineo': 'A-',
        'dt_nascimento': '2005-06-11'
    },
    {
        'cd_paciente': 15,
        'nm_paciente': 'André Luiz Moreira',
        'ds_email': 'andre.moreira@example.com',
        'ds_senha': 'teste123',
        'cd_cpf': '20000000015',
        'cd_telefone': '13999990015',
        'sg_genero': 'M',
        'sg_tipo_sanguineo': 'B-',
        'dt_nascimento': '1997-09-27'
    },
]

export const enderecos = [
    {
        'cd_endereco': 1,
        'cd_cep': '11700001',
        'nm_rua': 'Rua das Flores',
        'ds_numero': '101',
        'cd_paciente': 1,
        'cd_cidade': 1
    },
    {
        'cd_endereco': 2,
        'cd_cep': '11010001',
        'nm_rua': 'Rua do Comercio',
        'ds_numero': '202',
        'cd_paciente': 2,
        'cd_cidade': 2
    },
    {
        'cd_endereco': 3,
        'cd_cep': '20010000',
        'nm_rua': 'Rua Primeiro de Março',
        'ds_numero': '303',
        'cd_paciente': 3,
        'cd_cidade': 3
    },
    {
        'cd_endereco': 4,
        'cd_cep': '30110000',
        'nm_rua': 'Avenida Brasil',
        'ds_numero': '404',
        'cd_paciente': 4,
        'cd_cidade': 4
    },
    {
        'cd_endereco': 5,
        'cd_cep': '29010000',
        'nm_rua': 'Rua Sete de Setembro',
        'ds_numero': '505',
        'cd_paciente': 5,
        'cd_cidade': 5
    },
    {
        'cd_endereco': 6,
        'cd_cep': '80010000',
        'nm_rua': 'Rua XV de Novembro',
        'ds_numero': '606',
        'cd_paciente': 6,
        'cd_cidade': 6
    },
    {
        'cd_endereco': 7,
        'cd_cep': '88010000',
        'nm_rua': 'Avenida Beira-Mar',
        'ds_numero': '707',
        'cd_paciente': 7,
        'cd_cidade': 7
    },
    {
        'cd_endereco': 8,
        'cd_cep': '90010000',
        'nm_rua': 'Rua dos Andradas',
        'ds_numero': '808',
        'cd_paciente': 8,
        'cd_cidade': 8
    },
    {
        'cd_endereco': 9,
        'cd_cep': '40010000',
        'nm_rua': 'Avenida Oceânica',
        'ds_numero': '909',
        'cd_paciente': 9,
        'cd_cidade': 9
    },
    {
        'cd_endereco': 10,
        'cd_cep': '50010000',
        'nm_rua': 'Rua da Aurora',
        'ds_numero': '110',
        'cd_paciente': 10,
        'cd_cidade': 10
    },
    {
        'cd_endereco': 11,
        'cd_cep': '60010000',
        'nm_rua': 'Avenida Santos Dumont',
        'ds_numero': '120',
        'cd_paciente': 11,
        'cd_cidade': 11
    },
    {
        'cd_endereco': 12,
        'cd_cep': '74000001',
        'nm_rua': 'Rua Goiás',
        'ds_numero': '130',
        'cd_paciente': 12,
        'cd_cidade': 12
    },
    {
        'cd_endereco': 13,
        'cd_cep': '78000001',
        'nm_rua': 'Avenida Mato Grosso',
        'ds_numero': '140',
        'cd_paciente': 13,
        'cd_cidade': 13
    },
    {
        'cd_endereco': 14,
        'cd_cep': '79000001',
        'nm_rua': 'Rua da Paz',
        'ds_numero': '150',
        'cd_paciente': 14,
        'cd_cidade': 14
    },
    {
        'cd_endereco': 15,
        'cd_cep': '66000001',
        'nm_rua': 'Avenida Nazaré',
        'ds_numero': '160',
        'cd_paciente': 15,
        'cd_cidade': 15
    },
]

export const cidades = [
    {
        'cd_cidade': 1,
        'nm_cidade': 'Praia Grande',
        'sg_uf': 'SP'
    },
    {
        'cd_cidade': 2,
        'nm_cidade': 'Santos',
        'sg_uf': 'SP'
    },
    {
        'cd_cidade': 3,
        'nm_cidade': 'Rio de Janeiro',
        'sg_uf': 'RJ'
    },
    {
        'cd_cidade': 4,
        'nm_cidade': 'Belo Horizonte',
        'sg_uf': 'MG'
    },
    {
        'cd_cidade': 5,
        'nm_cidade': 'Vitória',
        'sg_uf': 'ES'
    },
    {
        'cd_cidade': 6,
        'nm_cidade': 'Curitiba',
        'sg_uf': 'PR'
    },
    {
        'cd_cidade': 7,
        'nm_cidade': 'Florianópolis',
        'sg_uf': 'SC'
    },
    {
        'cd_cidade': 8,
        'nm_cidade': 'Porto Alegre',
        'sg_uf': 'RS'
    },
    {
        'cd_cidade': 9,
        'nm_cidade': 'Salvador',
        'sg_uf': 'BA'
    },
    {
        'cd_cidade': 10,
        'nm_cidade': 'Recife',
        'sg_uf': 'PE'
    },
    {
        'cd_cidade': 11,
        'nm_cidade': 'Fortaleza',
        'sg_uf': 'CE'
    },
    {
        'cd_cidade': 12,
        'nm_cidade': 'Goiânia',
        'sg_uf': 'GO'
    },
    {
        'cd_cidade': 13,
        'nm_cidade': 'Cuiabá',
        'sg_uf': 'MT'
    },
    {
        'cd_cidade': 14,
        'nm_cidade': 'Campo Grande',
        'sg_uf': 'MS'
    },
    {
        'cd_cidade': 15,
        'nm_cidade': 'Belém',
        'sg_uf': 'PA'
    },
]

export const uf = [
    { 'sg_uf': 'AC', 'nm_uf': 'Acre' },
    { 'sg_uf': 'AL', 'nm_uf': 'Alagoas' },
    { 'sg_uf': 'AP', 'nm_uf': 'Amapá' },
    { 'sg_uf': 'AM', 'nm_uf': 'Amazonas' },
    { 'sg_uf': 'BA', 'nm_uf': 'Bahia' },
    { 'sg_uf': 'CE', 'nm_uf': 'Ceará' },
    { 'sg_uf': 'DF', 'nm_uf': 'Distrito Federal' },
    { 'sg_uf': 'ES', 'nm_uf': 'Espírito Santo' },
    { 'sg_uf': 'GO', 'nm_uf': 'Goiás' },
    { 'sg_uf': 'MA', 'nm_uf': 'Maranhão' },
    { 'sg_uf': 'MT', 'nm_uf': 'Mato Grosso' },
    { 'sg_uf': 'MS', 'nm_uf': 'Mato Grosso do Sul' },
    { 'sg_uf': 'MG', 'nm_uf': 'Minas Gerais' },
    { 'sg_uf': 'PA', 'nm_uf': 'Pará' },
    { 'sg_uf': 'PB', 'nm_uf': 'Paraíba' },
    { 'sg_uf': 'PR', 'nm_uf': 'Paraná' },
    { 'sg_uf': 'PE', 'nm_uf': 'Pernambuco' },
    { 'sg_uf': 'PI', 'nm_uf': 'Piauí' },
    { 'sg_uf': 'RJ', 'nm_uf': 'Rio de Janeiro' },
    { 'sg_uf': 'RN', 'nm_uf': 'Rio Grande do Norte' },
    { 'sg_uf': 'RS', 'nm_uf': 'Rio Grande do Sul' },
    { 'sg_uf': 'RO', 'nm_uf': 'Rondônia' },
    { 'sg_uf': 'RR', 'nm_uf': 'Roraima' },
    { 'sg_uf': 'SC', 'nm_uf': 'Santa Catarina' },
    { 'sg_uf': 'SP', 'nm_uf': 'São Paulo' },
    { 'sg_uf': 'SE', 'nm_uf': 'Sergipe' },
    { 'sg_uf': 'TO', 'nm_uf': 'Tocantins' },
]

// [paciente, médico, medicamento, dosagem, horário, início (dias), fim (dias)]
const lembretesDemonstracao = [
    [1, 1, 8, '50 mg, 1 comprimido', '08:00', -20, 60],
    [1, 15, 6, '20 mg, 1 cápsula em jejum', '07:00', -4, 10],
    [2, 1, 8, '50 mg, 1 comprimido', '08:00 e 20:00', -11, 50],
    [2, 2, 5, '10 mg, 1 comprimido', '21:00', -27, -13],
    [3, 15, 12, '10 mg, 1 comprimido', '22:00', -7, 7],
    [4, 15, 1, '750 mg, se houver dor', 'A cada 8 horas', -10, -5],
    [5, 5, 3, '600 mg, 1 comprimido após refeição', '08:00 e 20:00', -3, 4],
    [6, 2, 5, '10 mg, 1 comprimido', '21:00', -8, 22],
    [7, 9, 10, '50 mcg, 1 comprimido em jejum', '06:30', -2, 88],
    [8, 1, 9, '25 mg, 1 comprimido', '08:00', -6, 84],
    [9, 1, 13, '20 mg, 1 comprimido', '22:00', -1, 89],
    [10, 10, 6, '20 mg, 1 cápsula em jejum', '07:00', -18, -4],
    [11, 4, 2, '1 g, se houver dor', 'Até 4 vezes ao dia', -1, 6],
    [12, 12, 11, '2 jatos, se houver falta de ar', 'Conforme necessidade', -15, 45],
    [13, 13, 15, '2.000 UI, 1 cápsula', '12:00', -14, 76],
    [14, 14, 14, '50 mg, 1 comprimido', '09:00', -13, 77],
    [15, 15, 7, '500 mg, 1 comprimido após o jantar', '20:00', -12, 78]
]

export const alertas = lembretesDemonstracao.map(([paciente, medico, medicamento, dosagem, horario, inicio, fim], indice) => ({
    'cd_alerta': indice + 1,
    'ds_dosagem': dosagem,
    'ds_horario': horario,
    'dt_inicio': dataDemonstracao(inicio),
    'dt_fim': dataDemonstracao(fim),
    'cd_paciente': paciente,
    'cd_medico': medico,
    'cd_medicamento': medicamento
}))

export const medicamentos = [
    { 'cd_medicamento': 1, 'nm_medicamento': 'Paracetamol' },
    { 'cd_medicamento': 2, 'nm_medicamento': 'Dipirona' },
    { 'cd_medicamento': 3, 'nm_medicamento': 'Ibuprofeno' },
    { 'cd_medicamento': 4, 'nm_medicamento': 'Amoxicilina' },
    { 'cd_medicamento': 5, 'nm_medicamento': 'Loratadina' },
    { 'cd_medicamento': 6, 'nm_medicamento': 'Omeprazol' },
    { 'cd_medicamento': 7, 'nm_medicamento': 'Metformina' },
    { 'cd_medicamento': 8, 'nm_medicamento': 'Losartana' },
    { 'cd_medicamento': 9, 'nm_medicamento': 'Atenolol' },
    { 'cd_medicamento': 10, 'nm_medicamento': 'Levotiroxina' },
    { 'cd_medicamento': 11, 'nm_medicamento': 'Salbutamol' },
    { 'cd_medicamento': 12, 'nm_medicamento': 'Cetirizina' },
    { 'cd_medicamento': 13, 'nm_medicamento': 'Sinvastatina' },
    { 'cd_medicamento': 14, 'nm_medicamento': 'Sertralina' },
    { 'cd_medicamento': 15, 'nm_medicamento': 'Vitamina D' },
]

export const notificacoes = [
    {
        id: 1,
        titulo: 'Consulta confirmada',
        mensagem: 'Sua consulta com Dra. Manuela Melilo Gaspar hoje às 09:00 está confirmada.',
        data: dataDemonstracao(-1, '18:00').replace(' ', 'T'),
        lida: false,
        cd_paciente: 1,
        cd_medico: 1
    },
    {
        id: 2,
        titulo: 'Novo lembrete de medicação',
        mensagem: 'Omeprazol 20 mg foi adicionado aos seus lembretes.',
        data: dataDemonstracao(-4, '16:10').replace(' ', 'T'),
        lida: true,
        cd_paciente: 1,
        cd_medico: 15
    },
    {
        id: 3,
        titulo: 'Consulta cancelada',
        mensagem: 'A consulta de Eduardo Mendes Barros com Dra. Beatriz Almeida Torres, hoje às 11:00, foi cancelada.',
        data: dataDemonstracao(-1, '10:30').replace(' ', 'T'),
        lida: false,
        cd_paciente: 13,
        cd_medico: 15
    }
]

// Prontuário clínico de cada paciente (editado pelo médico)
export const prontuarios = [
    {
        'cd_paciente': 1,
        'ds_alergias': 'Dipirona',
        'cd_diagnostico': 1,
        'ds_observacoes': 'Hipertensão em acompanhamento. Pressão controlada com Losartana.',
        'evolucoes': [
            { 'dt_registro': dataDemonstracao(-28, '08:25'), 'cd_medico': 1, 'ds_texto': 'PA 150x95 mmHg. Iniciada Losartana 50 mg/dia. Retorno em 4 semanas.' },
            { 'dt_registro': dataDemonstracao(-4, '15:50'), 'cd_medico': 15, 'ds_texto': 'Queixa de azia após refeições. Prescrito Omeprazol por 14 dias.' }
        ]
    },
    {
        'cd_paciente': 2,
        'ds_alergias': '',
        'cd_diagnostico': 1,
        'ds_observacoes': 'Hipertensão leve. Orientada dieta com pouco sal.',
        'evolucoes': [
            { 'dt_registro': dataDemonstracao(-11, '09:20'), 'cd_medico': 1, 'ds_texto': 'PA 140x90 mmHg. Ajustada dose de Losartana para 2x ao dia.' }
        ]
    },
    {
        'cd_paciente': 8,
        'ds_alergias': 'Penicilina',
        'cd_diagnostico': 1,
        'ds_observacoes': 'Histórico familiar de doença cardíaca.',
        'evolucoes': [
            { 'dt_registro': dataDemonstracao(-6, '08:30'), 'cd_medico': 1, 'ds_texto': 'Eletrocardiograma sem alterações. Iniciado Atenolol 25 mg.' }
        ]
    }
]
