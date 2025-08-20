import PropTypes from "prop-types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function ProfileQuickActionsCard({ quickActions }) {
  return (
    <Card className="bg-[#2A2A2A] border-[#444]">
      <CardHeader>
        <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickActions.map((action, index) => {
          const isLogout = action.title === "Logout";
          return (
            <button
              key={index}
              onClick={action.action}
              className={
                "w-full p-3 rounded-lg text-left transition-colors flex items-center " +
                (isLogout
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-[#333] hover:bg-[#444] text-white")
              }
            >
              <div className="flex items-center gap-3">
                <action.icon
                  className={
                    isLogout
                      ? "w-4 h-4 text-white flex-shrink-0"
                      : "w-4 h-4 text-[#FFC107] flex-shrink-0"
                  }
                />
                <div>
                  <p className="text-white text-sm font-medium">
                    {action.title}
                  </p>
                  <p
                    className={
                      isLogout
                        ? "text-red-200 text-xs"
                        : "text-gray-400 text-xs"
                    }
                  >
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

ProfileQuickActionsCard.propTypes = {
  quickActions: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired,
    icon: PropTypes.elementType.isRequired,
  })).isRequired,
};

export default ProfileQuickActionsCard;
