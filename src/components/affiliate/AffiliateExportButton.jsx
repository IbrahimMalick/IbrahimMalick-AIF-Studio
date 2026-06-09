import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, ChevronDown } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";
import { format } from "date-fns";

export default function AffiliateExportButton({ commissions, clicks, links }) {
  const [open, setOpen] = useState(false);

  const handleExportEarnings = () => {
    const rows = commissions.map((c) => ({
      date: c.created_date ? format(new Date(c.created_date), "yyyy-MM-dd") : "",
      referred_email: c.referred_email || "",
      sale_amount: c.sale_amount || 0,
      commission_rate: c.commission_rate || 0,
      commission_amount: c.commission_amount || 0,
      status: c.status || "",
      paid_at: c.paid_at ? format(new Date(c.paid_at), "yyyy-MM-dd") : "",
      campaign: c.campaign || "",
    }));
    exportToCsv(rows, `affiliate_earnings_${format(new Date(), "yyyy-MM-dd")}.csv`);
    setOpen(false);
  };

  const handleExportClicks = () => {
    const rows = clicks.map((c) => ({
      date: c.created_date ? format(new Date(c.created_date), "yyyy-MM-dd HH:mm") : "",
      landing_page: c.landing_page || "/",
      referrer_url: c.referrer_url || "Direct",
      converted: c.converted ? "Yes" : "No",
      affiliate_code: c.affiliate_code || "",
    }));
    exportToCsv(rows, `affiliate_clicks_${format(new Date(), "yyyy-MM-dd")}.csv`);
    setOpen(false);
  };

  const handleExportLinks = () => {
    const rows = links.map((l) => ({
      campaign_name: l.campaign_name || "Default Campaign",
      full_url: l.full_url || "",
      clicks: l.click_count || 0,
      signups: l.signups || 0,
      conversions: l.conversions || 0,
      created_date: l.created_date ? format(new Date(l.created_date), "yyyy-MM-dd") : "",
    }));
    exportToCsv(rows, `affiliate_links_${format(new Date(), "yyyy-MM-dd")}.csv`);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 bg-transparent">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
          <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-200 w-52">
        <DropdownMenuItem
          onClick={handleExportEarnings}
          className="hover:bg-slate-700 cursor-pointer"
          disabled={commissions.length === 0}
        >
          💰 Earnings & Commissions
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportClicks}
          className="hover:bg-slate-700 cursor-pointer"
          disabled={clicks.length === 0}
        >
          🖱️ Click Activity Log
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportLinks}
          className="hover:bg-slate-700 cursor-pointer"
          disabled={links.length === 0}
        >
          🔗 Referral Links
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}