import PropTypes from "prop-types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Camera } from "lucide-react";

function ProfileAvatarCard({
  fileInputRef,
  handleFileChange,
  handleAvatarClick,
  localPhoto,
  editData,
  user,
  getRoleDisplayName,
}) {
  return (
    <div className="bg-[#2A2A2A] border-[#444] rounded-xl flex flex-col items-center py-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        className="relative w-24 h-24 group cursor-pointer mb-2"
        onClick={handleAvatarClick}
      >
        <Avatar className="w-24 h-24">
          {localPhoto ? (
            <AvatarImage
              src={localPhoto}
              alt={editData.name || "Profile"}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-[#FFC107] text-black text-3xl font-bold">
            {editData.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Camera className="w-7 h-7 text-white" />
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">
          {user?.name || "User"}
        </h2>
        <Badge className="bg-[#FFC107]/20 text-[#FFC107] border-[#FFC107]/30 w-fit mx-auto mt-2">
          <Shield className="w-3 h-3 mr-1" />
          {getRoleDisplayName(user?.role)}
        </Badge>
        <p className="text-gray-400 text-xs mt-2">
          Click photo to change profile picture
        </p>
      </div>
    </div>
  );
}

ProfileAvatarCard.propTypes = {
  fileInputRef: PropTypes.object,
  handleFileChange: PropTypes.func.isRequired,
  handleAvatarClick: PropTypes.func.isRequired,
  localPhoto: PropTypes.string,
  editData: PropTypes.object.isRequired,
  user: PropTypes.object,
  getRoleDisplayName: PropTypes.func.isRequired,
};

export default ProfileAvatarCard;
