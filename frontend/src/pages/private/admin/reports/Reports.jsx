import { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import PageLayout from "@/layouts/PageLayout";
import OverviewReport from "./components/OverviewReport.jsx";
import DeliveryReport from "./components/DeliveryReport.jsx";
import TopSellingReport from "./components/TopSellingReport.jsx";
import FeedbackReport from "./components/FeedbackReport.jsx";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview"); // overview | delivery | top | feedback

  return (
    <AdminLayout>
      <PageLayout
        title="Reports"
        description="Generate and export sales, delivery, and feedback reports."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { key: "overview", label: "Overview" },
            { key: "delivery", label: "Delivery Performance" },
            { key: "top", label: "Top-selling" },
            { key: "feedback", label: "Customer Feedback" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${activeTab === t.key
                  ? "bg-[#FFC107] text-black border-[#FFC107]"
                  : "bg-[#181818] text-[#BDBDBD] border-[#232323] hover:text-white"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewReport />}
        {activeTab === "delivery" && <DeliveryReport />}
        {activeTab === "top" && <TopSellingReport />}
        {activeTab === "feedback" && <FeedbackReport />}
      </PageLayout>
    </AdminLayout>
  );
}
