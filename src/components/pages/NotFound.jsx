import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
            <ApperIcon name="FileQuestion" size={40} className="text-primary-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-secondary-900">
              Page Not Found
            </h2>
            <p className="text-secondary-600 leading-relaxed">
              Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleGoHome}
            icon="Home"
            className="w-full"
          >
            Go Back Home
          </Button>
          
          <div className="flex items-center gap-4 text-sm text-secondary-500">
            <button 
              onClick={() => window.history.back()}
              className="hover:text-primary-600 transition-colors duration-200"
            >
              ← Go Back
            </button>
            <span>•</span>
            <a 
              href="mailto:support@crmproa.com" 
              className="hover:text-primary-600 transition-colors duration-200"
            >
              Report Issue
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;