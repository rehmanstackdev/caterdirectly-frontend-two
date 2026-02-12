
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-foreground mb-6">
          Oops! We couldn't find the page you're looking for
        </p>
        <p className="text-muted-foreground mb-8">
          The page at <span className="font-mono bg-muted px-2 py-1 rounded">{location.pathname}</span> might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Return to Home
          </Button>
          <Button
            onClick={() => navigate('/marketplace')}
            className="w-full sm:w-auto"
          >
            Go to Marketplace
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
