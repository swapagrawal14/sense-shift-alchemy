
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    // Redirect to the synesthesia simulator
    window.location.href = '/index.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Loading AI Synesthesia Simulator...</h1>
        <p className="text-xl opacity-90">Redirecting to your synesthetic journey...</p>
      </div>
    </div>
  );
};

export default Index;
