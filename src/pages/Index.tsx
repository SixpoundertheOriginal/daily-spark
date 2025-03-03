
import React from 'react';
import TaskPanel from '../components/TaskPanel';

const Index = () => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Futuristic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[150%] bg-gradient-to-br from-nexus-accent-purple/10 via-transparent to-nexus-accent-blue/10 blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-20%] right-[-5%] w-[70%] h-[70%] bg-gradient-to-tl from-nexus-accent-pink/10 via-transparent to-nexus-accent-blue/10 blur-[100px] opacity-40"></div>
        
        {/* Futuristic grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#8b5cf620_1px,transparent_1px)] bg-[size:30px_30px] opacity-20"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <TaskPanel />
      </div>
    </div>
  );
};

export default Index;
