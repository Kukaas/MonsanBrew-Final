import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileAddressCard({
  isEditing,
  editData,
  user,
  handleInputChange,
  handleEditToggle,
  handleSaveProfile,
  handleCancel,
  isLoading,
}) {
  const addressFields = [
    { key: "lotNo", label: "Lot No." },
    { key: "purok", label: "Purok" },
    { key: "street", label: "Street" },
    { key: "landmark", label: "Landmark" },
    { key: "barangay", label: "Barangay" },
    { key: "municipality", label: "Municipality" },
    { key: "province", label: "Province" },
  ];

  return (
    <Card className="bg-[#2A2A2A] border-[#444]">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#FFC107]" /> Address Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {addressFields.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center gap-3 p-2 bg-[#333] rounded"
          >
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs font-medium">{label}</p>
              {isEditing ? (
                <input
                  type="text"
                  name={key}
                  value={editData[key] || ""}
                  onChange={handleInputChange}
                  className="bg-transparent border-none text-white text-sm w-full focus:outline-none"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              ) : (
                <p className="text-white text-sm">
                  {user?.[key] || "Not provided"}
                </p>
              )}
            </div>
          </div>
        ))}
        {!isEditing && (
          <div className="flex justify-center mt-4">
            <Button onClick={handleEditToggle} variant="yellow" size="sm">
              Edit Address
            </Button>
          </div>
        )}
        {isEditing && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              variant="yellow"
              size="sm"
              loading={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button onClick={handleCancel} variant="yellow-outline" size="sm">
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
