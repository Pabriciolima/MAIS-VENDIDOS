# Mônaco — Estoque consolidado

Importação de Excel, ranking por quantidade contábil e distribuição por filial.

## Abrir no VS Code

1. Extraia o ZIP e abra a pasta no VS Code.
2. Instale o Node.js caso ainda não tenha.
3. No terminal execute `npm run dev`. Não é necessário instalar dependências.
4. Abra http://localhost:3000.

Também funciona com a extensão Live Server, abrindo public/index.html por um servidor HTTP. Não abra por file://, pois a importação usa Web Worker.

## Arquivos

- public/index.html: tela
- public/style.css: aparência
- public/app.js: interface, relatórios e exportação Excel
- public/parser.js: leitura e consolidação em segundo plano
- public/xlsx.full.min.js: SheetJS 0.20.3, incluído localmente
- server.cjs: servidor local sem dependências
- vercel.json: configuração de publicação

## Publicar na Vercel

Importe o repositório GitHub na Vercel, selecione Framework Preset: Other e Output Directory: public. Não há build ou variáveis de ambiente.

## Regra de consolidação

O cabeçalho é reconhecido automaticamente em cada aba. Os itens são agrupados por ITEM_ESTOQUE_PUB e somam QTD_CONTABIL. A filial é identificada por EMPRESA + REVENDA, com NOME_EMPRESA para exibição. Linhas sem código ou filial são contadas como desconsideradas. Quantidades inválidas interrompem a importação. Decimais, zeros à esquerda em códigos de texto e saldos negativos são preservados. A soma geral pode reunir unidades de medida diferentes.

O arquivo é lido no navegador, não é enviado a um servidor nem mantido depois de recarregar. PDF: botão PDF / Imprimir e opção Salvar como PDF. Excel: abas Ranking e Por filial. Os relatórios respeitam busca e quantidade selecionada, não a paginação de tela.

## Biblioteca

SheetJS Community Edition 0.20.3 — https://sheetjs.com/ — licença Apache-2.0.

## Classes C e D e valor de estoque

O filtro Classe ABC permite Todas as classes, Somente C, Somente D ou C e D. O filtro é aplicado a cada registro antes da soma: se um mesmo código for A em uma filial e C em outra, Somente C inclui apenas o saldo e o valor das linhas C. O ranking e os indicadores são recalculados. O valor é a soma de VAL_ESTOQUE, sem multiplicar pelo saldo novamente. Tela, Excel e PDF respeitam a seleção e mostram valores por filial e por item.
