import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

// Sidebar route mappings for admin
const routeMap = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/categories": "Product Category",
  "/add-ons": "Add ons",
  "/users": "User Management",
  "/raw-materials": "Raw Materials Inventory",
  "/orders": "Orders",
  "/ingredients": "Ingredients",
};

export default function AdminHeader() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  // Remove 'admin' from the pathnames for breadcrumb display
  const filteredPathnames =
    pathnames[0] === "admin" ? pathnames.slice(1) : pathnames;

  // Build breadcrumbs for admin routes
  let breadcrumbs = [];
  let accumulated = "";
  filteredPathnames.forEach((segment, idx) => {
    accumulated += `/${segment}`;
    const isLast = idx === filteredPathnames.length - 1;
    const name =
      routeMap[accumulated] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({
      name,
      url: `/admin${accumulated}`,
      isLast,
    });
  });

  return (
    <header className="sticky top-0 z-40 flex items-center h-16 bg-[#232323] border-b border-[#181818] px-6 whitespace-nowrap overflow-hidden">
      <div className="flex items-center gap-2 w-full min-w-0">
        <SidebarTrigger className="p-2 rounded bg-[#181818] text-white shadow-lg flex-shrink-0" />
        <Breadcrumb className="ml-2 w-full min-w-0 overflow-hidden">
          <BreadcrumbList className="text-[#FFC107] font-bold flex items-center w-full min-w-0 overflow-hidden">
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="text-[#FFC107] hover:text-white font-bold max-w-[120px] truncate inline-block align-middle"
              >
                <Link
                  to="/admin/dashboard"
                  className="truncate inline-block align-middle max-w-[120px]"
                >
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, idx) =>
              crumb.url === "/admin/dashboard" ? null : (
                <React.Fragment key={crumb.url}>
                  <BreadcrumbSeparator className="text-[#FFC107] font-bold" />
                  <BreadcrumbItem>
                    {crumb.isLast ? (
                      <BreadcrumbPage
                        className="text-white font-bold max-w-[120px] truncate inline-block align-middle"
                        title={crumb.name}
                      >
                        {crumb.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        asChild
                        className="text-[#FFC107] hover:text-white font-bold max-w-[120px] truncate inline-block align-middle"
                      >
                        <Link
                          to={crumb.url}
                          className="truncate inline-block align-middle max-w-[120px]"
                          title={crumb.name}
                        >
                          {crumb.name}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              )
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
