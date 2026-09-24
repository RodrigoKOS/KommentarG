# KommentarG

API estilo Elfsight para buscar comentários do Google Meu Negócio e mostrar no site do cliente.

Pense assim: pega do Google -> deixa bonito -> cola no site.

## O que já funciona (modo teste)
- `/api/health` diz se está no ar
- `/api/reviews` devolve 3 comentários falsos para testar o visual
- `/` página simples que mostra esses comentários
- `/widget.js` código para colar em outros sites (teste)

## Como ver na sua máquina (bem simples)
1. Instale Node (você já tem)
2. Nesta pasta rode: `node api-dev.js`
3. Abra `http://localhost:3000` no navegador

## Como colocar na Vercel (para ver na internet)
1. O código já está no GitHub em `RodrigoKOS/KommentarG`
2. Entre em https://vercel.com/ -> Add New -> Project -> Import do GitHub
3. Escolha `KommentarG`, deixe tudo padrão, clique Deploy
4. Vai ganhar um endereço tipo `https://kommentarg.vercel.app`
5. Teste: abra `SEU-ENDERECO/api/reviews` e `SEU-ENDERECO/api/health`

Nada de configurar por enquanto. Só importar e dar Deploy.

## Passo 1 do Google (você vai fazer no navegador)
Para sair do modo falso e pegar comentários reais, precisa:
1. Criar projeto em https://console.cloud.google.com/
2. Ativar "Google Business Profile API" e "My Business Account Management API"
3. Criar credencial OAuth (tipo Web, com acesso externo em teste)
4. Anotar: CLIENT_ID, CLIENT_SECRET, e depois gerar REFRESH_TOKEN
5. Descobrir ACCOUNT_ID e LOCATION_ID da empresa (a gente te ajuda)
6. Colar esses 5 valores na Vercel em Settings -> Environment Variables (e no arquivo `.env` local, copiado de `.env.example`)

Enquanto isso não for feito, o site mostra dados falsos de propósito, só para testar o visual.
