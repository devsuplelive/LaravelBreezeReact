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

export default function PermissionList() {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Fetch permissions data
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['/api/permissions'],
    queryFn: async () => {
      const res = await fetch('/api/permissions');
      if (!res.ok) throw new Error('Failed to fetch permissions');
      return res.json();
    }
  });

  // Filter permissions based on search term
  const filteredPermissions = React.useMemo(() => {
    if (!permissions) return [];
    return permissions.filter((permission: any) => 
      permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [permissions, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Permissions</h1>
        <p className="text-gray-600 mt-1">View all available permissions in the system</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Permission List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search permissions..."
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
                  <TableHead>Permission Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Used In Roles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.length > 0 ? (
                  filteredPermissions.map((permission: any) => (
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
                          <span className="text-sm">{permission.roles.length} roles</span>
                        ) : (
                          <span className="text-sm text-gray-500">Not assigned to any role</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      {searchTerm ? 'No permissions found matching your search.' : 'No permissions found.'}
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