import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiEye } from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';

type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  brand_id: number;
  brand_name: string;
  category_id: number;
  category_name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [, setLocation] = useLocation();

  // Dados estáticos para demonstração
  const products: Product[] = [
    {
      id: 1,
      name: "iPhone 13 Pro",
      sku: "APPH-13PRO-256",
      price: 5999.00,
      stock: 25,
      brand_id: 4,
      brand_name: "Apple",
      category_id: 1,
      category_name: "Eletrônicos",
      description: "iPhone 13 Pro com 256GB de armazenamento",
      created_at: "2023-05-10T10:00:00",
      updated_at: "2023-05-10T10:00:00"
    },
    {
      id: 2,
      name: "Samsung Galaxy S22",
      sku: "SAMG-S22-128",
      price: 4499.00,
      stock: 18,
      brand_id: 5,
      brand_name: "Samsung",
      category_id: 1,
      category_name: "Eletrônicos",
      description: "Samsung Galaxy S22 com 128GB de armazenamento",
      created_at: "2023-05-15T14:30:00",
      updated_at: "2023-05-15T14:30:00"
    },
    {
      id: 3,
      name: "Tênis Nike Air Max",
      sku: "NK-AIRMAX-42",
      price: 799.00,
      stock: 30,
      brand_id: 1,
      brand_name: "Nike",
      category_id: 3,
      category_name: "Calçados",
      description: "Tênis Nike Air Max masculino, tamanho 42",
      created_at: "2023-05-20T09:15:00",
      updated_at: "2023-05-20T09:15:00"
    },
    {
      id: 4,
      name: "Camisa Adidas Originals",
      sku: "AD-ORIG-M",
      price: 299.00,
      stock: 45,
      brand_id: 2,
      brand_name: "Adidas",
      category_id: 2,
      category_name: "Roupas",
      description: "Camisa Adidas Originals, tamanho M",
      created_at: "2023-05-25T11:20:00",
      updated_at: "2023-05-25T11:20:00"
    }
  ];

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleView = (id: number) => {
    setLocation(`/products/${id}`);
  };

  const handleEdit = (id: number) => {
    setLocation(`/products/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      // Lógica para excluir o produto seria implementada aqui
      console.log(`Excluindo produto ${id}`);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>
              Gerencie os produtos da sua empresa.
            </CardDescription>
          </div>
          <Button onClick={() => setLocation('/products/new')}>
            <FiPlus className="mr-2" /> Novo Produto
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative w-full max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome, SKU, marca ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.brand_name}</TableCell>
                      <TableCell>{product.category_name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleView(product.id)}
                          >
                            <FiEye />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(product.id)}
                          >
                            <FiEdit />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductList;