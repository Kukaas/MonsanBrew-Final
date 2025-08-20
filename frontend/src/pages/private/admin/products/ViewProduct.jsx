import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productAPI } from "@/services/api";
import AdminLayout from "@/layouts/AdminLayout";
import PageLayout from "@/layouts/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: product,
    isLoading,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await productAPI.getById(id);
      return res.data || res;
    },
  });

  if (isLoading)
    return (
      <AdminLayout>
        <PageLayout
          title="Product Information"
          description="See all details for this product."
        >
          <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-8 w-32 rounded" />
          </div>
          <div className="w-full max-w-7xl mx-auto bg-[#181818]/80 p-4 sm:p-8 md:p-12 rounded-3xl border border-[#232323] flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-20 items-stretch shadow-2xl backdrop-blur-md">
            {/* Image section */}
            <div className="flex-shrink-0 flex flex-col items-center md:items-start w-full md:w-[350px] lg:w-[500px]">
              <Skeleton className="w-full aspect-[4/3] rounded-2xl border-4 border-[#FFC107]" />
              <div className="mt-6 flex flex-wrap gap-4 w-full">
                <Skeleton className="h-10 w-32 rounded" />
                <Skeleton className="h-10 w-32 rounded" />
              </div>
            </div>
            {/* Details section */}
            <div className="flex-1 flex flex-col gap-8 md:gap-12 justify-center">
              {/* Product Info */}
              <div>
                <Skeleton className="h-8 w-48 mb-6 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-4 md:gap-y-5 text-xl">
                  <Skeleton className="h-7 w-64 mb-2 rounded" />
                  <Skeleton className="h-7 w-64 mb-2 rounded" />
                  <Skeleton className="h-7 w-64 mb-2 rounded" />
                  <Skeleton className="h-7 w-64 mb-2 rounded" />
                </div>
                <div className="mt-4 md:mt-6">
                  <Skeleton className="h-7 w-64 md:w-96 rounded" />
                </div>
              </div>
              <div className="border-t border-[#232323] my-4" />
              {/* Add-ons */}
              <div>
                <Skeleton className="h-8 w-48 mb-4 md:mb-6 rounded" />
                <Skeleton className="h-7 w-40 md:w-64 mb-2 rounded" />
                <Skeleton className="h-7 w-40 md:w-64 mb-2 rounded" />
              </div>
              <div className="border-t border-[#232323] my-4" />
              {/* Ingredients */}
              <div>
                <Skeleton className="h-8 w-48 mb-4 md:mb-6 rounded" />
                <Skeleton className="h-7 w-40 md:w-64 mb-2 rounded" />
                <Skeleton className="h-7 w-40 md:w-64 mb-2 rounded" />
              </div>
            </div>
          </div>
        </PageLayout>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <PageLayout
        title="Product Information"
        description="See all details for this product."
      >
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="yellow"
            size="icon"
            className="shadow-lg hover:scale-105 transition-transform duration-200"
            onClick={() => navigate("/admin/products")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <span className="font-extrabold text-2xl text-white tracking-wide">
            Go back
          </span>
        </div>
        <div className="w-full max-w-7xl mx-auto bg-[#181818]/80 p-12 rounded-3xl border border-[#232323] flex flex-col md:flex-row gap-12 md:gap-20 items-stretch shadow-2xl backdrop-blur-md">
          {/* Image section */}
          <div className="flex-shrink-0 flex flex-col items-center md:items-start w-full md:w-[500px]">
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#232323] to-[#1a1a1a] rounded-2xl border-4 border-[#FFC107] overflow-hidden flex items-center justify-center shadow-xl group">
              {product.image ? (
                <img
                  src={product.image}
                  alt="Product"
                  className="object-contain w-full h-full max-h-[400px] transition-transform duration-300 group-hover:scale-110 bg-[#232323]"
                />
              ) : (
                <span className="text-[#BDBDBD] text-center text-xl">
                  No image
                </span>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Badge
                variant={product.isAvailable ? "outline" : "destructive"}
                className={
                  product.isAvailable
                    ? "border-green-400 text-green-400 px-6 py-2 text-lg font-semibold shadow-md bg-[#1a2e1a]/60"
                    : "border-red-400 text-red-400 px-6 py-2 text-lg font-semibold shadow-md bg-[#2e1a1a]/60"
                }
              >
                {product.isAvailable ? (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2" />
                )}
                {product.isAvailable ? "Available" : "Not Available"}
              </Badge>
              <Badge
                variant={product.isCustomizable ? "yellow" : "outline"}
                className={
                  product.isCustomizable
                    ? "border-[#FFC107] text-black bg-gradient-to-r from-[#FFD600] to-[#FFC107] px-6 py-2 text-lg font-semibold shadow-md"
                    : "border-gray-400 text-gray-400 px-6 py-2 text-lg font-semibold shadow-md"
                }
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {product.isCustomizable ? "Customizable" : "Standard"}
              </Badge>
            </div>
          </div>
          {/* Details section */}
          <div className="flex-1 flex flex-col gap-12 justify-center">
            {/* Product Info */}
            <div>
              <h3 className="text-[#FFC107] text-2xl font-extrabold mb-6 tracking-widest uppercase drop-shadow-lg">
                Product Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-5 text-xl">
                <div>
                  <span className="font-bold text-[#FFC107]">Name: </span>
                  <span className="text-white font-medium">
                    {product.productName}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-[#FFC107]">Category: </span>
                  <span className="text-white font-medium">
                    {product.category?.category || ""}
                  </span>
                </div>
                {/* Price/Sizes rendering */}
                {product.sizes && product.sizes.length > 0 ? (
                  <div className="md:col-span-2">
                    <span className="font-bold text-[#FFC107]">
                      Sizes & Prices:{" "}
                    </span>
                    <div className="mt-2">
                      <table className="min-w-[220px] bg-[#232323] rounded-xl overflow-hidden">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-[#FFC107] text-left">
                              Size
                            </th>
                            <th className="px-4 py-2 text-[#FFC107] text-left">
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.sizes.map((size, idx) => (
                            <tr key={idx} className="border-t border-[#333]">
                              <td className="px-4 py-2 text-white font-medium">
                                {size.label}
                              </td>
                              <td className="px-4 py-2 text-white font-medium">
                                ₱{size.price}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-[#FFC107]">Price: </span>
                    <span className="text-white font-medium">
                      ₱{product.price}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-bold text-[#FFC107]">Prep Time: </span>
                  <span className="text-white font-medium">
                    {product.preparationTime} min
                  </span>
                </div>
              </div>
              <div className="mt-6 text-xl">
                <span className="font-bold text-[#FFC107]">Description: </span>
                <span className="text-white font-medium">
                  {product.description}
                </span>
              </div>
            </div>
            <div className="border-t border-[#232323] my-4" />
            {/* Add-ons */}
            <div>
              <h3 className="text-[#FFC107] text-2xl font-extrabold mb-6 tracking-widest uppercase drop-shadow-lg">
                Add-ons
              </h3>
              {product.addOns && product.addOns.length > 0 ? (
                <ul className="list-disc ml-8 mt-2 space-y-3 text-xl">
                  {product.addOns.map((addon, idx) => (
                    <li
                      key={idx}
                      className="text-white flex items-center gap-2"
                    >
                      <span className="font-bold text-[#FFC107]">
                        {addon.name || addon}
                      </span>
                      {addon.price ? (
                        <span className="ml-2 text-white font-medium">
                          ₱{addon.price}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[#BDBDBD] ml-2 text-lg">None</span>
              )}
            </div>
            <div className="border-t border-[#232323] my-4" />
            {/* Ingredients */}
            <div>
              <h3 className="text-[#FFC107] text-2xl font-extrabold mb-6 tracking-widest uppercase drop-shadow-lg">
                Ingredients
              </h3>
              {product.ingredients && product.ingredients.length > 0 ? (
                <ul className="list-disc ml-8 mt-2 space-y-3 text-xl">
                  {product.ingredients.map((ing, idx) => (
                    <li
                      key={idx}
                      className="text-white flex items-center gap-2"
                    >
                      <span className="font-bold text-[#FFC107]">
                        {ing.ingredientId?.ingredientName || ing.ingredientId}
                      </span>
                      <span className="ml-2 text-white font-medium">
                        Qty: {ing.quantity} {ing.unit ? ing.unit : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[#BDBDBD] ml-2 text-lg">None</span>
              )}
            </div>
          </div>
        </div>
      </PageLayout>
    </AdminLayout>
  );
}
