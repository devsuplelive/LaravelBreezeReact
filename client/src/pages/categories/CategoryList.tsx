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
import AppLayout from '@/components/layouts/AppLayout';

type Category = {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

const CategoryList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [, setLocation] = useLocation();

  // Dados estáticos para demonstração
  const categories: Category[] = [
    {
      id: 1,
      name: "Eletrônicos",
      description: "Produtos eletrônicos como smartphones, tablets e laptops",
      created_at: "2023-05-10T10:00:00",
      updated_at: "2023-05-10T10:00:00"
    },
    {
      id: 2,
      name: "Roupas",
      description: "Vestimentas masculinas e femininas",
      created_at: "2023-05-15T14:30:00",
      updated_at: "2023-05-15T14:30:00"
    },
    {
      id: 3,
      name: "Calçados",
      description: "Sapatos, tênis, sandálias e botas",
      created_at: "2023-05-20T09:15:00",
      updated_at: "2023-05-20T09:15:00"
    },
    {
      id: 4,
      name: "Acessórios",
      description: "Relógios, bolsas, cintos e joias",
      created_at: "2023-05-25T11:20:00",
      updated_at: "2023-05-25T11:20:00"
    }
  ];

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (id: number) => {
    setLocation(`/categories/${id}`);
  };

  const handleEdit = (id: number) => {
    setLocation(`/categories/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      // Lógica para excluir a categoria seria implementada aqui
      console.log(`Excluindo categoria ${id}`);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Categorias</CardTitle>
              <CardDescription>
                Gerencie as categorias de produtos da sua empresa.
              </CardDescription>
            </div>
            <Button onClick={() => setLocation('/categories/new')}>
              <FiPlus className="mr-2" /> Nova Categoria
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <div className="relative w-full max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou descrição..."
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
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data de criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleView(category.id)}
                            >
                              <FiEye />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(category.id)}
                            >
                              <FiEdit />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(category.id)}
                            >
                              <FiTrash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        Nenhuma categoria encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CategoryList;