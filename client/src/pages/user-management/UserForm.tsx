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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

// Esquema de validação usando Zod
const userSchema = z.object({
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  active: z.boolean().default(true),
  roleIds: z.array(z.string()).optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

const UserForm: React.FC = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const isEditing = Boolean(params.id);
  const userId = params.id ? parseInt(params.id) : null;
  
  // Fetch available roles
  const { data: roles } = useQuery({
    queryKey: ['/api/roles'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/roles');
        if (!res.ok) throw new Error('Failed to fetch roles');
        return res.json();
      } catch (error) {
        console.error('Error fetching roles:', error);
        return [];
      }
    },
    enabled: true,
  });

  // Inicializa o formulário com react-hook-form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      active: true,
      roleIds: [],
    },
  });

  // Carrega os dados do usuário se estiver editando
  useEffect(() => {
    if (isEditing && userId) {
      // Buscar dados do usuário para edição
      const fetchUser = async () => {
        try {
          const res = await fetch(`/api/users/${userId}`);
          if (!res.ok) throw new Error('Failed to fetch user');
          const userData = await res.json();
          
          form.reset({
            username: userData.username,
            email: userData.email,
            password: '', // Não preencher senha por segurança
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            active: userData.active,
            roleIds: userData.roles?.map((role: any) => role.id.toString()) || [],
          });
        } catch (error) {
          console.error('Error fetching user:', error);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar os dados do usuário.",
          });
        }
      };
      
      fetchUser();
    }
  }, [isEditing, userId, form]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      // Aqui seria feita a chamada à API para salvar os dados
      const endpoint = isEditing ? `/api/users/${userId}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';
      
      // Se estiver editando e a senha estiver vazia, remova-a do payload
      if (isEditing && !data.password) {
        const { password, ...dataWithoutPassword } = data;
        data = dataWithoutPassword as UserFormValues;
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar usuário');
      }
      
      toast({
        title: isEditing ? "Usuário atualizado" : "Usuário criado",
        description: `${data.username} foi ${isEditing ? 'atualizado' : 'criado'} com sucesso.`,
      });
      
      setLocation('/users');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar o usuário. Tente novamente.",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setLocation('/users')}>
              <FiArrowLeft />
            </Button>
            <CardTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Usuário</FormLabel>
                      <FormControl>
                        <Input placeholder="usuário" {...field} />
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isEditing ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha'}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input placeholder="Sobrenome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {roles && roles.length > 0 && (
                  <FormField
                    control={form.control}
                    name="roleIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Papéis</FormLabel>
                        <Select
                          defaultValue={field.value?.[0]}
                          onValueChange={(value) => field.onChange([value])}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um papel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role: any) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Ativo</FormLabel>
                        <FormDescription>
                          Marque esta opção para ativar a conta do usuário.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/users')}
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
  );
};

export default UserForm;