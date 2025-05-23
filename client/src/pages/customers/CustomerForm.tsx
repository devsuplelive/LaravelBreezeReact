import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/components/layouts/AppLayout';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

// Esquema de validação usando Zod
const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  document: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

// Dados mockados para demonstração
const mockCustomers = [
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
  }
];

const CustomerForm = () => {
  const params = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(params.id);
  const customerId = params.id ? parseInt(params.id) : null;
  
  // Inicializa o formulário com react-hook-form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      document: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
    },
  });

  // Carrega os dados do cliente se estiver editando
  useEffect(() => {
    if (isEditing && customerId) {
      // Simulação de carregamento de dados
      const customer = mockCustomers.find(c => c.id === customerId);
      
      if (customer) {
        form.reset({
          name: customer.name,
          email: customer.email,
          phone: customer.phone || '',
          document: customer.document || '',
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || '',
          zip_code: customer.zip_code || '',
        });
      }
    }
  }, [isEditing, customerId, form]);

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      // Aqui seria feita a chamada à API para salvar os dados
      console.log('Dados do cliente para salvar:', data);
      
      toast({
        title: isEditing ? "Cliente atualizado" : "Cliente criado",
        description: `${data.name} foi ${isEditing ? 'atualizado' : 'adicionado'} com sucesso.`,
      });
      
      navigate('/customers');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar o cliente. Tente novamente.",
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('/customers')}>
                <FiArrowLeft />
              </Button>
              <CardTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
            </div>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, número, complemento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="UF" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/customers')}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <FiSave className="mr-2" />
                  Salvar
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CustomerForm;