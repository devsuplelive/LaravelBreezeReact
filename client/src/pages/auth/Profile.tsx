import React, { useState, useEffect } from 'react';
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { FiSave, FiUser, FiMail, FiLock, FiActivity } from 'react-icons/fi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/AuthProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Esquema de validação para o perfil usando Zod
const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Email inválido'),
});

// Esquema de validação para a senha usando Zod
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme a nova senha'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile: React.FC = () => {
  const { user, updateUserInfo } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Inicializa o formulário de perfil com react-hook-form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  });

  // Inicializa o formulário de senha com react-hook-form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Carrega dados do perfil quando o componente montar
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });

      // Simular carregamento de último login
      setLastLogin('2023-05-20T10:30:15');

      // Simular carregamento de atividades recentes
      setRecentActivity([
        { id: 1, action: 'Login', timestamp: '2023-05-20T10:30:15', ip: '192.168.1.100' },
        { id: 2, action: 'Atualização de perfil', timestamp: '2023-05-19T15:45:22', ip: '192.168.1.100' },
        { id: 3, action: 'Alteração de senha', timestamp: '2023-05-15T09:12:08', ip: '192.168.1.102' },
      ]);
    }
  }, [user, profileForm]);

  // Função para lidar com envio do formulário de perfil
  const onSubmitProfile = async (data: ProfileFormValues) => {
    try {
      // Aqui seria feita a chamada à API para salvar os dados do perfil
      console.log('Dados do perfil para salvar:', data);
      
      // Atualizar dados do usuário no contexto
      if (user && updateUserInfo) {
        updateUserInfo({
          ...user,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        });
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Seus dados foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar o perfil. Tente novamente.",
      });
    }
  };

  // Função para lidar com envio do formulário de senha
  const onSubmitPassword = async (data: PasswordFormValues) => {
    try {
      // Aqui seria feita a chamada à API para alterar a senha
      console.log('Dados da senha para salvar:', data);
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      // Limpar campos após sucesso
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao alterar a senha. Tente novamente.",
      });
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Alert className="mb-6">
          <AlertTitle>Não autenticado</AlertTitle>
          <AlertDescription>
            Você precisa estar logado para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Obter as iniciais do usuário para o Avatar
  const getUserInitials = () => {
    const firstNameInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const lastNameInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    
    if (firstNameInitial && lastNameInitial) {
      return `${firstNameInitial}${lastNameInitial}`;
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase();
    } else {
      return 'U';
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center space-y-0 gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">Meu Perfil</CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais e configurações de conta
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <FiUser className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <FiLock className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <FiActivity className="h-4 w-4" />
            Atividade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e detalhes de contato
              </CardDescription>
            </CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu sobrenome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="seu.email@exemplo.com" 
                            {...field}
                            startIcon={<FiMail className="h-4 w-4 text-muted-foreground" />}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Informações da Conta</h3>
                    <div className="rounded-md border p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Nome de usuário</span>
                        <span className="text-sm font-medium">{user.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className="text-sm font-medium flex items-center">
                          <span className={`h-2 w-2 rounded-full mr-2 ${user.active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          {user.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Papel</span>
                        <span className="text-sm font-medium">
                          {user.roles && user.roles.length > 0 
                            ? user.roles.map(role => role.name).join(', ') 
                            : 'Nenhum papel atribuído'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-end">
                  <Button type="submit">
                    <FiSave className="mr-2" />
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>
                Gerencie sua senha e configurações de segurança
              </CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua senha atual" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirme sua nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                    <AlertTitle className="text-amber-800">Recomendações de segurança</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                        <li>Use pelo menos 8 caracteres</li>
                        <li>Combine letras maiúsculas e minúsculas</li>
                        <li>Inclua números e símbolos</li>
                        <li>Evite informações pessoais ou palavras comuns</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
                
                <CardFooter className="flex justify-end">
                  <Button type="submit">
                    <FiSave className="mr-2" />
                    Alterar Senha
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Atividade da Conta</CardTitle>
              <CardDescription>
                Visualize o histórico de atividades e sessões recentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Último Acesso</h3>
                <div className="rounded-md border p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <FiActivity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Login bem-sucedido</p>
                        <p className="text-xs text-muted-foreground">
                          {lastLogin ? formatDate(lastLogin) : 'Nenhum login registrado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Atividades Recentes</h3>
                <div className="rounded-md border">
                  {recentActivity.length > 0 ? (
                    <div className="divide-y">
                      {recentActivity.map((activity, index) => (
                        <div key={activity.id} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">{activity.action}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(activity.timestamp)}
                              </p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              IP: {activity.ip}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhuma atividade registrada
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;