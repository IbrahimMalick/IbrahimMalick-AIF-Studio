import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";

const RBAC_MATRIX = {
  owner: {
    agents: ['create', 'read', 'update', 'delete', 'execute'],
    projects: ['create', 'read', 'update', 'delete'],
    billing: ['read', 'update'],
    analytics: ['read'],
    team: ['create', 'read', 'update', 'delete'],
    integrations: ['create', 'read', 'update', 'delete'],
    webhooks: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update']
  },
  admin: {
    agents: ['create', 'read', 'update', 'delete', 'execute'],
    projects: ['create', 'read', 'update', 'delete'],
    billing: ['read'],
    analytics: ['read'],
    team: ['read', 'update'],
    integrations: ['create', 'read', 'update', 'delete'],
    webhooks: ['read', 'update'],
    settings: ['read', 'update']
  },
  manager: {
    agents: ['create', 'read', 'update', 'execute'],
    projects: ['read', 'update'],
    billing: ['read'],
    analytics: ['read'],
    team: ['read'],
    integrations: ['read'],
    webhooks: ['read'],
    settings: ['read']
  },
  member: {
    agents: ['create', 'read', 'execute'],
    projects: ['read'],
    billing: [],
    analytics: ['read'],
    team: [],
    integrations: ['read'],
    webhooks: [],
    settings: []
  },
  viewer: {
    agents: ['read'],
    projects: ['read'],
    billing: [],
    analytics: ['read'],
    team: [],
    integrations: [],
    webhooks: [],
    settings: []
  }
};

export default function RBACManager() {
  const [selectedRole, setSelectedRole] = useState('owner');

  const roleColors = {
    owner: 'bg-purple-500/20 text-purple-400',
    admin: 'bg-red-500/20 text-red-400',
    manager: 'bg-blue-500/20 text-blue-400',
    member: 'bg-green-500/20 text-green-400',
    viewer: 'bg-gray-500/20 text-gray-400'
  };

  const resources = Object.keys(RBAC_MATRIX.owner);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-2 mb-6">
        {Object.keys(RBAC_MATRIX).map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`p-3 rounded-lg transition-all capitalize font-semibold text-sm ${
              selectedRole === role
                ? `${roleColors[role]} border border-current`
                : 'bg-black/30 border border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {resources.map((resource, idx) => {
          const actions = RBAC_MATRIX[selectedRole][resource];
          const allActions = ['create', 'read', 'update', 'delete', 'execute'];

          return (
            <motion.div
              key={resource}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-[#0B0B0C] border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-orange-400" />
                      <h4 className="font-semibold text-white capitalize">{resource}</h4>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      {allActions.map(action => {
                        const hasPermission = actions.includes(action);
                        return (
                          <div
                            key={action}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              hasPermission
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-500 line-through'
                            }`}
                          >
                            {hasPermission ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {action}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400 text-sm">Role Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• <span className="text-orange-400 font-semibold">Owner:</span> Full system access</li>
            <li>• <span className="text-red-400 font-semibold">Admin:</span> Manage agents, integrations, team</li>
            <li>• <span className="text-blue-400 font-semibold">Manager:</span> Create & manage projects</li>
            <li>• <span className="text-green-400 font-semibold">Member:</span> Execute agents, view analytics</li>
            <li>• <span className="text-gray-400 font-semibold">Viewer:</span> Read-only access</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}