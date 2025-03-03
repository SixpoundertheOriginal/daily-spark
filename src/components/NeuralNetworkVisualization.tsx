
import React, { useEffect, useState, useRef } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeuralNetworkVisualizationProps {
  isActive?: boolean;
  greeting?: boolean;
}

const NeuralNetworkVisualization: React.FC<NeuralNetworkVisualizationProps> = ({ 
  isActive = true, 
  greeting = true 
}) => {
  const [dots, setDots] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    pulseDelay: number;
    velocityX: number;
    velocityY: number;
  }>>([]);
  
  const [connections, setConnections] = useState<Array<{
    id: string;
    sourceId: number;
    targetId: number;
    strength: number;
    pulseDelay: number;
  }>>([]);
  
  const [timeOfDay, setTimeOfDay] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate network dots
  useEffect(() => {
    const generateNetwork = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Generate dots
      const dotCount = 12;
      const newDots = [];
      
      for (let i = 0; i < dotCount; i++) {
        newDots.push({
          id: i,
          x: Math.random() * (width - 20) + 10,
          y: Math.random() * (height - 20) + 10,
          size: Math.random() * 3 + 2,
          pulseDelay: Math.random() * 3,
          velocityX: (Math.random() - 0.5) * 0.2,
          velocityY: (Math.random() - 0.5) * 0.2
        });
      }
      
      setDots(newDots);
      
      // Generate connections (not all dots are connected)
      const newConnections = [];
      
      for (let i = 0; i < dotCount; i++) {
        for (let j = i + 1; j < dotCount; j++) {
          // Only connect some dots (about 30%)
          if (Math.random() < 0.3) {
            newConnections.push({
              id: `${i}-${j}`,
              sourceId: i,
              targetId: j,
              strength: Math.random() * 0.8 + 0.2, // opacity varies
              pulseDelay: Math.random() * 2
            });
          }
        }
      }
      
      setConnections(newConnections);
    };
    
    generateNetwork();
    
    // Regenerate on resize
    const handleResize = () => {
      generateNetwork();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Animate dots with a subtle movement
  useEffect(() => {
    if (dots.length === 0 || !isActive) return;
    
    const interval = setInterval(() => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      setDots(prevDots => 
        prevDots.map(dot => {
          // Update position based on velocity
          let x = dot.x + dot.velocityX;
          let y = dot.y + dot.velocityY;
          
          // Bounce off edges
          if (x <= 10 || x >= width - 10) {
            x = Math.max(10, Math.min(x, width - 10));
            dot.velocityX *= -1;
          }
          
          if (y <= 10 || y >= height - 10) {
            y = Math.max(10, Math.min(y, height - 10));
            dot.velocityY *= -1;
          }
          
          return { ...dot, x, y };
        })
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, [dots, isActive]);
  
  // Set greeting based on time of day
  useEffect(() => {
    const hours = new Date().getHours();
    let timeGreeting = '';
    
    if (hours >= 5 && hours < 12) {
      timeGreeting = 'Good morning';
    } else if (hours >= 12 && hours < 18) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }
    
    setTimeOfDay(timeGreeting);
  }, []);
  
  return (
    <div className="relative w-full rounded-xl glass-card p-4 md:p-6 border border-white/10 bg-gradient-to-br from-black/40 to-black/20 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Neural Network Background */}
      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-hidden rounded-xl"
      >
        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Connections */}
          {connections.map(connection => {
            const source = dots[connection.sourceId];
            const target = dots[connection.targetId];
            
            if (!source || !target) return null;
            
            return (
              <motion.line
                key={connection.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={`rgba(139, 92, 246, ${connection.strength * (isActive ? 0.5 : 0.2)})`}
                strokeWidth={0.5}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: isActive ? connection.strength : connection.strength * 0.4,
                }}
                transition={{
                  duration: 2,
                  delay: connection.pulseDelay,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            );
          })}
          
          {/* Dots */}
          {dots.map(dot => (
            <motion.circle
              key={dot.id}
              cx={dot.x}
              cy={dot.y}
              r={dot.size}
              fill={isActive ? "#8b5cf6" : "#6b7280"}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                delay: dot.pulseDelay,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
        <div className="flex items-center">
          <div className="h-12 w-12 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-nexus-accent-purple/20 relative mr-4">
            {isActive ? (
              <Sparkles size={24} className="text-white animate-pulse-soft" />
            ) : (
              <Brain size={24} className="text-white" />
            )}
            
            {/* Status indicator */}
            <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-white/20 ${isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          </div>
          
          <div>
            <h2 className="text-xl md:text-2xl font-light text-gradient">Nexus AI</h2>
            <div className="flex items-center space-x-2">
              <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-400'}`}></span>
              <span className="text-xs text-nexus-text-secondary">{isActive ? 'Active' : 'Standby'}</span>
            </div>
          </div>
        </div>
        
        {greeting && (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-right"
            >
              <h3 className="text-lg md:text-xl text-white font-light">{timeOfDay}</h3>
              <p className="text-sm text-nexus-text-secondary">Let's optimize your productivity today</p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      
      {/* Optional Insights Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-white/5 rounded-lg p-3 border border-white/10"
      >
        <div className="flex items-center">
          <div className="h-8 w-8 bg-nexus-accent-purple/20 rounded-md flex items-center justify-center mr-3">
            <Brain size={16} className="text-nexus-accent-purple" />
          </div>
          <p className="text-sm text-white">Nexus AI is analyzing your tasks and schedule...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default NeuralNetworkVisualization;
