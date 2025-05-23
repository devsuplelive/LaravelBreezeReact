import React, { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

// Esquema de validação usando Zod
const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

// Dados mockados para demonstração
const mockCategories = [
  {
    id: 1,
    name: "Eletrônicos",
    description: "Produtos eletrônicos como smartphones, tablets e laptops",
  },
  {
    id: 2,
    name: "Roupas",
    description: "Vestimentas masculinas e femininas",
  },
  {
    id: 3,
    name: "Calçados",
    description: "Sapatos, tênis, sandálias e botas",
  }
];

const CategoryForm = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const isEditing = Boolean(params.id);
  const categoryId = params.id ? parseInt(params.id) : null;
  
  // Inicializa o formulário com react-hook-form
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Carrega os dados da categoria se estiver editando
  useEffect(() => {
    if (isEditing && categoryId) {
      // Simulação de carregamento de dados
      const category = mockCategories.find(c => c.id === categoryId);
      
      if (category) {
        form.reset({
          name: category.name,
          description: category.description || '',
        });
      }
    }
  }, [isEditing, categoryId, form]);

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      // Aqui seria feita a chamada à API para salvar os dados
      console.log('Dados da categoria para salvar:', data);
      
      toast({
        title: isEditing ? "Categoria atualizada" : "Categoria criada",
        description: `${data.name} foi ${isEditing ? 'atualizada' : 'adicionada'} com sucesso.`,
      });
      
      setLocation('/categories');
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar a categoria. Tente novamente.",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setLocation('/categories')}>
              <FiArrowLeft />
            </Button>
            <CardTitle>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</CardTitle>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da categoria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva a categoria (opcional)" 
                        {...field} 
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/categories')}
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

export default CategoryForm;