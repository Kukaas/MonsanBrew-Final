import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function ProfileAccountStatusCard({ user }) {
  return (
    <Card className="bg-[#2A2A2A] border-[#444]">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#FFC107]" /> Account Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 p-2 bg-[#333] rounded">
          <div
            className={`w-4 h-4 rounded-full flex-shrink-0 ${
              user?.isVerified ? "bg-green-500" : "bg-yellow-500"
            }`}
          ></div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Email Verification</p>
            <p
              className={`text-xs ${
                user?.isVerified ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {user?.isVerified ? "Verified" : "Pending Verification"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 bg-[#333] rounded">
          <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Account Status</p>
            <p className="text-green-400 text-xs">Active</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
