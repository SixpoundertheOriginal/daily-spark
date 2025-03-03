
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Brain, Sparkles } from 'lucide-react';

const AuthForm: React.FC = () => {
  const { signIn, signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [activeTab, setActiveTab] = useState('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'login') {
      await signIn(email, password);
    } else {
      await signUp(email, password, fullName);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-nexus-bg-primary via-nexus-bg-secondary to-[#1a1335]">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 shadow-xl shadow-black/30 border border-white/10 rounded-2xl backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <div className="primary-gradient h-14 w-14 rounded-xl flex items-center justify-center shadow-lg shadow-nexus-accent-purple/20">
              <Brain size={30} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-light text-gradient text-center mb-6">Nexus Task Management</h2>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-morphism mb-6 w-full">
              <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit}>
              <TabsContent value="login" className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-morphism text-white placeholder-white/40 border-none"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-morphism text-white placeholder-white/40 border-none"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full primary-gradient text-white"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="glass-morphism text-white placeholder-white/40 border-none"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-morphism text-white placeholder-white/40 border-none"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-morphism text-white placeholder-white/40 border-none"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full primary-gradient text-white"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </TabsContent>
            </form>
          </Tabs>

          <div className="mt-8 flex flex-col items-center">
            <div className="text-xs text-nexus-text-secondary mb-2">Powered by</div>
            <div className="flex items-center space-x-1">
              <Sparkles size={12} className="text-nexus-accent-purple animate-pulse-soft" />
              <span className="text-xs text-gradient">Nexus AI Assistant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
