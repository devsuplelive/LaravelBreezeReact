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
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import AppLayout from '@/components/layouts/AppLayout';

type Brand = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

const BrandList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [, setLocation] = useLocation();

  // Dados estáticos para demonstração
  const brands: Brand[] = [
    {
      id: 1,
      name: "Nike",
      created_at: "2023-05-10T10:00:00",
      updated_at: "2023-05-10T10:00:00"
    },
    {
      id: 2,
      name: "Adidas",
      created_at: "2023-05-15T14:30:00",
      updated_at: "2023-05-15T14:30:00"
    },
    {
      id: 3,
      name: "Puma",
      created_at: "2023-05-20T09:15:00",
      updated_at: "2023-05-20T09:15:00"
    },
    {
      id: 4,
      name: "Apple",
      created_at: "2023-05-25T11:20:00",
      updated_at: "2023-05-25T11:20:00"
    },
    {
      id: 5,
      name: "Samsung",
      created_at: "2023-05-30T16:45:00",
      updated_at: "2023-05-30T16:45:00"
    }
  ];

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id: number) => {
    setLocation(`/brands/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta marca?')) {
      // Lógica para excluir a marca seria implementada aqui
      console.log(`Excluindo marca ${id}`);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Marcas</CardTitle>
              <CardDescription>
                Gerencie as marcas dos produtos da sua empresa.
              </CardDescription>
            </div>
            <Button onClick={() => setLocation('/brands/new')}>
              <FiPlus className="mr-2" /> Nova Marca
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <div className="relative w-full max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome..."
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
                    <TableHead>Data de criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBrands.length > 0 ? (
                    filteredBrands.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell className="font-medium">{brand.name}</TableCell>
                        <TableCell>{new Date(brand.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(brand.id)}
                            >
                              <FiEdit />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(brand.id)}
                            >
                              <FiTrash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6">
                        Nenhuma marca encontrada.
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

export default BrandList;