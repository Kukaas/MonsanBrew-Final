import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import PageLayout from "@/layouts/PageLayout";
import DataTable from "@/components/custom/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { ingredientsAPI } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomAlertDialog from "@/components/custom/CustomAlertDialog";
import { toast } from "sonner";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/custom/StatusBadge";
import { useLocation } from "react-router-dom";

function useIngredientsQuery() {
  return new URLSearchParams(useLocation().search);
}

const statusOptions = [
  { value: "in_stock", label: "In Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "low_stock", label: "Low Stock" },
];

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

export default function Ingredients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const query = useIngredientsQuery();
  const highlightedId = query.get("highlight");

  // Fetch ingredients
  const { data, isLoading } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      try {
        const res = await ingredientsAPI.getAll();
        return res || [];
      } catch {
        return [];
      }
    },
  });

  const { mutate: deleteMutate } = useMutation({
    mutationFn: async (id) => {
      return await ingredientsAPI.delete(id);
    },
    onSuccess: () => {
      setDeleting(false);
      queryClient.invalidateQueries(["ingredients"]);
      setDeleteOpen(false);
      setDeleteItem(null);
      toast.success("Ingredient deleted successfully!");
    },
    onError: (error) => {
      setDeleting(false);
      toast.error(
        error?.response?.data?.message || "Failed to delete ingredient"
      );
    },
  });

  const mappedData = (data || []).map((item) => ({ ...item, id: item._id }));

  const columns = [
    { accessorKey: "ingredientName", header: "Ingredient Name" },
    { accessorKey: "stock", header: "Stock" },
    {
      accessorKey: "unit",
      header: "Unit",
      render: (row) => {
        const found = unitOptions.find((opt) => opt.value === row.unit);
        return found ? found.label : row.unit;
      },
      meta: { filterOptions: unitOptions.map((opt) => opt.label) },
    },
    {
      id: "status",
      header: "Status",
      render: (row) => <StatusBadge stock={row.stock} status={row.status} />,
      meta: { filterOptions: statusOptions.map((opt) => opt.label) },
      accessorFn: (row) => {
        const found = statusOptions.find((opt) => opt.value === row.status);
        return found ? found.label : row.status;
      },
    },
    {
      accessorKey: "image",
      header: "Image",
      render: (row) =>
        row.image ? (
          <img
            src={row.image}
            alt="Ingredient"
            className="h-12 w-12 object-cover rounded border border-[#FFC107] mx-auto cursor-pointer hover:scale-110 transition-transform"
          />
        ) : (
          <span className="text-[#BDBDBD]">No Image</span>
        ),
    },
    {
      id: "actions",
      header: "",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent disablePortal>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Separator />
            <DropdownMenuItem
              onClick={() => navigate(`/admin/ingredients/${row.id}`)}
            >
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/admin/ingredients/${row.id}/edit`)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500"
              disabled={deleting}
              onClick={() => {
                setDeleteItem(row);
                setDeleteOpen(true);
              }}
            >
              {deleting && deleteItem && deleteItem._id === row._id
                ? "Deleting..."
                : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageLayout
        title="Ingredients"
        description="Manage your ingredients here."
        action={
          <Button
            variant="yellow"
            size="lg"
            onClick={() => navigate("/admin/ingredients/create")}
          >
            Add Ingredient
          </Button>
        }
      >
        <DataTable
          columns={columns}
          data={mappedData}
          loading={isLoading}
          rowKey="id"
          highlightedId={highlightedId}
        />

        {/* DELETE DIALOG */}
        <CustomAlertDialog
          open={deleteOpen}
          onOpenChange={deleting ? undefined : setDeleteOpen}
          title="Delete Ingredient"
          description={`Are you sure you want to delete "${deleteItem?.ingredientName}"? This action cannot be undone.`}
          actions={
            <>
              <AlertDialogCancel className="h-10" disabled={deleting}>
                Cancel
              </AlertDialogCancel>
              <Button
                variant="yellow"
                size="lg"
                loading={deleting}
                disabled={deleting}
                onClick={() => {
                  setDeleting(true);
                  deleteMutate(deleteItem._id);
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </>
          }
        />
      </PageLayout>
    </AdminLayout>
  );
}
