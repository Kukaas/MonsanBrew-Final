import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "@/services/api";
import CustomerLayout from "@/layouts/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Share2, Copy as CopyIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import CustomAlertDialog from "@/components/custom/CustomAlertDialog";
import { useState } from "react";
import FormInput from "@/components/custom/FormInput";
import QRCode from "react-qr-code";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";

export default function Favorites() {
  const { userId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Fetch favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      const res = await productAPI.getFavoritesByUser(userId);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!userId,
  });

  const queryClient = useQueryClient();
  const unfavoriteMutation = useMutation({
    mutationFn: async (productId) => {
      if (!user?._id) return;
      await productAPI.removeFavorite(productId, user._id);
    },
    onMutate: (productId) => {
      setUnfavoriteLoadingId(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["favorites", userId]);
    },
    onSettled: () => {
      setUnfavoriteLoadingId(null);
    },
  });
  const isUnfavoriteLoading = unfavoriteMutation.isLoading;

  const [shareOpen, setShareOpen] = useState(null); // productId or null
  const [showQR, setShowQR] = useState(false);
  const [unfavoriteLoadingId, setUnfavoriteLoadingId] = useState(null);

  if (!isLoading && favorites.length === 0) {
    return (
      <CustomerLayout>
        <div className="min-h-screen bg-[#232323] flex flex-col items-center justify-center py-10 px-2">
          <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-10 max-w-md w-full">
            <Heart
              size={80}
              strokeWidth={2.5}
              className="mb-4"
              style={{
                color: "#FFC107",
                filter: "drop-shadow(0 0 8px #FFC10788)",
              }}
            />
            <div className="text-2xl font-extrabold text-[#232323] mb-2 text-center">
              No favorites yet
            </div>
            <div className="text-gray-500 mb-6 text-center">
              You haven't added any products to your favorites.
            </div>
            <Button
              variant="yellow"
              className="w-full text-lg font-bold py-3"
              onClick={() => navigate("/menus")}
            >
              Browse Menu
            </Button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-[#232323] flex flex-col items-center py-10 px-2">
        <h1 className="text-4xl font-extrabold text-center text-white mb-8">
          Favorites
        </h1>
        <div className="flex flex-wrap gap-6 justify-center mb-8 w-full max-w-5xl">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow p-4 flex flex-col items-center w-[320px] min-h-[140px]"
                >
                  <Skeleton className="w-20 h-20 mb-2 rounded-xl bg-gray-200" />
                  <Skeleton className="h-6 w-32 mb-2 bg-gray-200" />
                  <Skeleton className="h-4 w-20 mb-2 bg-gray-200" />
                  <Skeleton className="h-6 w-16 bg-gray-200" />
                </div>
              ))
            : favorites.map((product) => {
                const favorite = true;
                const url = `${window.location.origin}/product/${product._id}`;
                // Inline SVG QR code (placeholder, not a real QR code)
                const QRCodeSVG = (
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="120" height="120" rx="16" fill="#fff" />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      fill="#FFC107"
                      fontSize="16"
                      dy=".3em"
                    >
                      QR
                    </text>
                  </svg>
                );
                const handleCopy = (url) => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(url);
                    toast.success("Product link copied!");
                  } else {
                    alert(url);
                  }
                };
                return (
                  <div key={product._id} className="w-[320px] relative">
                    <ProductCard product={product} />
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                      <button
                        onClick={() => {
                          setShareOpen(product._id);
                          setShowQR(false);
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition-all shadow"
                        aria-label="Share product"
                        type="button"
                      >
                        <Share2 className="text-[#FFC107]" size={22} />
                      </button>
                      <button
                        onClick={() => unfavoriteMutation.mutate(product._id)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border transition-all shadow bg-[#FFC107] border-[#FFC107] hover:scale-105"
                        aria-label="Remove from favorites"
                        disabled={unfavoriteLoadingId === product._id}
                        type="button"
                      >
                        {unfavoriteLoadingId === product._id ? (
                          <span className="flex items-center justify-center w-6 h-6">
                            <svg
                              className="animate-spin text-white"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="white"
                                strokeWidth="4"
                                strokeDasharray="60 40"
                              />
                            </svg>
                          </span>
                        ) : (
                          <Heart
                            className="text-white"
                            fill="#FFC107"
                            size={24}
                          />
                        )}
                      </button>
                    </div>
                    {/* Share Dialog */}
                    <CustomAlertDialog
                      open={shareOpen === product._id}
                      onOpenChange={(open) => {
                        setShareOpen(open ? product._id : null);
                        setShowQR(false);
                      }}
                      title="Share Product"
                      description="Share this product with others."
                      actions={
                        <AlertDialogCancel className="w-full rounded-lg font-bold py-3 text-lg border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-white transition">
                          Close
                        </AlertDialogCancel>
                      }
                    >
                      <div className="flex flex-col gap-4 items-center">
                        <div className="w-full relative">
                          <FormInput
                            label="Product Link"
                            value={url}
                            readOnly
                            variant="dark"
                            inputClassName="text-center font-mono text-sm pr-12  "
                            className="w-full text-white"
                            endIcon={
                              <button
                                type="button"
                                onClick={() => handleCopy(url)}
                                className="ml-2 p-1 rounded hover:bg-[#FFC107]/20 transition"
                                aria-label="Copy link"
                              >
                                <CopyIcon
                                  size={20}
                                  className="text-[#FFC107]"
                                />
                              </button>
                            }
                          />
                        </div>
                        <div className="flex gap-2 w-full mb-2">
                          <Button
                            variant="yellow-outline"
                            className="flex-1 rounded-lg font-bold py-3 text-lg"
                            onClick={() => setShowQR((q) => !q)}
                          >
                            {showQR ? "Hide QR" : "Show QR Code"}
                          </Button>
                        </div>
                        {showQR && (
                          <div className="flex flex-col items-center mt-2 w-full">
                            <div className="bg-[#232323] border-2 border-[#FFC107] rounded-2xl p-4 shadow-lg flex flex-col items-center w-full">
                              <QRCode
                                value={url}
                                size={140}
                                bgColor="#232323"
                                fgColor="#FFC107"
                                style={{
                                  background: "#232323",
                                  boxShadow: "0 4px 24px #0004",
                                }}
                              />
                              <div className="text-yellow-400 font-bold mt-3 text-center text-base">
                                Scan to open product
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CustomAlertDialog>
                  </div>
                );
              })}
        </div>
      </div>
    </CustomerLayout>
  );
}
