import PropTypes from "prop-types";
import ProfileAvatarCard from "./ProfileAvatarCard";
import ProfilePersonalInfoCard from "./ProfilePersonalInfoCard";
import ProfileAddressCard from "./ProfileAddressCard";
import ProfileAccountStatusCard from "./ProfileAccountStatusCard";
import ProfileQuickActionsCard from "./ProfileQuickActionsCard";
import ProfileRoleSpecificInfoCard from "./ProfileRoleSpecificInfoCard";
import CustomAlertDialog from "@/components/custom/CustomAlertDialog";
import Form from "@/components/custom/Form";
import FormInput from "@/components/custom/FormInput";
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
  changePasswordOpen,
  setChangePasswordOpen,
  changePasswordData,
  changePasswordErrors,
  handleChangePasswordInput,
  handleChangePasswordSubmit,
  handleChangePasswordCancel,
  changePasswordMutation,
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
                 {/* Change Password Dialog */}
         <CustomAlertDialog
           open={changePasswordOpen}
           onOpenChange={changePasswordMutation?.isPending ? undefined : setChangePasswordOpen}
           title="Change Password"
           description="Enter your current password and choose a new password"
         >
           <Form onSubmit={handleChangePasswordSubmit} className="space-y-4">
             <FormInput
               label="Current Password"
               type="password"
               name="currentPassword"
               value={changePasswordData?.currentPassword || ""}
               onChange={handleChangePasswordInput}
               error={changePasswordErrors?.currentPassword}
               variant="dark"
               placeholder="Enter your current password"
               required
             />
             <FormInput
               label="New Password"
               type="password"
               name="newPassword"
               value={changePasswordData?.newPassword || ""}
               onChange={handleChangePasswordInput}
               error={changePasswordErrors?.newPassword}
               variant="dark"
               placeholder="Enter your new password"
               required
             />
             <FormInput
               label="Confirm New Password"
               type="password"
               name="confirmPassword"
               value={changePasswordData?.confirmPassword || ""}
               onChange={handleChangePasswordInput}
               error={changePasswordErrors?.confirmPassword}
               variant="dark"
               placeholder="Confirm your new password"
               required
             />

             <div className="flex justify-end gap-3 pt-4">
               <Button
                 type="button"
                 variant="yellow-outline"
                 size="lg"
                 onClick={handleChangePasswordCancel}
                 disabled={changePasswordMutation?.isPending}
               >
                 Cancel
               </Button>
               <Button
                 type="submit"
                 variant="yellow"
                 size="lg"
                 disabled={changePasswordMutation?.isPending}
                 loading={changePasswordMutation?.isPending}
               >
                 Change Password
               </Button>
             </div>
           </Form>
         </CustomAlertDialog>
      </div>
    </div>
  );
}

AdminProfileGrid.propTypes = {
  fileInputRef: PropTypes.object,
  handleFileChange: PropTypes.func.isRequired,
  handleAvatarClick: PropTypes.func.isRequired,
  localPhoto: PropTypes.string,
  editData: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  getRoleDisplayName: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleEditToggle: PropTypes.func.isRequired,
  handleSaveProfile: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  quickActions: PropTypes.array.isRequired,
  roleSpecificInfo: PropTypes.object,
  logoutOpen: PropTypes.bool.isRequired,
  logoutLoading: PropTypes.bool.isRequired,
  setLogoutOpen: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
  changePasswordOpen: PropTypes.bool.isRequired,
  setChangePasswordOpen: PropTypes.func.isRequired,
  changePasswordData: PropTypes.object.isRequired,
  changePasswordErrors: PropTypes.object.isRequired,
  handleChangePasswordInput: PropTypes.func.isRequired,
  handleChangePasswordSubmit: PropTypes.func.isRequired,
  handleChangePasswordCancel: PropTypes.func.isRequired,
  changePasswordMutation: PropTypes.object.isRequired,
};
