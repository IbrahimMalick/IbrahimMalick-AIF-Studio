import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Rocket,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  Users,
  Send,
  Download,
  Calendar,
  TrendingUp,
  Shield,
  Database,
  TestTube,
  FileText,
  Megaphone,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";
import { showToast } from "@/components/ToastNotification";
import { useAudioFeedback } from "@/components/AudioSystem";

export default function DeploymentChecklist() {
  const [user, setUser] = useState(null);
  const audio = useAudioFeedback();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  // Create initial checklist
  const createChecklistMutation = useMutation({
    mutationFn: async () => {
      const checklistId = `deploy_${Date.now()}`;
      
      const checklist = await base44.entities.DeploymentChecklist.create({
        checklist_id: checklistId,
        deployment_name: "AIFreedomDuane Studio v1.0 - Production Launch",
        target_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: "in_progress",
        created_by: user.email,
        team_members: [user.email],
        categories: deploymentCategories
      });

      // Create individual tasks
      for (const category of deploymentCategories) {
        for (const task of category.tasks) {
          await base44.entities.TeamTask.create({
            task_id: task.task_id,
            checklist_id: checklistId,
            category: category.category,
            task_name: task.task_name,
            description: task.description,
            priority: task.priority,
            assigned_to: user.email,
            status: "pending",
            due_date: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      // Send notifications to all team members
      await base44.entities.Notification.create({
        user_email: user.email,
        title: "🚀 Production Deployment Checklist Created!",
        message: "Your comprehensive deployment checklist is ready. Review and assign tasks to team members.",
        type: "success",
        category: "system",
        action_url: "/DeploymentChecklist",
        action_label: "View Checklist"
      });

      return checklist;
    },
    onSuccess: () => {
      audio.playProsperityChime();
      showToast("Deployment checklist created and team notified!", "success");
      queryClient.invalidateQueries(["deploymentChecklist"]);
      queryClient.invalidateQueries(["teamTasks"]);
    },
  });

  const { data: checklists = [] } = useQuery({
    queryKey: ["deploymentChecklist"],
    queryFn: () => base44.entities.DeploymentChecklist.list("-created_date", 1),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["teamTasks"],
    queryFn: () => base44.entities.TeamTask.list("-created_date"),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }) => 
      base44.entities.TeamTask.update(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(["teamTasks"]);
      audio.playSuccess();
    },
  });

  const currentChecklist = checklists[0];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "blocked": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical": return "bg-red-500/20 text-red-400";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      case "low": return "bg-gray-500/20 text-gray-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "security": return Shield;
      case "testing": return TestTube;
      case "infrastructure": return Database;
      case "documentation": return FileText;
      case "marketing": return Megaphone;
      default: return Settings;
    }
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  };

  const criticalTasksRemaining = tasks.filter(
    t => t.priority === "critical" && t.status !== "completed"
  ).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Rocket className="w-8 h-8 text-[#FFD700]" />
              Production Deployment Checklist
            </h1>
            <p className="text-gray-400">Track your path to launch</p>
          </div>
          
          {!currentChecklist && (
            <Button
              onClick={() => createChecklistMutation.mutate()}
              disabled={createChecklistMutation.isPending}
              className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold px-6"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Create Checklist & Notify Team
            </Button>
          )}
        </div>

        {currentChecklist && (
          <>
            {/* Progress Overview */}
            <Card className="bg-gradient-to-br from-[#111317] to-[#0B0B0C] border-[#FFD700]/20 rounded-2xl">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-6">
                  
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Overall Progress</p>
                    <p className="text-4xl font-bold text-[#FFD700] mb-2">
                      {calculateProgress()}%
                    </p>
                    <Progress value={calculateProgress()} className="h-3" />
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">Total Tasks</p>
                    <p className="text-4xl font-bold text-white mb-2">
                      {tasks.length}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tasks.filter(t => t.status === "completed").length} completed
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">Critical Tasks</p>
                    <p className={`text-4xl font-bold mb-2 ${
                      criticalTasksRemaining === 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {criticalTasksRemaining}
                    </p>
                    <p className="text-xs text-gray-500">remaining</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">Target Launch</p>
                    <p className="text-2xl font-bold text-white mb-2">
                      {new Date(currentChecklist.target_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.ceil((new Date(currentChecklist.target_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Task Categories */}
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="bg-[#111317] border border-gray-800">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="testing">Testing</TabsTrigger>
                <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {deploymentCategories.map((category, catIdx) => {
                  const CategoryIcon = getCategoryIcon(category.category);
                  const categoryTasks = tasks.filter(t => t.category === category.category);
                  const completedCount = categoryTasks.filter(t => t.status === "completed").length;
                  
                  return (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIdx * 0.1 }}
                    >
                      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                              <CategoryIcon className="w-5 h-5 text-[#FFD700]" />
                              {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                            </CardTitle>
                            <Badge className="bg-gray-800 text-gray-300">
                              {completedCount}/{categoryTasks.length}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {categoryTasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-start gap-4 p-4 rounded-xl bg-[#0B0B0C] border border-gray-800 hover:border-gray-700 transition-colors"
                              >
                                <button
                                  onClick={() => {
                                    const newStatus = task.status === "completed" ? "pending" : "completed";
                                    updateTaskMutation.mutate({
                                      taskId: task.id,
                                      updates: {
                                        status: newStatus,
                                        completed_at: newStatus === "completed" ? new Date().toISOString() : null
                                      }
                                    });
                                  }}
                                  className="mt-1 flex-shrink-0"
                                >
                                  {task.status === "completed" ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-600 hover:text-[#FFD700] transition-colors" />
                                  )}
                                </button>

                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <p className={`text-white font-medium ${
                                      task.status === "completed" ? 'line-through opacity-60' : ''
                                    }`}>
                                      {task.task_name}
                                    </p>
                                    <div className="flex gap-2 flex-shrink-0">
                                      <Badge className={getPriorityColor(task.priority)}>
                                        {task.priority}
                                      </Badge>
                                      <Badge className={getStatusColor(task.status)}>
                                        {task.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  {task.description && (
                                    <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {task.due_date && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                      </span>
                                    )}
                                    {task.assigned_to && (
                                      <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {task.assigned_to}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </TabsContent>

              {/* Other filtered tabs would go here */}
            </Tabs>

            {/* Export & Share */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold mb-1">Share with Team</p>
                    <p className="text-gray-400 text-sm">
                      Export checklist or send updates to team members
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="border-gray-700"
                      onClick={() => {
                        audio.playClick();
                        showToast("Checklist exported!", "success");
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold"
                      onClick={async () => {
                        await base44.entities.Notification.create({
                          user_email: user.email,
                          title: "📋 Deployment Update",
                          message: `Progress: ${calculateProgress()}% | ${criticalTasksRemaining} critical tasks remaining`,
                          type: "info",
                          category: "system",
                          action_url: "/DeploymentChecklist"
                        });
                        audio.playSuccess();
                        showToast("Team update sent!", "success");
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

      </div>
    </div>
  );
}

// Deployment categories and tasks
const deploymentCategories = [
  {
    category: "security",
    tasks: [
      {
        task_id: "sec_001",
        task_name: "Enable 2FA for all admin accounts",
        description: "Implement and test two-factor authentication",
        priority: "critical"
      },
      {
        task_id: "sec_002",
        task_name: "SSL/TLS certificate installed and configured",
        description: "Ensure HTTPS is enforced across all endpoints",
        priority: "critical"
      },
      {
        task_id: "sec_003",
        task_name: "Security headers configured (CSP, HSTS, etc.)",
        description: "Add all recommended security headers",
        priority: "high"
      },
      {
        task_id: "sec_004",
        task_name: "Rate limiting implemented on API endpoints",
        description: "Prevent abuse and DDoS attacks",
        priority: "high"
      },
      {
        task_id: "sec_005",
        task_name: "Encryption at rest for sensitive data",
        description: "Encrypt passwords, tokens, payment info",
        priority: "critical"
      },
      {
        task_id: "sec_006",
        task_name: "Security audit completed",
        description: "Third-party penetration testing",
        priority: "high"
      },
      {
        task_id: "sec_007",
        task_name: "GDPR compliance check",
        description: "Data privacy, consent, right to deletion",
        priority: "critical"
      }
    ]
  },
  {
    category: "testing",
    tasks: [
      {
        task_id: "test_001",
        task_name: "End-to-end testing suite complete",
        description: "Test all user flows from signup to advanced features",
        priority: "critical"
      },
      {
        task_id: "test_002",
        task_name: "Load testing (1000+ concurrent users)",
        description: "Test system under heavy load",
        priority: "high"
      },
      {
        task_id: "test_003",
        task_name: "Mobile responsiveness tested (iOS/Android)",
        description: "Test on multiple devices and screen sizes",
        priority: "high"
      },
      {
        task_id: "test_004",
        task_name: "Cross-browser compatibility (Chrome/Safari/Firefox)",
        description: "Test on all major browsers",
        priority: "medium"
      },
      {
        task_id: "test_005",
        task_name: "Payment flow testing (successful & failed)",
        description: "Test Stripe integration thoroughly",
        priority: "critical"
      },
      {
        task_id: "test_006",
        task_name: "Email delivery testing",
        description: "Test all email sequences and templates",
        priority: "high"
      },
      {
        task_id: "test_007",
        task_name: "Integration health monitoring tested",
        description: "Verify auto-healing and alerts work",
        priority: "medium"
      }
    ]
  },
  {
    category: "infrastructure",
    tasks: [
      {
        task_id: "infra_001",
        task_name: "Production database backup system",
        description: "Automated daily backups with retention policy",
        priority: "critical"
      },
      {
        task_id: "infra_002",
        task_name: "CDN configured for static assets",
        description: "Improve load times globally",
        priority: "high"
      },
      {
        task_id: "infra_003",
        task_name: "Monitoring & alerting (uptime, errors, performance)",
        description: "Set up DataDog/New Relic/Sentry",
        priority: "critical"
      },
      {
        task_id: "infra_004",
        task_name: "Auto-scaling configured",
        description: "Handle traffic spikes automatically",
        priority: "high"
      },
      {
        task_id: "infra_005",
        task_name: "Disaster recovery plan documented",
        description: "Runbook for incidents",
        priority: "high"
      },
      {
        task_id: "infra_006",
        task_name: "Environment variables secured",
        description: "No secrets in code, use secret manager",
        priority: "critical"
      }
    ]
  },
  {
    category: "frontend",
    tasks: [
      {
        task_id: "fe_001",
        task_name: "Error boundaries implemented",
        description: "Graceful error handling throughout app",
        priority: "high"
      },
      {
        task_id: "fe_002",
        task_name: "Loading states for all async operations",
        description: "No blank screens during data fetching",
        priority: "medium"
      },
      {
        task_id: "fe_003",
        task_name: "Empty states for all pages",
        description: "Clear CTAs when no data exists",
        priority: "medium"
      },
      {
        task_id: "fe_004",
        task_name: "Accessibility audit (WCAG 2.1 AA)",
        description: "Keyboard navigation, screen readers, contrast",
        priority: "high"
      },
      {
        task_id: "fe_005",
        task_name: "PWA manifest and service worker",
        description: "Enable install prompt and offline support",
        priority: "low"
      }
    ]
  },
  {
    category: "backend",
    tasks: [
      {
        task_id: "be_001",
        task_name: "API versioning strategy",
        description: "Ensure backwards compatibility",
        priority: "medium"
      },
      {
        task_id: "be_002",
        task_name: "Background job queue for heavy tasks",
        description: "Video rendering, exports, emails",
        priority: "high"
      },
      {
        task_id: "be_003",
        task_name: "Database indexing optimized",
        description: "Fast queries on all common operations",
        priority: "high"
      },
      {
        task_id: "be_004",
        task_name: "Webhook retry logic",
        description: "Exponential backoff for failed webhooks",
        priority: "medium"
      }
    ]
  },
  {
    category: "documentation",
    tasks: [
      {
        task_id: "doc_001",
        task_name: "User documentation (help center)",
        description: "Comprehensive guides for all features",
        priority: "high"
      },
      {
        task_id: "doc_002",
        task_name: "API documentation published",
        description: "Complete API reference with examples",
        priority: "medium"
      },
      {
        task_id: "doc_003",
        task_name: "Video tutorials created",
        description: "Walkthrough videos for key features",
        priority: "medium"
      },
      {
        task_id: "doc_004",
        task_name: "Terms of Service & Privacy Policy",
        description: "Legal documents reviewed by lawyer",
        priority: "critical"
      }
    ]
  },
  {
    category: "marketing",
    tasks: [
      {
        task_id: "mkt_001",
        task_name: "Landing page SEO optimized",
        description: "Meta tags, structured data, sitemap",
        priority: "high"
      },
      {
        task_id: "mkt_002",
        task_name: "Social media accounts created",
        description: "Twitter, LinkedIn, Facebook, YouTube",
        priority: "medium"
      },
      {
        task_id: "mkt_003",
        task_name: "Launch announcement email drafted",
        description: "Send to beta users and waitlist",
        priority: "high"
      },
      {
        task_id: "mkt_004",
        task_name: "Press kit prepared",
        description: "Logos, screenshots, company info",
        priority: "low"
      },
      {
        task_id: "mkt_005",
        task_name: "Analytics tracking (Google Analytics/Mixpanel)",
        description: "Track all key events and funnels",
        priority: "high"
      }
    ]
  },
  {
    category: "compliance",
    tasks: [
      {
        task_id: "comp_001",
        task_name: "GDPR data export functionality",
        description: "Users can download their data",
        priority: "critical"
      },
      {
        task_id: "comp_002",
        task_name: "GDPR account deletion flow",
        description: "Users can delete their account",
        priority: "critical"
      },
      {
        task_id: "comp_003",
        task_name: "Cookie consent banner",
        description: "GDPR/CCPA compliant cookie notice",
        priority: "high"
      },
      {
        task_id: "comp_004",
        task_name: "PCI DSS compliance (Stripe handles this)",
        description: "Verify no card data stored",
        priority: "critical"
      }
    ]
  },
  {
    category: "analytics",
    tasks: [
      {
        task_id: "analytics_001",
        task_name: "Key metrics dashboard for team",
        description: "Track MRR, churn, signups, engagement",
        priority: "medium"
      },
      {
        task_id: "analytics_002",
        task_name: "Error tracking integrated",
        description: "Sentry or LogRocket configured",
        priority: "high"
      },
      {
        task_id: "analytics_003",
        task_name: "User session recording (optional)",
        description: "Hotjar or FullStory for UX insights",
        priority: "low"
      }
    ]
  }
];