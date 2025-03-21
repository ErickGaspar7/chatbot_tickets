const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const client = new Client();
const delay = ms => new Promise(res => setTimeout(res, ms));

let aguardandoResposta = {}; 

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp conectado!');
});

client.initialize();

client.on('message', async msg => {
    const from = msg.from;

    if (!aguardandoResposta[from]) {
        await enviarMenu(from);
        aguardandoResposta[from] = true; 
        return;
    }

    let resposta = '';
    switch (msg.body.trim()) {
        case '1':
            resposta = 'Nosso serviço oferece consultas médicas 24h, sem carência e com atendimento ilimitado.';
            break;
        case '2':
            resposta = '*Plano Individual:* R$22,50/mês.\n*Plano Família:* R$39,90/mês.\n*Plano TOP:* R$42,50/mês com benefícios extras.';
            break;
        case '3':
            resposta = 'Benefícios:\n- Sorteios anuais\n- Atendimento médico 24h\n- Receitas de medicamentos';
            break;
        case '4':
            resposta = 'Você pode aderir pelo site ou pelo WhatsApp e terá acesso imediato.\nLink: https://site.com';
            break;
        case '5':
            resposta = 'Se tiver outras dúvidas, fale comigo aqui ou visite nosso site: https://site.com';
            break;
        case '6':
            aguardandoResposta[from] = false; 
            resposta = 'O atendente já vai atender...';
            break;
        case '%':
            aguardandoResposta[from] = false;
            resposta = 'Atendimento encerrado.';
            break;
        default:
            resposta = 'Desculpe, não entendi. Escolha uma opção do menu.';
            break;
    }

    await responder(from, resposta);
    await enviarMenu(from); 
});

async function enviarMenu(destinatario) {
    await client.sendMessage(destinatario, `*🤖 Prefeitura Municipal de Nova Santa Rita*\n\nAbetura de chamados: \nhttps://ti.novasantarita.rs.gov.br/front/ticket.form.php*\n\n*1* [🖨️] - Impressoras \n*2* [💻] - Computadores \n*3* [🌐] - Rede \n*4* [❓] - Outras perguntas \n*6* [👨‍🔧] - Falar com técnico`);
}

async function responder(destinatario, mensagem) {
    const chat = await client.getChatById(destinatario);
    await chat.sendStateTyping();
    await delay(2000); 
    await client.sendMessage(destinatario, mensagem);
}
