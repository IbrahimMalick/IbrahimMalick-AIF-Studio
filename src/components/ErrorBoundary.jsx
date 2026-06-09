import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log to error tracking service
    console.error("Error caught by boundary:", error, errorInfo);
    
    // In production, send to monitoring service
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to error tracking service
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center p-4">
          <Card className="bg-[#111317] border-red-500/30 rounded-2xl max-w-2xl w-full">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border border-red-500/30">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-3">
                  Oops! Something went wrong
                </h1>

                <p className="text-gray-400 mb-6 max-w-md">
                  We encountered an unexpected error. Our team has been notified and is working on a fix.
                </p>

                {this.state.error && (
                  <details className="mb-6 w-full text-left">
                    <summary className="text-gray-400 cursor-pointer mb-2">
                      Error Details (Development Only)
                    </summary>
                    <pre className="bg-[#0B0B0C] p-4 rounded-lg overflow-auto text-xs text-red-400 border border-red-500/30">
                      {this.state.error.toString()}
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={this.handleReset}
                    className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>

                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="border-gray-700 text-gray-300"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                  Error ID: {Date.now().toString(36)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}