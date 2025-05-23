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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';

// Esquema de validação usando Zod
const roleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  permissionIds: z.array(z.number()).optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

// Interface para uma permissão
interface Permission {
  id: number;
  name: string;
  description: string | null;
}

// Interface para um papel
interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: Permission[];
}

const RoleForm: React.FC = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const isEditing = Boolean(params.id);
  const roleId = params.id ? parseInt(params.id) : null;
  
  // Fetch available permissions
  const { data: permissionsData } = useQuery({
    queryKey: ['/api/permissions'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/permissions');
        if (!res.ok) throw new Error('Failed to fetch permissions');
        return res.json();
      } catch (error) {
        console.error('Error fetching permissions:', error);
        return { permissions: [] };
      }
    },
    enabled: true,
  });

  const permissions = permissionsData?.permissions || [];

  // Group permissions by category
  const permissionGroups = React.useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    
    permissions.forEach((permission: Permission) => {
      // Extract category from permission name (e.g., "create_users" -> "users")
      const nameParts = permission.name.split('_');
      let category = nameParts.length > 1 ? nameParts[1] : 'other';
      category = category.charAt(0).toUpperCase() + category.slice(1);
      
      if (!groups[category]) {
        groups[category] = [];
      }
      
      groups[category].push(permission);
    });
    
    return groups;
  }, [permissions]);

  // Inicializa o formulário com react-hook-form
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissionIds: [],
    },
  });

  // Fetch role data if editing
  const { data: roleData, isLoading: isLoadingRole } = useQuery({
    queryKey: ['/api/roles', roleId],
    queryFn: async () => {
      if (!isEditing || !roleId) return null;
      try {
        const res = await fetch(`/api/roles/${roleId}`);
        if (!res.ok) throw new Error('Failed to fetch role');
        return res.json();
      } catch (error) {
        console.error('Error fetching role:', error);
        return null;
      }
    },
    enabled: isEditing && !!roleId,
  });

  // Update form with role data when it's loaded
  useEffect(() => {
    if (isEditing && roleData) {
      form.reset({
        name: roleData.name,
        description: roleData.description || '',
        permissionIds: roleData.permissions?.map((p: Permission) => p.id) || [],
      });
    }
  }, [isEditing, roleData, form]);

  const onSubmit = async (data: RoleFormValues) => {
    try {
      // Aqui seria feita a chamada à API para salvar os dados
      const endpoint = isEditing ? `/api/roles/${roleId}` : '/api/roles';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar papel');
      }
      
      toast({
        title: isEditing ? "Papel atualizado" : "Papel criado",
        description: `${data.name} foi ${isEditing ? 'atualizado' : 'criado'} com sucesso.`,
      });
      
      setLocation('/roles');
    } catch (error) {
      console.error('Erro ao salvar papel:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar o papel. Tente novamente.",
      });
    }
  };

  // Handler for checkbox selection
  const handlePermissionChange = (permissionId: number, isChecked: boolean) => {
    const currentPermissions = form.getValues('permissionIds') || [];
    
    if (isChecked) {
      form.setValue('permissionIds', [...currentPermissions, permissionId]);
    } else {
      form.setValue('permissionIds', currentPermissions.filter(id => id !== permissionId));
    }
  };

  if (isEditing && isLoadingRole) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setLocation('/roles')}>
              <FiArrowLeft />
            </Button>
            <CardTitle>{isEditing ? 'Editar Papel' : 'Novo Papel'}</CardTitle>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do papel" {...field} />
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
                          placeholder="Descreva o papel e suas responsabilidades" 
                          {...field} 
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {Object.keys(permissionGroups).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Permissões</h3>
                  <FormField
                    control={form.control}
                    name="permissionIds"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(permissionGroups).map(([category, perms]) => (
                            <div key={category} className="border rounded-md p-4">
                              <h4 className="font-medium mb-2 text-primary">{category}</h4>
                              <div className="space-y-2">
                                {perms.map((permission: Permission) => {
                                  const permissionIds = form.getValues('permissionIds') || [];
                                  const isSelected = permissionIds.includes(permission.id);
                                  
                                  return (
                                    <div key={permission.id} className="flex items-start space-x-2">
                                      <Checkbox 
                                        id={`permission-${permission.id}`}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => 
                                          handlePermissionChange(permission.id, checked as boolean)
                                        }
                                      />
                                      <div className="grid gap-1.5">
                                        <label
                                          htmlFor={`permission-${permission.id}`}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          {permission.name.replace(/_/g, ' ')}
                                        </label>
                                        {permission.description && (
                                          <p className="text-xs text-muted-foreground">
                                            {permission.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/roles')}
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

export default RoleForm;