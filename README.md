# Movvia

Aplicação React/Vite para consulta e solicitação de recargas pré-pagas. Identificação informada pelo responsável: **MOOVNG SERVICOS E TECNOLOGIA LTDA**, CNPJ **47.952.562/0001-07**.

## Rotas

- `/` — página inicial;
- `/recarga-algar`, `/recarga-claro`, `/recarga-correios`, `/recarga-surf`, `/recarga-tim`, `/recarga-vivo` (também com `.html`) — seleção de número e valor;
- `/pagamento` (também `/pagamento.html`) — resumo e Pix quando a integração estiver configurada;
- `/termos-de-uso.html` e `/politica-de-privacidade.html` — páginas públicas de informações legais.

As páginas antigas executáveis em `public/legacy/` foram removidas do pacote publicado. O conteúdo legado continha outra identificação empresarial e rastreadores não usados pelo site atual.

## Desenvolvimento e build

```bash
npm ci
npm run build
npm run dev
```

## Configuração do gateway

Configure `BLACKCAT_API_KEY` somente no painel seguro do ambiente de hospedagem. `BLACKCAT_API_URL` é opcional e, por segurança, deve permanecer no host oficial Blackcat habilitado no código. A rota Pix fica ativa quando `BLACKCAT_API_KEY` está configurada. O checkout coleta nome, e-mail e CPF do pagador porque esses dados fazem parte do contrato atual de criação de venda da Blackcat. A chave nunca é enviada ao navegador.

**Antes de receber pagamentos reais, confirme com o gateway que o payload atual atende ao contrato vigente.** Este site não coleta identidade do pagador nem inventa nome/e-mail/documento. Se a Blackcat exigir dados de pagador que ainda não estejam configurados, implemente a coleta mínima e revise a política de privacidade. Ative também rate limiting/WAF para `/api/pix`; não há limitador distribuído dentro do código.

## Revisão de segurança

Consulte [`SECURITY.md`](./SECURITY.md) para controles aplicados, verificações obrigatórias antes do lançamento e procedimento inicial de resposta a incidente. Aprovação ou endosso do Google, das operadoras ou do gateway não pode ser garantido por código.

## Deploy na Vercel

1. Importe o repositório no painel da Vercel.
2. Use a raiz do projeto (`prepagodigital-main`) como Root Directory se o repositório contiver a pasta pai.
3. Deixe o framework como Vite e o build como `npm run build`.
4. Em **Settings → Environment Variables**, cadastre `BLACKCAT_API_KEY` com a chave de produção da sua conta Blackcat. Mantenha `BLACKCAT_API_URL` no valor oficial mostrado no `.env.example`.
5. Faça um novo deploy e teste uma cobrança de baixo valor antes de divulgar o site.

A integração usa `POST /api/pix` no servidor da Vercel para criar a venda e `GET /api/status` para consultar o status. A documentação atual da Blackcat informa que os valores são enviados em centavos, que `customer` é obrigatório e que o status pode ser `PENDING`, `PAID`, `CANCELLED` ou `REFUNDED`.
