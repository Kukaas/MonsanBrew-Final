import PropTypes from "prop-types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function ProfileRoleSpecificInfoCard({ roleSpecificInfo }) {
  if (!roleSpecificInfo) return null;
  const Icon = roleSpecificInfo.icon;
  return (
    <Card className="bg-[#2A2A2A] border-[#444] md:col-span-2">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Icon className="w-5 h-5 text-[#FFC107]" />
          {roleSpecificInfo.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roleSpecificInfo.items.map((item, index) => (
            <div key={index} className="p-3 bg-[#333] rounded-lg">
              <p className="text-white text-sm font-medium mb-1">
                {item.label}
              </p>
              <p className="text-gray-400 text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

ProfileRoleSpecificInfoCard.propTypes = {
  roleSpecificInfo: PropTypes.shape({
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })).isRequired,
  }),
};

export default ProfileRoleSpecificInfoCard;
