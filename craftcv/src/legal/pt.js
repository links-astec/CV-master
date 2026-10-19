// Portuguese translation of the Privacy policy and the Terms (same sections and ids as the English
// in src/views/Legal.vue). If the two differ, the English version applies.
export const UPDATED = '12 de outubro de 2026'

export default ({ mail }) => {
  const TEAM = 'Gabriel Quaye e Nisy Adjei Acheampong'
  return [
    {
      id: 'privacy', tab: 'Política de privacidade', title: 'Política de privacidade',
      summary: [
        'Nunca vendemos seus dados nem mostramos anúncios.',
        'Seu currículo é seu. Exclua-o, ou exclua sua conta inteira, quando quiser.',
        'Os dados do cartão vão direto para a Stripe; nunca os vemos nem os guardamos.',
        'Um único cookie para manter você conectado. Nenhum cookie de rastreamento ou publicidade.',
      ],
      sections: [
        { id: 'who', title: 'Quem somos', html: `<p>O CVMaster («nós») é um criador de currículos assistido por IA, disponível em cvmaster.live e operado na França por ${TEAM}, responsáveis pelo tratamento dos seus dados pessoais. Contato: ${mail}.</p>` },
        { id: 'collect', title: 'Quais dados coletamos', html: `<ul>
          <li><strong>Dados da conta</strong>: seu nome, seu e-mail e sua senha (guardada apenas como hash seguro).</li>
          <li><strong>Seus currículos</strong>: tudo o que você coloca neles. Sem conta, seu currículo fica apenas no seu navegador até você se cadastrar.</li>
          <li><strong>Vagas de emprego</strong>: as descrições que você cola para adaptar um currículo, salvas com esse currículo.</li>
          <li><strong>Pagamentos</strong>: processados pela Stripe. Registramos que um currículo foi pago, nunca os dados do seu cartão.</li>
          <li><strong>Mensagens que você nos envia</strong>: comentários e reclamações, com o e-mail que você informa para a nossa resposta.</li>
          <li><strong>Dados técnicos</strong>: registros básicos do servidor (endereço IP, horário) para segurança e correção de problemas.</li>
        </ul>` },
        { id: 'use', title: 'Como os usamos', html: `<ul>
          <li>Para manter sua conta e salvar seus currículos.</li>
          <li>Para as funções de IA que você escolher usar (ajuda na escrita, adaptação a uma vaga, verificação ATS, verificação de compatibilidade com a vaga, tradução).</li>
          <li>Para personalizar as sugestões da IA nos currículos em seu nome, usando suas respostas no cadastro e seus outros currículos. Os currículos que você faz para outra pessoa não usam esses dados, e você pode desativar isso em Configurações.</li>
          <li>Para enviar seu currículo por e-mail e mensagens da conta, como a redefinição de senha.</li>
          <li>Para receber pagamentos pela Stripe.</li>
          <li>Para responder a comentários e reclamações e para melhorar o CVMaster.</li>
        </ul>` },
        { id: 'personal', title: 'Personalização, notificações e voz', html: `<p><strong>O seu país</strong>: o site e o app registam o país definido no seu dispositivo, a partir do fuso horário (nunca a partir do seu endereço de internet). Usamo-lo para mostrar os preços na sua moeda e contar quantas pessoas usam o CVMaster em cada país, com ou sem conta.</p><p>Quando tem sessão iniciada, guardamos um registo breve do que faz no CVMaster, no site e no app: por exemplo, que criou um currículo, escolheu um layout, usou uma função de IA, comparou um currículo com uma vaga ou o exportou. Usamo-lo apenas para personalizar o CVMaster para si: sugerir o próximo passo, mostrar primeiro os layouts de que gosta e lembrá-lo, no máximo uma vez por semana, de onde parou. Fica nos nossos próprios servidores, nunca é vendido nem partilhado e nunca é usado para publicidade. É apagado ao fim de 13 meses, e com a sua conta.</p><p>Pode desligar isto a qualquer momento nas Definições (“Personalizar com a minha atividade”); o que guardámos é então apagado. Baseamo-nos no nosso interesse legítimo em tornar o CVMaster útil para si, e o seu direito de oposição aplica-se sempre.</p><p><strong>Notificações push</strong> (app para telemóvel): se as permitir, enviamos notificações, por exemplo um currículo grátis ganho com o seu link de convite, e os lembretes acima. Para isso guardamos um identificador de notificações do seu telemóvel; as notificações são entregues através da Expo, da Apple e da Google. Desligue-as nas Definições do app ou do telemóvel.</p><p><strong>Entrada por voz</strong> (app para telemóvel): se gravar a sua história, a gravação é enviada a um serviço de transcrição para ser transformada em texto. Não guardamos a gravação.</p>` },
        { id: 'newsletter', title: 'Newsletter', html: `<p>Só enviamos nossa newsletter (dicas de currículo e novidades do CVMaster) se você pedir: na página inicial, com a caixa opcional ao criar sua conta, ou em Configurações. Se você se inscrever pela página inicial, primeiro enviamos um link de confirmação. A base legal é o seu consentimento.</p><p>Guardamos seu e-mail, quando e onde você deu o consentimento e quando cancelou a inscrição. Toda newsletter tem um link para cancelar com um clique; você também pode desativá-la em Configurações ou escrever para ${mail}. Paramos de enviar imediatamente. E-mails sobre sua conta e suas compras não são afetados.</p>` },
        { id: 'share', title: 'Com quem compartilhamos', html: `<p>Não vendemos seus dados. Só os compartilhamos com os serviços que fazem o CVMaster funcionar:</p><ul>
          <li><strong>Provedores de serviços de IA</strong>: O texto do currículo e a vaga usados numa função de IA são enviados a eles para gerar o resultado.</li>
          <li><strong>Stripe</strong>: pagamentos.</li>
          <li><strong>Resend</strong>: envio de e-mails, incluindo os PDFs dos currículos que você exporta.</li>
          <li><strong>Google</strong>: apenas se você entrar com o Google.</li>
          <li><strong>Vercel, Render e Neon</strong>: hospedagem e o banco de dados onde seus dados ficam guardados.</li>
        </ul><p>Alguns desses provedores ficam nos Estados Unidos ou tratam dados lá. Quando os dados saem da UE, ficam protegidos pelas garantias exigidas pelo RGPD, como as cláusulas contratuais-tipo da Comissão Europeia ou o Quadro de Privacidade de Dados UE–EUA.</p>` },
        { id: 'keep', title: 'Por quanto tempo guardamos', html: `<p>Guardamos sua conta e seus currículos até você excluí-los ou nos pedir para fazer isso. Comentários e reclamações são guardados pelo tempo necessário para resolver o assunto. Os registros de pagamento podem ser guardados por mais tempo quando a lei exigir.</p>` },
        { id: 'rights', title: 'Seus direitos', html: `<p>Pela legislação de proteção de dados do Reino Unido e da UE, você pode pedir para acessar, corrigir, exportar ou excluir seus dados pessoais, ou se opor ao seu uso. Escreva para ${mail} e responderemos em até um mês.</p><p>Se não estiver satisfeito com a forma como tratamos seus dados, você pode apresentar uma reclamação à CNIL (cnil.fr), a autoridade francesa de proteção de dados, ou à autoridade do país onde vive, por exemplo a CNPD (cnpd.pt) em Portugal ou a ANPD (gov.br/anpd) no Brasil.</p>` },
        { id: 'cookies', title: 'Cookies', html: `<p>Usamos um cookie para manter você conectado. Não usamos cookies de rastreamento nem de publicidade. O armazenamento local do seu navegador guarda seu currículo se você usar o CVMaster sem conta, e suas preferências (idioma, modo escuro).</p>` },
        { id: 'security', title: 'Segurança', html: `<p>As senhas são protegidas com bcrypt, tudo trafega por HTTPS e os pagamentos com cartão são processados inteiramente pela Stripe.</p>` },
        { id: 'changes', title: 'Alterações nesta política', html: `<p>Se alterarmos esta política, atualizaremos a data acima e, em caso de mudanças importantes, avisaremos você por e-mail.</p>` },
      ],
    },
    {
      id: 'terms', tab: 'Termos de serviço', title: 'Termos de serviço',
      summary: [
        'Criar e pré-visualizar seu currículo é grátis.',
        'Um PDF sem marca d’água custa 0,99 € por currículo, uma única vez. Ou o Job Hunt Pass: todos os seus currículos por 6,99 € por mês, cancele quando quiser.',
        'O que você escreve é seu. Confira as sugestões da IA antes de enviar seu currículo.',
        'Algo deu errado? Fale com a gente. Se seu currículo nunca chegou, reenviamos ou devolvemos o valor.',
      ],
      sections: [
        { id: 'accept', title: 'Uso do CVMaster', html: `<p>Ao usar o CVMaster, você aceita estes termos. Se não concordar, não use o serviço. Você precisa ter pelo menos 16 anos.</p>` },
        { id: 'service', title: 'O serviço', html: `<p>O CVMaster permite criar, editar, adaptar e exportar currículos com ajuda opcional de IA. Trabalhamos para que tudo funcione bem, mas o serviço é oferecido «no estado em que se encontra» e às vezes pode ficar indisponível.</p>` },
        { id: 'account', title: 'Sua conta', html: `<ul>
          <li>Informe dados corretos ao se cadastrar.</li>
          <li>Mantenha sua senha em segurança. Você é responsável pela atividade na sua conta.</li>
        </ul>` },
        { id: 'payments', title: 'Pagamentos', html: `<ul>
          <li>O PDF sem marca d’água de um currículo é um pagamento único de <strong>0,99 €</strong>. Inclui o envio por e-mail, o download direto e reenvios e downloads ilimitados do mesmo currículo, inclusive após edições.</li>
        <li>O <strong>Job Hunt Pass</strong> custa <strong>6,99 € por mês</strong> e renova-se todos os meses até o cancelar. Enquanto estiver ativo, cada currículo da sua conta pode ser enviado por e-mail e transferido como PDF sem marca d’água, e tem 100 pedidos de IA por dia. Pode cancelá-lo a qualquer momento nas Definições: não é cobrado mais nada e o passe continua ativo até ao fim do mês já pago, que não é reembolsado. Como o passe começa imediatamente a seu pedido, ao comprá-lo aceita que o seu direito de livre resolução de 14 dias termina quando ele começa.</li>
          <li>O PDF de pré-visualização com marca d’água é grátis.</li>
          <li>As funções de IA incluem <strong>30 solicitações grátis por dia</strong> para contas com e-mail confirmado (visitantes e contas não confirmadas têm 5), renovadas todos os dias à meia-noite (UTC). Um pacote de <strong>100 solicitações extras</strong> custa <strong>0,50 €</strong>; as solicitações extras não expiram, só são usadas depois das gratuitas do dia e não têm valor em dinheiro.</li>
          <li>Indicações: quem se cadastra pelo seu link de convite recebe 25 solicitações de IA extras. Quando essa pessoa compra o primeiro PDF sem marca d’água, você ganha um crédito de indicação, que desbloqueia o PDF sem marca d’água de um currículo. Os créditos não têm valor em dinheiro.</li>
          <li>Os pagamentos são processados pela Stripe.</li>
          <li><strong>Direito de arrependimento:</strong> normalmente você tem 14 dias para cancelar uma compra online. Como seu PDF (ou suas solicitações de IA) é entregue na hora, ao pagar você nos pede para começar imediatamente e confirma que perde esse direito depois da entrega, como permite a legislação de consumo da UE (na França, o artigo L221-28 do Code de la consommation).</li>
          <li>Se seu currículo nunca chegou, ou algo deu errado com um pagamento, fale com a gente em até 14 dias e reenviaremos ou devolveremos o valor.</li>
        </ul>` },
        { id: 'complaints', title: 'Reclamações', html: `<p>Se algo não agradou você, seja o serviço, um pagamento ou a forma como tratamos você, conte para a gente:</p><ul>
          <li>Use <strong>Feedback → Reclamação</strong> (na barra lateral, em Configurações ou no fim desta página), ou escreva para ${mail}.</li>
          <li>Diga o que aconteceu, quando e o e-mail da sua conta ou do pagamento.</li>
          <li>Você receberá um número de referência. Procuramos responder em até 5 dias úteis e resolver reclamações em até 14 dias.</li>
        </ul>` },
        { id: 'use', title: 'Uso aceitável', html: `<p>Por favor, não:</p><ul>
          <li>use o CVMaster para nada ilegal ou enganoso;</li>
          <li>tente contornar pagamentos ou acessar funções pagas sem pagar;</li>
          <li>copie, faça engenharia reversa ou revenda o serviço ou seus modelos;</li>
          <li>envie conteúdo ilegal, prejudicial ou que viole direitos de terceiros.</li>
        </ul>` },
        { id: 'reviews', title: 'Avaliações', html: `<p>Quem criou um currículo pode avaliar o CVMaster. As avaliações com estrelas contam de imediato. Os comentários escritos, e as alterações posteriores, são verificados por nós antes de aparecerem no nosso site, para afastar spam, abusos e dados pessoais; até uma alteração ser aprovada, mantém-se a versão anterior. Nunca removemos nem ocultamos uma avaliação por ser negativa, e não pagamos por avaliações.</p>` },
        { id: 'ai', title: 'Conteúdo gerado por IA', html: `<p>As sugestões da IA podem estar erradas. O CVMaster nunca adiciona nada sem a sua aprovação, mas você é responsável por conferir que tudo no seu currículo é verdadeiro antes de enviá-lo.</p>` },
        { id: 'ip', title: 'De quem é o quê', html: `<p>O conteúdo do seu currículo é seu. A plataforma CVMaster, seus designs e modelos são nossos.</p>` },
        { id: 'liability', title: 'Responsabilidade', html: `<p>Não respondemos por perdas indiretas ou consequenciais, incluindo o resultado de qualquer candidatura. Nada nestes termos limita os direitos que a legislação de consumo garante a você.</p>` },
        { id: 'law', title: 'Lei aplicável', html: `<p>Estes termos são regidos pela lei francesa. Se você é consumidor, mantém também a proteção das leis de consumo obrigatórias do país onde vive e pode recorrer aos tribunais do seu país.</p>` },
        { id: 'notice', title: 'Aviso legal', html: `<ul>
          <li><strong>Editores:</strong> ${TEAM}, França, ${mail}</li>
          <li><strong>Hospedagem do site:</strong> Vercel Inc. (vercel.com)</li>
          <li><strong>Hospedagem da aplicação:</strong> Render Services, Inc. (render.com)</li>
          <li><strong>Banco de dados:</strong> Neon (neon.tech)</li>
        </ul>` },
      ],
    },
  ]
}
