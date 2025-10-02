
import React from 'react';
import { Link } from 'react-router-dom';
import type { Tool } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { BookmarkIcon } from './icons/UtilityIcons';
import { useTiltEffect } from '../hooks/useTiltEffect';

interface ToolCardProps {
  tool: Tool;
}

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const auth = useAuth();
  const tiltRef = useTiltEffect<HTMLDivElement>();
  const isSaved = auth?.currentUser?.savedTools?.includes(tool.id) || false;

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (auth?.toggleSaveTool) {
      auth.toggleSaveTool(tool.id);
    }
  };

  return (
    <div ref={tiltRef} className="relative group tilt-card h-full">
      <Link 
        to={`/tools/${tool.slug}`} 
        className="block bg-dark-secondary rounded-xl border border-border-dark shadow-sm group-hover:border-brand-primary/50 group-hover:shadow-glow-blue transition-all duration-300 h-full relative overflow-hidden glare-effect"
      >
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <img src={tool.logoUrl} alt={`${tool.name} logo`} className="w-16 h-16 rounded-md object-cover flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-light-primary pr-8">{tool.name}</h3>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <StarIcon className="w-5 h-5" />
                  <span className="font-bold text-light-secondary">{tool.rating}</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-light-secondary">{tool.summary}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tool.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
      {auth?.currentUser && (
        <button
          onClick={handleSaveToggle}
          className="absolute top-4 right-4 p-2 rounded-full bg-dark-secondary/50 backdrop-blur-sm text-light-secondary hover:text-brand-primary transition-colors"
          aria-label={isSaved ? 'Unsave tool' : 'Save tool'}
        >
          <BookmarkIcon className="w-5 h-5" filled={isSaved} />
        </button>
      )}
    </div>
  );
};

export default ToolCard;