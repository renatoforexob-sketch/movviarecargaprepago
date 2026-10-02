# Segurança e preparação operacional — Movvia

## O que foi endurecido neste pacote

- Identificação da responsável pela plataforma padronizada como MOOVNG SERVICOS E TECNOLOGIA LTDA, CNPJ 47.952.562/0001-07, com os contatos e endereço informados pelo responsável.
- Páginas antigas executáveis removidas do diretório público: continham dados empresariais diferentes, tags de anúncios e Firebase Analytics, além de promessas e fluxos redundantes.
- Depoimentos demonstrativos, bônus e selos de popularidade sem comprovação removidos da aplicação ativa.
- API Pix aceita somente operadoras e valores definidos no site, valida telefone, exige JSON e mesma origem quando há cabeçalho Origin, limita tempo da chamada ao gateway, não aceita nome/preço/metadados livres e não devolve erros internos do provedor.
- Chave do gateway continua exclusivamente no ambiente do servidor. Respostas de API não são armazenadas em cache.
- Cabeçalhos HTTP de segurança e CSP configurados em `vercel.json`.
- Termos e aviso de privacidade publicados como páginas legais do serviço.

## Bloqueios antes de receber pagamentos reais

1. **Confirme com a Blackcat a especificação vigente de `create-sale`.** A rota Pix permanece ativa quando a chave está configurada. O payload envia valor, item, operadora e telefone destinatário em metadados; dados de cliente só são enviados se todos os campos reais `BLACKCAT_CLIENT_*` estiverem configurados. Se o gateway exigir identidade do pagador que ainda não esteja disponível, implemente a coleta mínima correta e atualize a Política de Privacidade. Nunca preencher com identidade fictícia.
2. Configure `BLACKCAT_API_KEY` apenas no painel de ambiente da hospedagem, nunca no código, ZIP ou repositório. Use chave de produção somente depois de testes homologados; revogue qualquer segredo previamente exposto.
3. Faça testes de ponta a ponta com transação de baixo valor, confirme expiração, estorno/reembolso, recarga efetiva, tratamento de falha e quem é o recebedor do Pix. O QR Code emitido não é prova de recarga concluída.
4. Ative proteção de abuso/rate limit no WAF/firewall do provedor (por exemplo, limitar `/api/pix` por IP e controlar picos). Não há armazenamento compartilhado de rate limit neste projeto; um contador em memória de função serverless não daria proteção consistente.
5. Valide as ofertas e o direito de uso de cada marca/logo com as operadoras. Só publique valores, bônus, validade ou prazo de processamento quando houver fonte atual e condições visíveis. O site não declara afiliação nem aprovação das operadoras.
6. Mantenha os Termos e a Política de Privacidade alinhados às configurações reais de hospedagem, pagamento, retenção e atendimento, e revise-os sempre que esses fluxos mudarem.
7. Antes de campanhas do Google, mantenha razão social/CNPJ/endereço/contato idênticos no site, conta de anúncios e cadastro do gateway. Não use cloaking, redirecionamentos para contornar revisão, conteúdo diferente por origem do tráfego ou depoimentos/benefícios inventados. Um pacote de código não garante aprovação ou evita desativação por políticas externas.

## Resposta inicial a incidente

1. **Conter:** desabilite o checkout ou a rota/API afetada na hospedagem. Não faça novo deploy de emergência sem entender o impacto.
2. **Proteger credenciais:** revogue e substitua a chave do gateway e qualquer token/credencial afetado. Faça isso no painel oficial do fornecedor. Nunca envie segredos por e-mail ou chat.
3. **Preservar evidências:** anote horários, URLs, IDs de transação e logs relevantes; restrinja acesso às cópias e não apague evidências antes da investigação.
4. **Acionar fornecedores:** contate hospedagem e gateway por canais oficiais, informe o incidente e peça análise de transações e contenção de cobranças indevidas.
5. **Avaliar impacto e comunicação:** determine quais dados e pessoas foram afetados. Consulte jurídico/encarregado para avaliar notificações a titulares e à ANPD dentro dos prazos aplicáveis.
6. **Recuperar e aprender:** corrija a causa, teste em homologação, restaure somente versão conhecida como íntegra e documente ações, evidências e prevenção.

## Artefatos antigos

A distribuição original continha páginas legadas com credenciais públicas de configuração Firebase, IDs de rastreamento e coleta de eventos/identificadores de campanha. As páginas foram removidas do diretório de publicação, mas isso não revoga material já publicado em outro domínio, cache, backup ou histórico Git. Revise as regras e os dados do Firebase antigo; restrinja chaves por API/referrer quando aplicável, corrija regras do banco, elimine dados indevidos conforme orientação aplicável e encerre serviços não utilizados. IDs de medição não são senhas, mas seu uso e eventos devem ser revistos.
