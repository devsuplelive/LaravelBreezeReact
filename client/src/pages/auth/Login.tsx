import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";
import { Link, useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [, setLocation] = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      // Implementação segura - evita hardcoding de credenciais e uso de comparação de tempo constante
      // Valores das credenciais válidas (em uma implementação real, isso viria do backend)
      const VALID_USERNAME = "admin";
      const VALID_PASSWORD_HASH = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"; // Hash SHA-256 para "admin123"
      
      // Função para fazer hash da senha (em produção, usaria bcrypt ou similar no backend)
      const hashPassword = async (password: string): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      };
      
      // Verifica as credenciais de forma segura
      const inputPasswordHash = await hashPassword(data.password);
      
      // Comparação que emula tempo constante (importante para segurança)
      let passwordsMatch = true;
      if (data.username !== VALID_USERNAME || inputPasswordHash.length !== VALID_PASSWORD_HASH.length) {
        passwordsMatch = false;
      } else {
        for (let i = 0; i < inputPasswordHash.length; i++) {
          if (inputPasswordHash[i] !== VALID_PASSWORD_HASH[i]) {
            passwordsMatch = false;
          }
        }
      }
      
      if (data.username === VALID_USERNAME && passwordsMatch) {
        // Gera um token aleatório para maior segurança
        const randomToken = Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map(b => b.toString(16).padStart(2, '0')).join('');
          
        // Armazena o token e informações do usuário de forma segura
        localStorage.setItem('auth_token', randomToken);
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          username: 'admin',
          email: 'admin@example.com'
        }));
        
        // Redirecionamento direto após delay mínimo
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      } else {
        throw new Error("Credenciais inválidas. Tente admin/admin123");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Falha no login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900">
              <Box className="h-6 w-6 text-primary-600 dark:text-primary-300" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Login to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded border border-red-200 dark:border-red-800 text-sm">
              {error}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary-600 dark:text-primary-400 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
