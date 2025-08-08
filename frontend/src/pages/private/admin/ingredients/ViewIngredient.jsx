import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ingredientsAPI } from "@/services/api";
import AdminLayout from "@/layouts/AdminLayout";
import PageLayout from "@/layouts/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const unitOptions = [
  { value: "pieces", label: "Pieces" },
  { value: "kilograms", label: "Kilograms" },
  { value: "grams", label: "Grams" },
  { value: "liters", label: "Liters" },
  { value: "milliliters", label: "Milliliters" },
  { value: "packs", label: "Packs" },
  { value: "boxes", label: "Boxes" },
  { value: "cans", label: "Cans" },
  { value: "bottles", label: "Bottles" },
  { value: "trays", label: "Trays" },
  { value: "sachets", label: "Sachets" },
  { value: "dozens", label: "Dozens" },
];

export default function ViewIngredient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: ingredient,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ingredient", id],
    queryFn: async () => {
      const res = await ingredientsAPI.getById(id);
      return res.data || res;
    },
  });

  const getUnitLabel = (unitValue) => {
    const found = unitOptions.find((opt) => opt.value === unitValue);
    return found ? found.label : unitValue;
  };

  if (isLoading)
    return (
      <AdminLayout>
        <PageLayout
          title="Ingredient Information"
          description="See all details for this ingredient."
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
              {/* Ingredient Info */}
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
              {/* Recipe */}
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

  if (error) {
    return (
      <AdminLayout>
        <PageLayout
          title="Ingredient Information"
          description="See all details for this ingredient."
        >
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load ingredient data.</p>
            <Button
              variant="yellow"
              size="lg"
              onClick={() => navigate("/admin/ingredients")}
              className="mt-4"
            >
              Back to Ingredients
            </Button>
          </div>
        </PageLayout>
      </AdminLayout>
    );
  }

  if (!ingredient) {
    return (
      <AdminLayout>
        <PageLayout
          title="Ingredient Information"
          description="See all details for this ingredient."
        >
          <div className="text-center py-8">
            <p className="text-[#BDBDBD]">Ingredient not found.</p>
            <Button
              variant="yellow"
              size="lg"
              onClick={() => navigate("/admin/ingredients")}
              className="mt-4"
            >
              Back to Ingredients
            </Button>
          </div>
        </PageLayout>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageLayout
        title="Ingredient Information"
        description="See all details for this ingredient."
      >
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="yellow"
            size="icon"
            className="shadow-lg hover:scale-105 transition-transform duration-200"
            onClick={() => navigate("/admin/ingredients")}
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
              {ingredient.image ? (
                <img
                  src={ingredient.image}
                  alt="Ingredient"
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
                variant={ingredient.stock > 0 ? "outline" : "destructive"}
                className={
                  ingredient.stock > 0
                    ? "border-green-400 text-green-400 px-6 py-2 text-lg font-semibold shadow-md bg-[#1a2e1a]/60"
                    : "border-red-400 text-red-400 px-6 py-2 text-lg font-semibold shadow-md bg-[#2e1a1a]/60"
                }
              >
                {ingredient.stock > 0 ? (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2" />
                )}
                {ingredient.stock > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
              <Badge
                variant="outline"
                className="border-[#FFC107] text-[#FFC107] px-6 py-2 text-lg font-semibold shadow-md"
              >
                <Package className="w-5 h-5 mr-2" />
                {getUnitLabel(ingredient.unit)}
              </Badge>
            </div>
          </div>
          {/* Details section */}
          <div className="flex-1 flex flex-col gap-12 justify-center">
            {/* Ingredient Info */}
            <div>
              <h3 className="text-[#FFC107] text-2xl font-extrabold mb-6 tracking-widest uppercase drop-shadow-lg">
                Ingredient Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-5 text-xl">
                <div>
                  <span className="font-bold text-[#FFC107]">Name: </span>
                  <span className="text-white font-medium">
                    {ingredient.ingredientName}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-[#FFC107]">Stock: </span>
                  <span className="text-white font-medium">
                    {ingredient.stock} {getUnitLabel(ingredient.unit)}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-[#FFC107]">Unit: </span>
                  <span className="text-white font-medium">
                    {getUnitLabel(ingredient.unit)}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-[#FFC107]">Status: </span>
                  <span className="text-white font-medium">
                    {ingredient.stock > 10
                      ? "In Stock"
                      : ingredient.stock > 0
                      ? "Low Stock"
                      : "Out of Stock"}
                  </span>
                </div>
              </div>
              {ingredient.description && (
                <div className="mt-6 text-xl">
                  <span className="font-bold text-[#FFC107]">
                    Description:{" "}
                  </span>
                  <span className="text-white font-medium">
                    {ingredient.description}
                  </span>
                </div>
              )}
            </div>
            <div className="border-t border-[#232323] my-4" />
            {/* Recipe */}
            <div>
              <h3 className="text-[#FFC107] text-2xl font-extrabold mb-6 tracking-widest uppercase drop-shadow-lg">
                Recipe (Raw Materials)
              </h3>
              {ingredient.recipe && ingredient.recipe.length > 0 ? (
                <ul className="list-disc ml-8 mt-2 space-y-3 text-xl">
                  {ingredient.recipe.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-white flex items-center gap-2"
                    >
                      <span className="font-bold text-[#FFC107]">
                        {item.rawMaterialId.productName || item.rawMaterialId}
                      </span>
                      <span className="ml-2 text-white font-medium">
                        Qty: {item.quantity} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[#BDBDBD] ml-2 text-lg">
                  No recipe items defined
                </span>
              )}
            </div>
          </div>
        </div>
      </PageLayout>
    </AdminLayout>
  );
}
