import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default function ProfilePersonalInfoCard({
  user,
  getRoleDisplayName,
  formatDate,
}) {
  return (
    <Card className="bg-[#2A2A2A] border-[#444]">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-[#FFC107]" /> Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 p-2 bg-[#333] rounded">
          <Mail className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs font-medium">Email</p>
            <p className="text-white text-sm truncate">
              {user?.email || "Not provided"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 bg-[#333] rounded">
          <Calendar className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs font-medium">Member Since</p>
            <p className="text-white text-sm">{formatDate(user?.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 bg-[#333] rounded">
          <Shield className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs font-medium">Role</p>
            <p className="text-white text-sm capitalize">
              {getRoleDisplayName(user?.role)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
