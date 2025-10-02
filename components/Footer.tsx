
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackModal from './FeedbackModal';

const Footer: React.FC = () => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <>
      {isFeedbackModalOpen && (
        <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />
      )}
      <footer className="bg-dark-primary border-t border-border-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-light-secondary">
          <p>&copy; {new Date().getFullYear()} Mike's AI Forge. All rights reserved.</p>
          <p className="text-sm mt-1 opacity-75">Empowering creators with breakthrough tools, vibrant community discussions, and the latest AI news.</p>
          <nav className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-3 text-sm">
            <Link to="/forum" className="text-light-secondary hover:text-brand-primary hover:underline transition-colors">
              Community Forum
            </Link>
            <Link to="/news" className="text-light-secondary hover:text-brand-primary hover:underline transition-colors">
              AI News
            </Link>
          </nav>
          <div className="mt-4">
             <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="text-sm text-light-secondary hover:text-brand-primary hover:underline"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
