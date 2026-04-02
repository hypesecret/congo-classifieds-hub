import React from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Tag, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories();

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toast.info("Fonctionnalité en cours de développement", {
      description: "La modification du statut sera disponible dans la prochaine mise à jour."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-24 font-bold text-foreground font-heading">Gestion des Catégories</h1>
          <p className="text-14 text-text-secondary mt-1">Gérez l'arborescence des annonces Expat-Congo</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Ajouter une catégorie
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-18 font-semibold">Toutes les catégories</CardTitle>
            <CardDescription>Liste exhaustive des catégories principales et sous-catégories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left font-medium text-text-muted">
                    <th className="h-12 px-4 py-2">Icone</th>
                    <th className="h-12 px-4 py-2">Nom</th>
                    <th className="h-12 px-4 py-2">Slug</th>
                    <th className="h-12 px-4 py-2 text-center">Annonces</th>
                    <th className="h-12 px-4 py-2 text-center">Statut</th>
                    <th className="h-12 px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="h-24 text-center">Chargement...</td>
                    </tr>
                  ) : categories?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="h-24 text-center">Aucune catégorie trouvée</td>
                    </tr>
                  ) : (
                    categories?.map((cat) => (
                      <tr key={cat.id} className="hover:bg-surface-hover transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span className="text-20">{cat.icon || '📦'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{cat.name}</td>
                        <td className="px-4 py-3 text-text-secondary">{cat.slug}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-surface rounded text-12 font-medium">
                            {cat.listings_count || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {cat.is_active !== false ? (
                            <span className="inline-flex items-center gap-1 text-success bg-success/10 px-2 py-0.5 rounded-full text-11 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-danger bg-danger/10 px-2 py-0.5 rounded-full text-11 font-bold">
                              <XCircle className="w-3 h-3" /> Inactif
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-primary">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-danger">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCategories;
