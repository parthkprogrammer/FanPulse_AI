import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';
import { EmptyState, Button } from '../components/ui';

export const NotFoundPage = () => {
  return (
    <div className="py-12 px-4">
      <EmptyState
        icon={HelpCircle}
        title="404 — Page Not Found"
        description="The match pitch or fantasy resource you are looking for does not exist or has been moved."
        action={
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={Home}>
              Return to Dashboard
            </Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFoundPage;
