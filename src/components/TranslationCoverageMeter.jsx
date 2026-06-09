import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Globe, CheckCircle2, AlertTriangle, Languages } from "lucide-react";

export default function TranslationCoverageMeter({ lang, coverage, totalKeys = 100, translatedKeys, missing = [] }) {
  const coveragePercent = coverage || ((translatedKeys / Math.max(totalKeys, 1)) * 100);
  
  const getStatus = () => {
    if (coveragePercent >= 95) return { color: "text-green-400", bg: "bg-green-500", icon: CheckCircle2, label: "Excellent" };
    if (coveragePercent >= 75) return { color: "text-yellow-400", bg: "bg-yellow-500", icon: Languages, label: "Good" };
    return { color: "text-red-400", bg: "bg-red-500", icon: AlertTriangle, label: "Needs Work" };
  };

  const status = getStatus();
  const Icon = status.icon;

  const languageNames = {
    en: "English",
    es: "Español",
    fr: "Français",
    pt: "Português",
    de: "Deutsch",
    it: "Italiano",
    ar: "العربية",
    ja: "日本語",
    zh: "中文"
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {languageNames[lang] || lang.toUpperCase()}
          </CardTitle>
          <Badge className={`${status.bg}/20 ${status.color}`}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`w-5 h-5 ${status.color}`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs">Coverage</span>
              <span className={`font-bold ${status.color}`}>
                {coveragePercent.toFixed(1)}%
              </span>
            </div>
            <Progress value={coveragePercent} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2 bg-[#0B0B0C] rounded">
            <p className="text-gray-500">Translated</p>
            <p className="text-white font-bold">{translatedKeys || Math.round(totalKeys * (coveragePercent / 100))}</p>
          </div>
          <div className="p-2 bg-[#0B0B0C] rounded">
            <p className="text-gray-500">Missing</p>
            <p className="text-red-400 font-bold">
              {missing?.length || (totalKeys - (translatedKeys || 0))}
            </p>
          </div>
        </div>

        {missing && missing.length > 0 && missing.length <= 5 && (
          <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded">
            <p className="text-red-400 text-xs font-semibold mb-1">Missing Keys:</p>
            <div className="space-y-1">
              {missing.slice(0, 5).map((key, idx) => (
                <code key={idx} className="text-gray-400 text-xs font-mono block">
                  {key}
                </code>
              ))}
            </div>
          </div>
        )}

        {coveragePercent < 75 && (
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
            💡 Enable I18n Auto-Fill to automatically translate missing keys
          </div>
        )}

      </CardContent>
    </Card>
  );
}