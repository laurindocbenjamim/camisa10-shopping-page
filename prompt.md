Atua como um programador Full-stack. Preciso que reestrutures o fluxo de compra:
Botão: Renomeia 'Finalizar' para 'Checkout'.
Página 1 (Checkout): Tabela/Lista interativa para gerir quantidades e remover produtos. Implementa lógica de cupão de desconto e botões de navegação (Continuar/Voltar).
Página 2 (Envio): Formulário completo para recolha de dados do cliente (identidade, contacto e morada).
Estética: Adiciona uma secção de 'Produtos Recomendados' com cards animados (shadows, zoom on hover). Usa uma paleta de cores moderna e tipografia clara.

Implementa o fluxo de checkout integrando-o com um backend.
Configuração: Define a variável de ambiente REACT_APP_API_URL (ou similar) como http://localhost:8000/api/v1/.
Página de Checkout: Ao carregar, o formulário de edição de itens deve permitir atualizar e remover produtos. Ao clicar em 'Continuar', os dados atualizados do carrinho devem ser enviados para o endpoint POST /carrinho.
Página de Envio: Após o sucesso do carrinho, exibe o formulário de dados do cliente (Nome, Email, Telefone, Morada). O botão 'Finalizar Pedido' deve disparar um POST /enviar com o payload completo.
UI/UX: Mantém a secção de 'Mais Vendidos' com cards animados e design moderno em ambas as páginas.
