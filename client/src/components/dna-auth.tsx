import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dna, Shield, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DNAAuthProps {
  onAuthChange: (authenticated: boolean, user?: any) => void;
}

export default function DNAAuth({ onAuthChange }: DNAAuthProps) {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      setAuthStatus(data);
      onAuthChange(data.authenticated, data.user);
    } catch (error) {
      console.error('Auth status check failed:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && (data.success || data.user)) {
        toast({
          title: "🧬 DNA Authentication Successful",
          description: `Welcome! Role: ${data.user.role} | Security Level: ${data.user.securityLevel}`,
        });
        console.log('✅ Authentication successful:', data.user);
        await checkAuthStatus();
      } else {
        const errorMsg = data.error || data.message || "DNA sequence not recognized";
        toast({
          title: "🚫 DNA Authentication Failed",
          description: `${errorMsg} | Sequence: ${data.dnaSequence || 'Unknown'}`,
          variant: "destructive",
        });
        console.log('❌ Authentication failed:', data);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "🔒 Authentication Error",
        description: "Failed to connect to DNA authentication system",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "Logged Out",
          description: "DNA session terminated successfully",
        });
        await checkAuthStatus();
      }
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Unable to logout properly",
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'instructor': return 'bg-blue-500';
      case 'student': return 'bg-green-500';
      case 'system': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (!authStatus) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="w-5 h-5" />
            DNA Authentication
          </CardTitle>
          <CardDescription>Loading authentication status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dna className="w-5 h-5" />
          DNA Authentication
        </CardTitle>
        <CardDescription>
          Biometric DNA-based security system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {authStatus.authenticated ? (
          <>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">Authenticated</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Role:</span>
                <Badge className={getRoleColor(authStatus.user.role)}>
                  {authStatus.user.role}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Security Level:</span>
                <Badge variant="outline">
                  Level {authStatus.user.securityLevel}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trust Score:</span>
                <Badge variant="secondary">
                  {authStatus.dnaMetrics.trustScore}%
                </Badge>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">DNA Sequence:</p>
              <code className="text-xs bg-muted p-2 rounded block">
                {authStatus.dnaMetrics.sequence}
              </code>
            </div>

            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full"
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium">Not Authenticated</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trust Score:</span>
                <Badge variant="secondary">
                  {authStatus.dnaMetrics.trustScore}%
                </Badge>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">DNA Sequence:</p>
              <code className="text-xs bg-muted p-2 rounded block">
                {authStatus.dnaMetrics.sequence}
              </code>
            </div>

            <Button 
              onClick={handleLogin} 
              disabled={loading}
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              {loading ? 'Authenticating...' : 'DNA Login'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}