# Guia para Testar os Formulários do Sistema

Este guia fornece instruções detalhadas para testar cada formulário do sistema e garantir que os dados sejam salvos corretamente no banco de dados antes da migração para MySQL no CloudPanel.

## Preparação para Testes

Antes de iniciar os testes, certifique-se de que:

1. O sistema está rodando localmente
2. Você tem acesso ao banco de dados para verificação
3. Você está logado com uma conta que tem permissões adequadas (admin/admin123)

## 1. Teste do Formulário de Produtos

### Adicionar Produto
1. Navegue até: `Menu lateral > Produtos > Adicionar Produto`
2. Preencha o formulário com:
   - Nome: "Monitor LED 24 polegadas"
   - SKU: "MONITOR-24-LED"
   - Preço: 599.99
   - Estoque: 25
   - Selecione uma marca (se disponível)
   - Selecione uma categoria (se disponível)
   - Descrição: "Monitor LED de 24 polegadas, resolução Full HD"
3. Clique em "Salvar"
4. Verifique se o produto aparece na lista de produtos

### Editar Produto
1. Na lista de produtos, encontre o produto criado e clique em "Editar"
2. Altere o estoque para 30
3. Clique em "Salvar"
4. Verifique se a alteração foi refletida na lista

### Verificar no Banco de Dados
```sql
SELECT * FROM products WHERE sku = 'MONITOR-24-LED';
```

## 2. Teste do Formulário de Clientes

### Adicionar Cliente
1. Navegue até: `Menu lateral > Clientes > Adicionar Cliente`
2. Preencha o formulário com:
   - Nome: "João Silva"
   - Email: "joao.silva@exemplo.com"
   - Telefone: "(11) 98765-4321"
   - Documento: "123.456.789-00"
   - Endereço: "Rua das Flores, 123"
   - Cidade: "São Paulo"
   - Estado: "SP"
   - CEP: "01234-567"
3. Clique em "Salvar"
4. Verifique se o cliente aparece na lista de clientes

### Editar Cliente
1. Na lista de clientes, encontre o cliente criado e clique em "Editar"
2. Altere o telefone para "(11) 91234-5678"
3. Clique em "Salvar"
4. Verifique se a alteração foi refletida na lista

### Verificar no Banco de Dados
```sql
SELECT * FROM customers WHERE email = 'joao.silva@exemplo.com';
```

## 3. Teste do Formulário de Marcas

### Adicionar Marca
1. Navegue até: `Menu lateral > Marcas > Adicionar Marca`
2. Preencha o formulário com:
   - Nome: "TechBrand"
3. Clique em "Salvar"
4. Verifique se a marca aparece na lista de marcas

### Verificar no Banco de Dados
```sql
SELECT * FROM brands WHERE name = 'TechBrand';
```

## 4. Teste do Formulário de Categorias

### Adicionar Categoria
1. Navegue até: `Menu lateral > Categorias > Adicionar Categoria`
2. Preencha o formulário com:
   - Nome: "Informática"
   - Descrição: "Produtos de informática e tecnologia"
3. Clique em "Salvar"
4. Verifique se a categoria aparece na lista de categorias

### Verificar no Banco de Dados
```sql
SELECT * FROM categories WHERE name = 'Informática';
```

## 5. Teste do Formulário de Pedidos

### Adicionar Pedido
1. Navegue até: `Menu lateral > Pedidos > Adicionar Pedido`
2. Preencha o formulário com:
   - Cliente: Selecione o cliente criado anteriormente
   - Número do Pedido: "PED-001"
   - Status: "Pendente"
   - Valor Total: 599.99
   - Desconto: 0
   - Custo de Envio: 0
   - Método de Pagamento: "Cartão de Crédito"
   - Notas: "Pedido de teste"
3. Adicione um item ao pedido:
   - Produto: Selecione o produto criado anteriormente
   - Quantidade: 1
   - Preço: 599.99
4. Clique em "Salvar"
5. Verifique se o pedido aparece na lista de pedidos

### Verificar no Banco de Dados
```sql
SELECT * FROM orders WHERE order_number = 'PED-001';
SELECT * FROM order_items WHERE order_id = (SELECT id FROM orders WHERE order_number = 'PED-001');
```

## 6. Teste do Formulário de Pagamentos

### Adicionar Pagamento
1. Navegue até: `Menu lateral > Pagamentos > Adicionar Pagamento`
2. Preencha o formulário com:
   - Pedido: Selecione o pedido criado anteriormente
   - Método de Pagamento: "Cartão de Crédito"
   - Valor: 599.99
   - Código da Transação: "TRANS-001"
3. Clique em "Salvar"
4. Verifique se o pagamento aparece na lista de pagamentos

### Verificar no Banco de Dados
```sql
SELECT * FROM payments WHERE transaction_code = 'TRANS-001';
```

## 7. Teste do Formulário de Envios

### Adicionar Envio
1. Navegue até: `Menu lateral > Envios > Adicionar Envio`
2. Preencha o formulário com:
   - Pedido: Selecione o pedido criado anteriormente
   - Transportadora: "Transportadora Rápida"
   - Código de Rastreamento: "TRACK-001"
   - Status de Envio: "Em Trânsito"
3. Clique em "Salvar"
4. Verifique se o envio aparece na lista de envios

### Verificar no Banco de Dados
```sql
SELECT * FROM shipping WHERE tracking_code = 'TRACK-001';
```

## 8. Teste do Formulário de Usuários

### Adicionar Usuário
1. Navegue até: `Menu lateral > Gerenciamento de Usuários > Adicionar Usuário`
2. Preencha o formulário com:
   - Nome de Usuário: "novousuario"
   - Email: "novo.usuario@exemplo.com"
   - Senha: "Senha@123"
   - Nome: "Novo"
   - Sobrenome: "Usuário"
   - Ativo: Sim
   - Funções: Selecione pelo menos uma função
3. Clique em "Salvar"
4. Verifique se o usuário aparece na lista de usuários

### Verificar no Banco de Dados
```sql
SELECT * FROM users WHERE username = 'novousuario';
SELECT * FROM user_roles WHERE user_id = (SELECT id FROM users WHERE username = 'novousuario');
```

## 9. Teste do Formulário de Funções (Roles)

### Adicionar Função
1. Navegue até: `Menu lateral > Gerenciamento de Usuários > Funções > Adicionar Função`
2. Preencha o formulário com:
   - Nome: "Supervisor"
   - Descrição: "Função de supervisor com acesso limitado"
   - Permissões: Selecione algumas permissões
3. Clique em "Salvar"
4. Verifique se a função aparece na lista de funções

### Verificar no Banco de Dados
```sql
SELECT * FROM roles WHERE name = 'Supervisor';
SELECT * FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = 'Supervisor');
```

## Resumo de Verificação

Após completar todos os testes acima, você deve ter confirmado que:

1. ✅ Todos os formulários de entrada funcionam corretamente
2. ✅ Os dados são exibidos corretamente nas listas
3. ✅ Os dados são armazenados corretamente no banco de dados
4. ✅ As relações entre entidades são mantidas (ex: produtos em pedidos, usuários e funções)

Se todos os testes forem bem-sucedidos, seu sistema está pronto para a migração para MySQL no CloudPanel. Consulte o guia de implantação (DEPLOY_MYSQL_GUIDE.md) para os próximos passos.

## Solução de Problemas

### Se um formulário não salvar:

1. Verifique o console do navegador (F12) para erros
2. Verifique a resposta da API
3. Verifique os logs do servidor
4. Assegure-se de que todos os campos obrigatórios estão preenchidos
5. Certifique-se de que os valores únicos (como SKU, email) não estão duplicados

### Se os dados não aparecerem na lista:

1. Verifique se a consulta da API está sendo chamada
2. Verifique se a resposta contém os dados esperados
3. Verifique se há erros no console
4. Tente atualizar a página

### Se relacionamentos não funcionarem:

1. Verifique se as chaves estrangeiras estão sendo passadas corretamente
2. Certifique-se de que os IDs referenciados existem
3. Verifique a configuração de relacionamentos no schema