import React from "react";
import ProfileAvatarCard from "./ProfileAvatarCard";
import ProfilePersonalInfoCard from "./ProfilePersonalInfoCard";
import ProfileAddressCard from "./ProfileAddressCard";
import ProfileAccountStatusCard from "./ProfileAccountStatusCard";
import ProfileQuickActionsCard from "./ProfileQuickActionsCard";
import ProfileRoleSpecificInfoCard from "./ProfileRoleSpecificInfoCard";
import CustomAlertDialog from "@/components/custom/CustomAlertDialog";
import { Button } from "@/components/ui/button";

export default function AdminProfileGrid({
  fileInputRef,
  handleFileChange,
  handleAvatarClick,
  localPhoto,
  editData,
  user,
  getRoleDisplayName,
  formatDate,
  isEditing,
  handleInputChange,
  handleEditToggle,
  handleSaveProfile,
  handleCancel,
  isLoading,
  quickActions,
  roleSpecificInfo,
  logoutOpen,
  logoutLoading,
  setLogoutOpen,
  handleLogout,
}) {
  return (
    <div className="min-h-screen bg-[#232323] p-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avatar and Name */}
        <div className="col-span-1 md:col-span-2">
          <ProfileAvatarCard
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            handleAvatarClick={handleAvatarClick}
            localPhoto={localPhoto}
            editData={editData}
            user={user}
            getRoleDisplayName={getRoleDisplayName}
          />
        </div>
        {/* Personal Information */}
        <ProfilePersonalInfoCard
          user={user}
          getRoleDisplayName={getRoleDisplayName}
          formatDate={formatDate}
        />
        {/* Address Information (instead of Update Information) */}
        <ProfileAddressCard
          isEditing={isEditing}
          editData={editData}
          user={user}
          handleInputChange={handleInputChange}
          handleEditToggle={handleEditToggle}
          handleSaveProfile={handleSaveProfile}
          handleCancel={handleCancel}
          isLoading={isLoading}
        />
        {/* Account Status */}
        <ProfileAccountStatusCard user={user} />
        {/* Quick Actions */}
        <ProfileQuickActionsCard quickActions={quickActions} />
        {/* Role-specific Information Card */}
        <ProfileRoleSpecificInfoCard roleSpecificInfo={roleSpecificInfo} />
        {/* Logout Confirmation Dialog */}
        <CustomAlertDialog
          open={logoutOpen}
          onOpenChange={logoutLoading ? undefined : setLogoutOpen}
          title="Logout"
          description="Are you sure you want to logout?"
          actions={
            <>
              <Button
                type="button"
                variant="yellow-outline"
                size="lg"
                onClick={() => setLogoutOpen(false)}
                disabled={logoutLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="yellow"
                size="lg"
                onClick={handleLogout}
                disabled={logoutLoading}
                loading={logoutLoading}
              >
                Logout
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}
