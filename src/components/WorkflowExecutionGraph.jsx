import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, RefreshCw, ArrowRight, AlertTriangle } from "lucide-react";

export default function WorkflowExecutionGraph({ run }) {
  if (!run?.output?.steps) return null;

  const steps = run.output.steps || [];
  const totalSteps = steps.length;
  const successfulSteps = steps.filter(s => s.status === 'success').length;
  const failedSteps = steps.filter(s => s.status === 'failed' || s.status === 'error').length;
  const retriedSteps = steps.filter(s => (s.retry_count || 0) > 0).length;

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">Execution Flow</CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-green-500/20 text-green-400 text-xs">
              {successfulSteps} Success
            </Badge>
            {failedSteps > 0 && (
              <Badge className="bg-red-500/20 text-red-400 text-xs">
                {failedSteps} Failed
              </Badge>
            )}
            {retriedSteps > 0 && (
              <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                {retriedSteps} Retried
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steps.map((step, idx) => {
            const isSuccess = step.status === 'success';
            const isFailed = step.status === 'failed' || step.status === 'error';
            const hadRetries = (step.retry_count || 0) > 0;

            return (
              <div key={idx}>
                <div className={`p-3 rounded-lg border ${
                  isSuccess ? 'border-green-500/30 bg-green-500/5' :
                  isFailed ? 'border-red-500/30 bg-red-500/5' :
                  'border-gray-700 bg-[#0B0B0C]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isSuccess && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      {isFailed && <XCircle className="w-5 h-5 text-red-400" />}
                      {!isSuccess && !isFailed && <RefreshCw className="w-5 h-5 text-blue-400" />}
                      
                      <div>
                        <p className="text-white font-semibold text-sm">
                          Step {idx + 1}: {step.name || step.type || 'Unknown'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {step.duration_ms ? `${step.duration_ms}ms` : 'No duration'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {hadRetries && (
                        <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                          {step.retry_count} retries
                        </Badge>
                      )}
                      <Badge className={`text-xs ${
                        isSuccess ? 'bg-green-500/20 text-green-400' :
                        isFailed ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {step.status}
                      </Badge>
                    </div>
                  </div>

                  {step.error && (
                    <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/30">
                      <p className="text-red-400 text-xs font-mono">{step.error}</p>
                    </div>
                  )}
                </div>

                {idx < steps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-1">Success Rate</p>
            <p className="text-white font-bold text-lg">
              {totalSteps > 0 ? Math.round((successfulSteps / totalSteps) * 100) : 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-1">Total Steps</p>
            <p className="text-white font-bold text-lg">{totalSteps}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-1">Retry Rate</p>
            <p className="text-white font-bold text-lg">
              {totalSteps > 0 ? Math.round((retriedSteps / totalSteps) * 100) : 0}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}