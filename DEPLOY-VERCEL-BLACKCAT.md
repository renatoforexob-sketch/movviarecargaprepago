# Deploy — Vercel + Blackcat

## 1. Publicar na Vercel

- Suba esta pasta para um repositório GitHub.
- Na Vercel, importe o repositório.
- Se o repositório tiver `prepagodigital-main/` como subpasta, selecione essa pasta em **Root Directory**.
- Framework: Vite.
- Build Command: `npm run build`.
- Output Directory: `dist`.

## 2. Configurar Blackcat

No projeto da Vercel, abra **Settings → Environment Variables** e adicione:

`BLACKCAT_API_KEY` = sua chave de produção da Blackcat

Opcionalmente, mantenha:

`BLACKCAT_API_URL` = `https://api.blackcatoficial.com/api/sales/create-sale`

Não coloque a API Key no frontend, no ZIP ou no GitHub.

## 3. Fluxo

1. Usuário escolhe a operadora.
2. Informa celular, nome, e-mail e CPF.
3. Escolhe o valor.
4. O navegador chama `/api/pix`.
5. A função da Vercel chama a Blackcat no servidor.
6. O QR Code Pix e o copia-e-cola são exibidos.
7. O site consulta `/api/status` automaticamente até a Blackcat informar o resultado.

## 4. Importante

A criação de PIX usa o endpoint documentado `/api/sales/create-sale`, com `amount` em centavos, `items`, `customer` e `paymentMethod: pix`. A chave da sua conta é necessária para criar cobranças reais.

A criação/confirmação do pagamento Pix não deve ser confundida com a efetivação da recarga na rede da operadora. Este projeto precisa de uma integração adicional com um fornecedor de recarga caso a sua conta Blackcat não execute a recarga da linha após o pagamento.

Antes de divulgar, faça uma cobrança real de teste com valor baixo e confirme no painel Blackcat se a venda aparece como `PAID`.
