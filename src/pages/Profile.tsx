import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeDetailModal } from '@/components/RecipeDetailModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  name: string;
  image_url: string | null;
  ingredients: string[];
  instructions: string[];
  cooking_time: number | null;
  category: string | null;
  user_id: string;
  profiles: {
    username: string;
  } | null;
}

export default function Profile() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserRecipes();
    }
  }, [user]);

  const fetchUserRecipes = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        profiles (username)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } else {
      setRecipes((data as unknown as Recipe[]) || []);
    }
    setLoading(false);
  };


  const handleDeleteRecipe = async (recipeId: string) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete recipe. Please try again.',
      });
    } else {
      toast({
        title: 'Recipe deleted',
        description: 'Your recipe has been removed.',
      });
      setRecipes(recipes.filter(r => r.id !== recipeId));
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
          <Button onClick={() => navigate('/create')} className="gradient-bg">
            <Plus className="w-4 h-4 mr-2" />
            Create Recipe
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex items-center gap-6 mb-8 p-6 rounded-2xl bg-card shadow-sm">
          <Avatar className="w-20 h-20 ring-4 ring-primary/20">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={username} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-serif text-3xl font-bold">{username}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} shared
            </p>
          </div>
        </div>

        <h2 className="font-serif text-2xl font-semibold mb-6">My Recipes</h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl">
            <span className="text-6xl mb-4 block">👨‍🍳</span>
            <h2 className="font-serif text-2xl font-semibold mb-2">No recipes yet</h2>
            <p className="text-muted-foreground mb-6">
              Start sharing your culinary creations with the community!
            </p>
            <Button onClick={() => navigate('/create')} className="gradient-bg">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Recipe
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe, index) => (
              <div 
                key={recipe.id} 
                className="relative group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <RecipeCard
                  id={recipe.id}
                  name={recipe.name}
                  imageUrl={recipe.image_url}
                  authorUsername={recipe.profiles?.username || username}
                  cookingTime={recipe.cooking_time}
                  category={recipe.category}
                  onClick={() => handleRecipeClick(recipe)}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{recipe.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </main>

      <RecipeDetailModal
        recipe={selectedRecipe}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
