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

## Ranking financeiro

Por padrão, os itens são classificados pelo maior valor financeiro, somando VAL_ESTOQUE em todas as filiais elegíveis no filtro ABC. A distribuição por filial também ordena por valor. O seletor Ordenar por mantém a opção Maior quantidade. Excel e PDF seguem a ordem escolhida.

## Corte obrigatório da última compra

Todos os registros, independentemente da curva ABC, devem ter DTA_ULT_COMPRA até 31/12/2025 (inclusive). O corte é aplicado antes da consolidação e do ranking. Registros posteriores ou sem data válida não entram nas quantidades ou valores e são contados separadamente na tela. Datas ISO, brasileiras e datas numéricas do Excel (inclusive sistema 1904) são reconhecidas. O filtro C/D continua disponível sobre os registros elegíveis.

## Valor unitário por filial

O valor unitário médio é VAL_ESTOQUE consolidado da filial dividido pela sua QTD_CONTABIL consolidada, após filtros. Ele aparece entre quantidade e valor total da filial e nos relatórios. Quantidade zero mostra — na tela/PDF e célula vazia no Excel.

## Filtro geográfico

Selecione vários estados pelo mapa ou pelos botões de UF; os botões de região adicionam/removem seus estados. Todo o Brasil limpa a seleção. Sem estados marcados, todas as filiais entram. A lista permite restringir a análise a filiais específicas. Os filtros geográficos e ABC são aplicados antes da consolidação, inclusive nos indicadores, Excel e PDF.

A UF é reconhecida pelo nome da cidade, estado ou sigla presente no nome da filial. São reconhecidas as cidades do Grupo Mônaco: Belém, Ananindeua, São Luís, Bacabal, Teresina, Uruçuí, Macapá, Cuiabá, Sinop, Rondonópolis, Água Boa, Porto Velho, Ji-Paraná e Vilhena. Filiais sem localização identificável continuam incluídas em Todo o Brasil e podem ser associadas manualmente a uma UF no painel. Associações duram enquanto a página permanecer aberta. O mapa é local, sem chamadas externas, com limites geográficos simplificados da malha Click That ’Hood.

### Pontos de localização

Pontos vermelhos marcam as cidades das filiais que atendem à seleção geográfica atual. Selecionar uma filial restringe os pontos a ela; uma região ou UF mostra as cidades elegíveis. Mouse ou foco pelo teclado exibe o nome da cidade. As coordenadas representam a sede municipal, não o endereço da unidade. Filiais sem cidade reconhecida permanecem no filtro, com aviso de ausência de coordenadas. Fonte: https://github.com/kelvins/municipios-brasileiros/blob/main/csv/municipios.csv.
