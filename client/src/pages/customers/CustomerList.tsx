import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  created_at: string;
  updated_at: string;
};

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [, setLocation] = useLocation();

  // Dados estáticos para demonstração
  const customers: Customer[] = [
    {
      id: 1,
      name: "João Silva",
      email: "joao@example.com",
      phone: "(11) 99999-8888",
      document: "123.456.789-00",
      address: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      zip_code: "01234-567",
      created_at: "2023-05-10T10:00:00",
      updated_at: "2023-05-10T10:00:00"
    },
    {
      id: 2,
      name: "Maria Oliveira",
      email: "maria@example.com",
      phone: "(11) 97777-6666",
      document: "987.654.321-00",
      address: "Av. Paulista, 1000",
      city: "São Paulo",
      state: "SP",
      zip_code: "01310-100",
      created_at: "2023-05-15T14:30:00",
      updated_at: "2023-05-15T14:30:00"
    },
    {
      id: 3,
      name: "Carlos Santos",
      email: "carlos@example.com",
      phone: "(21) 98888-7777",
      document: "111.222.333-44",
      address: "Rua do Comércio, 45",
      city: "Rio de Janeiro",
      state: "RJ",
      zip_code: "20010-020",
      created_at: "2023-05-20T09:15:00",
      updated_at: "2023-05-20T09:15:00"
    }
  ];

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleView = (id: number) => {
    setLocation(`/customers/${id}`);
  };

  const handleEdit = (id: number) => {
    setLocation(`/customers/${id}`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      // Lógica para excluir o cliente seria implementada aqui
      console.log(`Excluindo cliente ${id}`);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              Gerencie os clientes da sua empresa.
            </CardDescription>
          </div>
          <Button onClick={() => setLocation('/customers/new')}>
            <FiPlus className="mr-2" /> Novo Cliente
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative w-full max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
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
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.city}</TableCell>
                      <TableCell>{customer.state}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleView(customer.id)}
                          >
                            <FiEye />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(customer.id)}
                          >
                            <FiEdit />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(customer.id)}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Nenhum cliente encontrado.
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

export default CustomerList;