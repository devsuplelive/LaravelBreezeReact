import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Interface para a resposta da API
interface PermissionResponse {
  permissions: Permission[];
  total: number;
  page: number;
  limit: number;
}

// Interface para uma permissão
interface Permission {
  id: number;
  name: string;
  description: string | null;
  roles?: any[];
}

export default function PermissionList() {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Fetch permissions data
  const { data, isLoading } = useQuery<PermissionResponse>({
    queryKey: ['/api/permissions'],
    queryFn: async () => {
      const res = await fetch('/api/permissions');
      if (!res.ok) throw new Error('Failed to fetch permissions');
      return res.json();
    }
  });

  // Filter permissions based on search term
  const filteredPermissions = React.useMemo(() => {
    if (!data || !data.permissions) return [];
    
    return data.permissions.filter((permission: Permission) => 
      permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Lista de Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar permissões..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Permissão</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Utilizado em Papéis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.length > 0 ? (
                  filteredPermissions.map((permission: Permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Key className="h-4 w-4 text-gray-500 mr-2" />
                          {permission.name}
                        </div>
                      </TableCell>
                      <TableCell>{permission.description || '-'}</TableCell>
                      <TableCell>
                        {permission.roles?.length > 0 ? (
                          <span className="text-sm">{permission.roles.length} papéis</span>
                        ) : (
                          <span className="text-sm text-gray-500">Não atribuído a nenhum papel</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      {searchTerm ? 'Nenhuma permissão encontrada para sua busca.' : 'Nenhuma permissão encontrada.'}
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
}