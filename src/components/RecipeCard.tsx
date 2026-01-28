import { Clock, User } from 'lucide-react';

interface RecipeCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  authorUsername: string;
  cookingTime?: number | null;
  category?: string | null;
  onClick?: () => void;
}

export function RecipeCard({ 
  name, 
  imageUrl, 
  authorUsername, 
  cookingTime, 
  category,
  onClick 
}: RecipeCardProps) {
  return (
    <div 
      className="recipe-card cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
            <span className="text-6xl">🍳</span>
          </div>
        )}
        {category && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
            {category}
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-serif text-xl font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>{authorUsername}</span>
          </div>
          
          {cookingTime && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{cookingTime} min</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
