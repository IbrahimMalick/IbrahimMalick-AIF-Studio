import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Share2,
  Copy,
  Mail,
  Users,
  Link2,
  Lock,
  Eye,
  Edit3,
  CheckCircle2,
  Download,
  Calendar,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";

export default function ShareProjectModal({ project, onClose, currentUser }) {
  const queryClient = useQueryClient();
  const [shareType, setShareType] = useState("user");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState("view");
  const [customMessage, setCustomMessage] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [linkExpiry, setLinkExpiry] = useState("7");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const shareMutation = useMutation({
    mutationFn: async (data) => {
      const shareData = await base44.entities.ProjectShare.create(data);
      
      if (data.share_type === "user") {
        await base44.integrations.Core.SendEmail({
          to: data.shared_with,
          subject: `${currentUser.full_name || currentUser.email} shared a video project with you`,
          body: `Hi,

${currentUser.full_name || currentUser.email} has shared the video project "${project.title}" with you.

${customMessage ? `Message: ${customMessage}\n\n` : ''}Access Level: ${accessLevel}

Click here to view: ${window.location.origin}${window.location.pathname}

Best regards,
AI Freedom Studios`
        });
      }
      
      return shareData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["projectShares"]);
      if (data.share_link) {
        setGeneratedLink(data.share_link);
      }
    },
  });

  const handleShare = async () => {
    if (shareType === "user" && !recipientEmail) {
      alert("Please enter an email address");
      return;
    }

    setIsSharing(true);

    const shareData = {
      project_id: project.id,
      shared_by: currentUser.email,
      shared_with: shareType === "user" ? recipientEmail : "public",
      share_type: shareType,
      access_level: accessLevel,
      custom_message: customMessage,
      allow_download: accessLevel === "full",
      notification_sent: shareType === "user"
    };

    if (shareType === "public_link") {
      const uniqueLink = `${window.location.origin}/shared/${project.id}/${Math.random().toString(36).substring(7)}`;
      shareData.share_link = uniqueLink;
      shareData.link_expires_at = new Date(Date.now() + parseInt(linkExpiry) * 24 * 60 * 60 * 1000).toISOString();
      
      if (linkPassword) {
        shareData.password_protected = true;
        shareData.password_hash = linkPassword;
      }
    }

    await shareMutation.mutateAsync(shareData);
    
    if (shareType === "user") {
      alert("✅ Project shared successfully!\n\nInvitation email sent.");
      onClose();
    } else {
      alert("✅ Share link generated!");
    }
    
    setIsSharing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("✅ Link copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111317] border-2 border-gray-800 rounded-2xl max-w-2xl w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Share2 className="w-6 h-6 text-[#FFD700]" />
                Share Project
              </h2>
              <p className="text-gray-400 text-sm mt-1">Share "{project.title}" with others</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            
            {/* Share Type Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShareType("user")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  shareType === "user"
                    ? 'border-[#FFD700] bg-[#FFD700]/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <Mail className="w-8 h-8 text-[#FFD700] mb-2" />
                <h3 className="text-white font-semibold mb-1">Share with User</h3>
                <p className="text-gray-400 text-xs">Send email invitation</p>
              </button>
              
              <button
                onClick={() => setShareType("public_link")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  shareType === "public_link"
                    ? 'border-[#FFD700] bg-[#FFD700]/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <Link2 className="w-8 h-8 text-[#00D4C9] mb-2" />
                <h3 className="text-white font-semibold mb-1">Create Link</h3>
                <p className="text-gray-400 text-xs">Anyone with link can access</p>
              </button>
            </div>

            {/* Share with User */}
            {shareType === "user" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Recipient Email</label>
                  <Input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="colleague@email.com"
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Access Level</label>
                  <Select value={accessLevel} onValueChange={setAccessLevel}>
                    <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          View Only
                        </div>
                      </SelectItem>
                      <SelectItem value="comment">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          View & Comment
                        </div>
                      </SelectItem>
                      <SelectItem value="edit">
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-4 h-4" />
                          Edit Project
                        </div>
                      </SelectItem>
                      <SelectItem value="full">
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Full Access (Edit + Download)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Message (Optional)</label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Public Link */}
            {shareType === "public_link" && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Link Expires In</label>
                    <Select value={linkExpiry} onValueChange={setLinkExpiry}>
                      <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Day</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="365">1 Year</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Password (Optional)</label>
                    <Input
                      type="text"
                      value={linkPassword}
                      onChange={(e) => setLinkPassword(e.target.value)}
                      placeholder="Leave empty for no password"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Access Level</label>
                  <Select value={accessLevel} onValueChange={setAccessLevel}>
                    <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="comment">View & Comment</SelectItem>
                      <SelectItem value="full">View & Download</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {generatedLink && (
                  <div className="bg-[#0B0B0C] rounded-xl p-4 border border-green-500/30">
                    <p className="text-green-400 text-sm font-semibold mb-2">✅ Share Link Generated</p>
                    <div className="flex gap-2">
                      <Input
                        value={generatedLink}
                        readOnly
                        className="flex-1 bg-[#111317] border-gray-700 text-white rounded-lg"
                      />
                      <Button
                        onClick={copyToClipboard}
                        className="bg-[#FFD700] text-black hover:bg-[#FFC700] rounded-lg"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      {linkPassword && (
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Password protected
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Expires in {linkExpiry === "never" ? "Never" : `${linkExpiry} days`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={isSharing || (shareType === "user" && !recipientEmail)}
                className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-semibold"
              >
                {isSharing ? "Sharing..." : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    {shareType === "user" ? "Send Invitation" : "Generate Link"}
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}