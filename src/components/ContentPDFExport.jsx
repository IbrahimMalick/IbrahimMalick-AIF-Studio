import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
}

function buildPDFHTML(generations, user) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const typeColor = (type) => {
    if (type === 'social_post') return '#00D4C9';
    if (type === 'email_copy') return '#60A5FA';
    return '#A78BFA';
  };

  const statusColor = (status) => {
    if (status === 'deployed') return '#4ADE80';
    if (status === 'reviewed') return '#FBBF24';
    return '#9CA3AF';
  };

  const renderContent = (gen) => {
    const gc = gen.generated_content;
    if (!gc) return '<p style="color:#9CA3AF;font-style:italic;">No content data available.</p>';

    const sections = [];

    if (gc.social_posts?.length) {
      gc.social_posts.forEach((post, i) => {
        sections.push(`
          <div style="margin-bottom:12px;">
            <span style="font-size:11px;font-weight:600;color:#00D4C9;text-transform:uppercase;letter-spacing:0.05em;">${post.platform || `Post ${i + 1}`}</span>
            <p style="margin:6px 0 4px;color:#E2E8F0;font-size:13px;line-height:1.6;">${post.copy || ''}</p>
            ${post.hashtags?.length ? `<p style="color:#60A5FA;font-size:11px;margin:0;">${post.hashtags.map(h => `#${h}`).join(' ')}</p>` : ''}
          </div>
        `);
      });
    }

    if (gc.email_variations?.length) {
      gc.email_variations.forEach((email, i) => {
        sections.push(`
          <div style="margin-bottom:12px;">
            <span style="font-size:11px;font-weight:600;color:#60A5FA;text-transform:uppercase;letter-spacing:0.05em;">Email ${i + 1} — ${email.campaign_type || ''}</span>
            <p style="margin:6px 0 2px;color:#E2E8F0;font-weight:600;font-size:13px;">Subject: ${email.subject_line || ''}</p>
            ${email.preview_text ? `<p style="margin:0 0 4px;color:#9CA3AF;font-size:12px;font-style:italic;">${email.preview_text}</p>` : ''}
            <p style="color:#CBD5E1;font-size:12px;line-height:1.6;">${stripHtml(email.body_text || email.body_html || '')}</p>
          </div>
        `);
      });
    }

    if (gc.seo_variations?.length) {
      gc.seo_variations.forEach((seo, i) => {
        sections.push(`
          <div style="margin-bottom:12px;">
            <span style="font-size:11px;font-weight:600;color:#A78BFA;text-transform:uppercase;letter-spacing:0.05em;">SEO Variant ${i + 1}</span>
            <p style="margin:6px 0 2px;color:#E2E8F0;font-weight:600;font-size:13px;">${seo.title || ''}</p>
            <p style="color:#9CA3AF;font-size:12px;line-height:1.5;">${seo.meta_description || ''}</p>
            ${seo.focus_keyword ? `<p style="color:#A78BFA;font-size:11px;margin:4px 0 0;">Keyword: ${seo.focus_keyword}</p>` : ''}
          </div>
        `);
      });
    }

    return sections.length ? sections.join('') : '<p style="color:#9CA3AF;font-style:italic;">Content details not available.</p>';
  };

  const cards = generations.map((gen, idx) => `
    <div style="background:#111317;border:1px solid #1E293B;border-radius:12px;padding:24px;margin-bottom:20px;page-break-inside:avoid;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
            <span style="background:${typeColor(gen.generation_type)}20;color:${typeColor(gen.generation_type)};padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;">
              ${(gen.generation_type || '').replace(/_/g, ' ').toUpperCase()}
            </span>
            <span style="background:${statusColor(gen.status)}20;color:${statusColor(gen.status)};padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;">
              ${(gen.status || 'draft').toUpperCase()}
            </span>
            ${gen.tone ? `<span style="background:#374151;color:#9CA3AF;padding:3px 10px;border-radius:999px;font-size:11px;">${gen.tone}</span>` : ''}
          </div>
          <h3 style="margin:0;color:#F1F5F9;font-size:15px;font-weight:700;">${gen.input_data?.topic || gen.input_data?.product_name || 'Untitled Generation'}</h3>
          <p style="margin:4px 0 0;color:#64748B;font-size:11px;">Generated ${new Date(gen.created_date).toLocaleString()}</p>
        </div>
        ${gen.quality_score ? `
          <div style="text-align:center;background:#1E293B;padding:10px 16px;border-radius:8px;">
            <div style="font-size:22px;font-weight:800;color:#FFD700;">${gen.quality_score}</div>
            <div style="font-size:10px;color:#64748B;text-transform:uppercase;">Quality</div>
          </div>
        ` : ''}
      </div>
      <div style="border-top:1px solid #1E293B;padding-top:16px;">
        ${renderContent(gen)}
      </div>
      ${gen.engagement_prediction ? `
        <div style="border-top:1px solid #1E293B;padding-top:14px;margin-top:14px;display:flex;gap:24px;">
          <div><span style="color:#64748B;font-size:11px;">Est. Reach</span><br><span style="color:#F1F5F9;font-weight:700;font-size:13px;">${(gen.engagement_prediction.estimated_reach || 0).toLocaleString()}</span></div>
          <div><span style="color:#64748B;font-size:11px;">Engagement</span><br><span style="color:#F1F5F9;font-weight:700;font-size:13px;">${((gen.engagement_prediction.estimated_engagement_rate || 0) * 100).toFixed(1)}%</span></div>
          <div><span style="color:#64748B;font-size:11px;">Viral Prob.</span><br><span style="color:#F1F5F9;font-weight:700;font-size:13px;">${((gen.engagement_prediction.viral_probability || 0) * 100).toFixed(0)}%</span></div>
        </div>
      ` : ''}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AI Content Collection Export</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0B0B0C; color: #E2E8F0; padding: 40px; }
  @media print {
    body { padding: 20px; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
  <!-- Cover / Header -->
  <div style="background:linear-gradient(135deg,#1E293B 0%,#0F172A 100%);border:1px solid #2D3748;border-radius:16px;padding:40px;margin-bottom:32px;">
    <div style="font-size:36px;margin-bottom:12px;">✨</div>
    <h1 style="font-size:28px;font-weight:800;color:#F1F5F9;margin-bottom:6px;">AI Content Collection</h1>
    <p style="color:#64748B;font-size:14px;">Exported by ${user?.full_name || user?.email || 'User'} &nbsp;·&nbsp; ${date}</p>
    <div style="display:flex;gap:20px;margin-top:24px;flex-wrap:wrap;">
      <div style="background:#0F172A;padding:14px 20px;border-radius:10px;min-width:100px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:#FFD700;">${generations.length}</div>
        <div style="font-size:11px;color:#64748B;text-transform:uppercase;margin-top:2px;">Total Items</div>
      </div>
      <div style="background:#0F172A;padding:14px 20px;border-radius:10px;min-width:100px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:#4ADE80;">${generations.filter(g => g.status === 'deployed').length}</div>
        <div style="font-size:11px;color:#64748B;text-transform:uppercase;margin-top:2px;">Deployed</div>
      </div>
      <div style="background:#0F172A;padding:14px 20px;border-radius:10px;min-width:100px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:#00D4C9;">${generations.filter(g => g.generation_type === 'social_post').length}</div>
        <div style="font-size:11px;color:#64748B;text-transform:uppercase;margin-top:2px;">Social</div>
      </div>
      <div style="background:#0F172A;padding:14px 20px;border-radius:10px;min-width:100px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:#60A5FA;">${generations.filter(g => g.generation_type === 'email_copy').length}</div>
        <div style="font-size:11px;color:#64748B;text-transform:uppercase;margin-top:2px;">Email</div>
      </div>
    </div>
  </div>

  <!-- Content Cards -->
  ${cards || '<div style="text-align:center;padding:60px;color:#64748B;">No content to export.</div>'}

  <!-- Footer -->
  <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #1E293B;">
    <p style="color:#334155;font-size:12px;">© 2024 AI Freedom Studios · Generated on ${date}</p>
  </div>

  <script>window.print(); window.close();</script>
</body>
</html>`;
}

export default function ContentPDFExport({ generations = [], user }) {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    if (!generations.length) return;
    setLoading(true);

    const html = buildPDFHTML(generations, user);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }

    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={loading || generations.length === 0}
      variant="outline"
      className="border-gray-700 text-gray-300 hover:text-white hover:border-[#FFD700] gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      Export PDF ({generations.length})
    </Button>
  );
}