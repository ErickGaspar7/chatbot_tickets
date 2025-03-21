const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');

const client = new Client();
const delay = ms => new Promise(res => setTimeout(res, ms));

let usuariosAtendidos = {}; // Armazena usuários que já receberam o menu

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp conectado!');
});

client.initialize();

client.on('message', async msg => {
    const from = msg.from;

    // Se for o primeiro contato, envia o menu + boas-vindas + imagem
    if (!usuariosAtendidos[from]) {
        await enviarMenu(from, true);
        usuariosAtendidos[from] = true;
        return;
    }

    // Processa a resposta do usuário
    let resposta = '';
    switch (msg.body.trim()) {
        case '1':
            resposta = 'Informe o número do chamado: ';
            break;
        case '2':
            resposta = 'Caso precise de ajuda, você pode abrir um chamado no link: https://ti.novasantarita.rs.gov.br/front/ticket.form.php';
            break;
        case '3':
            resposta = 'Um técnico foi solicitado e entrará em contato com você em breve.';
            break;
        case '4':
            resposta = 'Atendimento encerrado. Caso precise de suporte novamente.\n*Envie uma mensagem a qualquer momento.*';
            delete usuariosAtendidos[from]; // Remove o usuário da lista para reiniciar o atendimento
            break;
        default:
            resposta = 'Opção inválida. Escolha uma das opções do menu.';
            break;
    }

    // Se o usuário escolheu "Encerrar atendimento", não envia o menu novamente
    if (msg.body.trim() !== '4') {
        await enviarMenu(from, false);
    }

    await responder(from, resposta);
});

// Função para enviar o menu e a imagem (apenas no primeiro contato)
async function enviarMenu(destinatario, primeiroContato) {
    const menuTexto = `*🤖 Prefeitura Municipal de Nova Santa Rita*\n\nVocê já tem um chamado aberto?\n\n*1* [✅] - Sim, tenho um chamado\n*2* [❌] - Não, não tenho um chamado\n*3* [👨‍🔧] - Falar com um técnico\n*4* [🚫] - Encerrar atendimento`;

    await client.sendMessage(destinatario, menuTexto);
    await delay(2000);

    if (primeiroContato) {
        const mensagemBoasVindas = 'Olá! Seja bem-vindo ao suporte técnico\nEscolha uma opção do menu acima para continuar: ';
        await client.sendMessage(destinatario, mensagemBoasVindas);

        const imagePath = 'caminho/para/sua/imagem.jpg'; // Substitua pelo caminho real da imagem
        if (fs.existsSync(imagePath)) {
            const media = MessageMedia.fromFilePath(imagePath);
            await client.sendMessage(destinatario, media);
        }
    }
}

// Função para simular digitação antes de responder
async function responder(destinatario, mensagem) {
    const chat = await client.getChatById(destinatario);
    await chat.sendStateTyping();
    await delay(2000);
    await client.sendMessage(destinatario, mensagem);
}
