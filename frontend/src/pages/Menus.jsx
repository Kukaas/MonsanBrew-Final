import React, { useState } from "react";
import CustomerLayout from "../layouts/CustomerLayout";
import { useQuery } from "@tanstack/react-query";
import { categoryAPI, productAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import { Skeleton } from "../components/ui/skeleton";

export default function Menus() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories
  const {
    data: categories,
    isLoading: loadingCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryAPI.getAll();
      // Assume API returns array of category objects with a 'category' field
      return res.data || res || [];
    },
  });
  // Fetch products
  const {
    data: products,
    isLoading: loadingProducts,
    error: errorProducts,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await productAPI.getAll();
      return res.data || res || [];
    },
  });

  // Tabs: All, Featured, ...categories
  const [selectedTab, setSelectedTab] = useState("All");
  const tabs = [
    "All",
    "Featured",
    ...(categories ? categories.map((c) => c.category) : []),
  ];

  // Filter products by selected tab and search term
  let filteredProducts = products || [];

  // First filter by search term
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.productName.toLowerCase().includes(searchLower) ||
        p.category?.category?.toLowerCase().includes(searchLower)
    );
  }

  // Then filter by selected tab
  if (selectedTab === "Featured") {
    filteredProducts = filteredProducts.filter((p) => p.isFeatured);
  } else if (selectedTab !== "All") {
    filteredProducts = filteredProducts.filter(
      (p) => p.category?.category === selectedTab
    );
  }

  // Skeleton loading cards (white)
  const skeletonCards = Array.from({ length: 8 }).map((_, i) => (
    <div
      key={i}
      className="bg-white rounded-2xl shadow p-4 flex flex-col items-center w-full h-full"
    >
      <Skeleton className="w-28 h-28 rounded-xl mb-3 bg-gray-200" />
      <Skeleton className="h-6 w-24 mb-2 bg-gray-200" />
      <Skeleton className="h-4 w-16 mb-3 bg-gray-200" />
      <Skeleton className="h-9 w-full rounded-lg bg-gray-200" />
    </div>
  ));

  return (
    <CustomerLayout>
      <div className="bg-[#232323] min-h-screen w-full flex flex-col">
        <div className="flex-1 w-full flex flex-col items-center py-8">
          <div className="w-full max-w-6xl px-4 flex flex-col items-center">
            <h1 className="text-4xl font-extrabold text-center text-white mb-6">
              Menu
            </h1>
            <div className="mb-8 w-full">
              <div className="text-2xl font-bold text-[#FFC107] mb-1 w-full">
                Special For You
              </div>
              <input
                type="text"
                placeholder="Search on MonsanBrew"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-[500px] rounded-full px-4 py-2 bg-white text-black placeholder-gray-400 focus:outline-none"
              />
            </div>
            {/* Category Tabs */}
            <div className="flex gap-6 overflow-x-auto pb-2 mb-8 w-full custom-scrollbar whitespace-nowrap">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`text-lg font-bold pb-1 border-b-2 transition-colors flex-shrink-0 ${
                    selectedTab === tab
                      ? "text-[#FFC107] border-[#FFC107]"
                      : "text-[#BDBDBD] border-transparent hover:text-[#FFC107]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Loading/Error States */}
            {(loadingCategories || loadingProducts) && (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-8 w-full justify-center px-2 sm:px-4">
                {skeletonCards}
              </div>
            )}
            {(errorCategories || errorProducts) && (
              <div className="text-center text-red-500 py-8">
                Failed to load menu. Please try again.
              </div>
            )}
            {/* Product Grid */}
            {!(loadingCategories || loadingProducts) && (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-8 w-full justify-center px-2 sm:px-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
            {/* No products */}
            {!loadingProducts && filteredProducts.length === 0 && (
              <div className="text-center text-[#BDBDBD] py-8">
                No products found.
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
