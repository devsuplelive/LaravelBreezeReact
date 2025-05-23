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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

// Esquema de validação usando Zod
const brandSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
});

type BrandFormValues = z.infer<typeof brandSchema>;

// Dados mockados para demonstração
const mockBrands = [
  {
    id: 1,
    name: "Nike",
  },
  {
    id: 2,
    name: "Adidas",
  },
  {
    id: 3,
    name: "Puma",
  }
];

const BrandForm = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const isEditing = Boolean(params.id);
  const brandId = params.id ? parseInt(params.id) : null;
  
  // Inicializa o formulário com react-hook-form
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
    },
  });

  // Carrega os dados da marca se estiver editando
  useEffect(() => {
    if (isEditing && brandId) {
      // Simulação de carregamento de dados
      const brand = mockBrands.find(b => b.id === brandId);
      
      if (brand) {
        form.reset({
          name: brand.name,
        });
      }
    }
  }, [isEditing, brandId, form]);

  const onSubmit = async (data: BrandFormValues) => {
    try {
      // Aqui seria feita a chamada à API para salvar os dados
      console.log('Dados da marca para salvar:', data);
      
      toast({
        title: isEditing ? "Marca atualizada" : "Marca criada",
        description: `${data.name} foi ${isEditing ? 'atualizada' : 'adicionada'} com sucesso.`,
      });
      
      setLocation('/brands');
    } catch (error) {
      console.error('Erro ao salvar marca:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar a marca. Tente novamente.",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setLocation('/brands')}>
              <FiArrowLeft />
            </Button>
            <CardTitle>{isEditing ? 'Editar Marca' : 'Nova Marca'}</CardTitle>
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
                      <Input placeholder="Nome da marca" {...field} />
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
                onClick={() => setLocation('/brands')}
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

export default BrandForm;