import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  Mail,
  Zap,
  Target,
  Rocket,
  BarChart3,
  Users
} from "lucide-react";

export default function PartnerResources() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: partner } = useQuery({
    queryKey: ["partner", user?.email],
    queryFn: async () => {
      const partners = await base44.entities.PartnerAffiliate.filter({
        user_email: user.email
      });
      return partners[0] || null;
    },
    enabled: !!user
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["partnerContent"],
    queryFn: () => base44.entities.PartnerContent.list("-created_date", 100),
    enabled: !!user
  });

  const filterResources = (category) => {
    return resources.filter(r => 
      r.category === category && 
      r.is_published &&
      (r.partner_type_access.includes(partner?.partner_type) || r.partner_type_access.includes('all'))
    );
  };

  const ResourceCard = ({ resource }) => {
    const getIcon = (type) => {
      if (type === 'pdf') return FileText;
      if (type === 'image') return ImageIcon;
      if (type === 'video') return Video;
      return FileText;
    };

    const Icon = getIcon(resource.content_type);

    return (
      <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#FFD700]/50 transition-all">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-[#FFD700]" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold text-sm mb-1">{resource.title}</h4>
            <p className="text-gray-400 text-xs">{resource.description}</p>
          </div>
        </div>

        {resource.thumbnail_url && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img src={resource.thumbnail_url} alt={resource.title} className="w-full h-32 object-cover" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {resource.tags.map((tag, idx) => (
              <Badge key={idx} className="bg-gray-700 text-gray-300 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <a href={resource.file_url} target="_blank" rel="noopener" download>
            <Button size="sm" className="bg-[#00D4C9]/20 text-[#00D4C9] hover:bg-[#00D4C9]/30">
              <Download className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Rocket className="w-8 h-8 text-[#FFD700]" />
            Partner Resources
          </h1>
          <p className="text-gray-400">
            Marketing assets, email swipes, ad creatives, and training materials
          </p>
        </div>

        <Tabs defaultValue="logos" className="space-y-6">
          <TabsList className="bg-[#111]">
            <TabsTrigger value="logos">
              <ImageIcon className="w-4 h-4 mr-2" />
              Logos & Branding
            </TabsTrigger>
            <TabsTrigger value="ads">
              <Target className="w-4 h-4 mr-2" />
              Ad Creatives
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="w-4 h-4 mr-2" />
              Email Swipes
            </TabsTrigger>
            <TabsTrigger value="comparisons">
              <BarChart3 className="w-4 h-4 mr-2" />
              Comparisons
            </TabsTrigger>
            <TabsTrigger value="training">
              <Video className="w-4 h-4 mr-2" />
              Training
            </TabsTrigger>
          </TabsList>

          {/* Logos Tab */}
          <TabsContent value="logos">
            <div className="grid md:grid-cols-3 gap-4">
              {filterResources('logos').length > 0 ? (
                filterResources('logos').map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">Logo pack coming soon!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads">
            <div className="grid md:grid-cols-2 gap-4">
              {filterResources('ads').length > 0 ? (
                filterResources('ads').map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <Target className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">Ad creative pack coming soon!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails">
            <div className="grid md:grid-cols-2 gap-4">
              {filterResources('emails').length > 0 ? (
                filterResources('emails').map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">Email swipe files coming soon!</p>
                  <p className="text-gray-500 text-xs mt-1">
                    7-email nurture sequence for cold → close
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Comparisons Tab */}
          <TabsContent value="comparisons">
            <div className="grid md:grid-cols-2 gap-4">
              {filterResources('comparisons').length > 0 ? (
                filterResources('comparisons').map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">Comparison matrix coming soon!</p>
                  <p className="text-gray-500 text-xs mt-1">
                    AI Freedom vs Synthesia, ClickFunnels, HubSpot, etc.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training">
            <div className="grid md:grid-cols-2 gap-4">
              {filterResources('training').length > 0 ? (
                filterResources('training').map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <Video className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">Training videos coming soon!</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Platform walkthrough, sales techniques, demo scripts
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>

        {/* Quick Links */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3">
              <a href="https://docs.aifreedomduane.com/partners" target="_blank" rel="noopener">
                <Button variant="outline" className="w-full border-gray-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Partner Documentation
                </Button>
              </a>
              <a href="https://community.aifreedomduane.com" target="_blank" rel="noopener">
                <Button variant="outline" className="w-full border-gray-700 text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Partner Community
                </Button>
              </a>
              <a href="mailto:partners@aifreedomduane.com">
                <Button variant="outline" className="w-full border-gray-700 text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}