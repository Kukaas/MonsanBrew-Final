import PropTypes from "prop-types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomAlertDialog from "@/components/custom/CustomAlertDialog";
import MapSelector from "@/components/custom/MapSelector";

function ProfileAddressCard({
  isEditing,
  editData,
  user,
  handleInputChange,
  handleEditToggle,
  handleSaveProfile,
  handleCancel,
  isLoading,
}) {
  const navigate = useNavigate();
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [coordinates, setCoordinates] = useState({
    latitude: user?.latitude || 13.323830,
    longitude: user?.longitude || 121.845809
  });
  const addressFields = [
    { key: "lotNo", label: "Lot No." },
    { key: "purok", label: "Purok" },
    { key: "street", label: "Street" },
    { key: "landmark", label: "Landmark" },
    { key: "barangay", label: "Barangay" },
    { key: "municipality", label: "Municipality" },
    { key: "province", label: "Province" },
  ];

  const handleLocationSelect = (locationData) => {
    setCoordinates({
      latitude: locationData.latitude,
      longitude: locationData.longitude
    });
    setShowMapDialog(false);
  };

  // For customers, show read-only address with "Manage Addresses" button
  const isCustomer = user?.role === "customer";

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
              {isEditing && !isCustomer ? (
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

        {/* For customers: Show "Manage Addresses" button */}
        {isCustomer && !isEditing && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              onClick={() => navigate('/profile/addresses')}
              variant="yellow"
              size="sm"
            >
              Manage Addresses
            </Button>
          </div>
        )}

        {/* For other roles: Show edit/save buttons */}
        {!isCustomer && !isEditing && (
          <div className="flex justify-center gap-2 mt-4">
            <Button onClick={handleEditToggle} variant="yellow" size="sm">
              Edit Address
            </Button>
            <Button
              onClick={() => setShowMapDialog(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Set Location
            </Button>
          </div>
        )}
        {!isCustomer && isEditing && (
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

      {/* Map Selector Dialog - Only for non-customers */}
      {!isCustomer && (
        <CustomAlertDialog
          open={showMapDialog}
          onOpenChange={setShowMapDialog}
          title="Set Location on Map"
          description="Select your delivery location on the map"
          className="max-w-2xl"
          actions={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMapDialog(false)}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="p-4">
            <MapSelector
              onLocationSelect={handleLocationSelect}
              initialLatitude={coordinates.latitude}
              initialLongitude={coordinates.longitude}
              className="mb-4"
            />
            <div className="text-xs text-gray-400 mt-2">
              Current coordinates: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
            </div>
          </div>
        </CustomAlertDialog>
      )}
    </Card>
  );
}

ProfileAddressCard.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  editData: PropTypes.object.isRequired,
  user: PropTypes.object,
  handleInputChange: PropTypes.func.isRequired,
  handleEditToggle: PropTypes.func.isRequired,
  handleSaveProfile: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default ProfileAddressCard;
