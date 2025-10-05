import { useState } from "react";
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
import { dndAPI } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomAlertDialog from "@/components/custom/CustomAlertDialog";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import Form from "@/components/custom/Form";
import FormInput from "@/components/custom/FormInput";
import CustomSelect from "@/components/custom/CustomSelect";
import ImageUpload from "@/components/custom/ImageUpload";

const categoryOptions = [
  { value: "flavor", label: "Flavor" },
  { value: "jam", label: "Jam" },
  { value: "ice", label: "Ice" },
  { value: "milk", label: "Milk" },
  { value: "powder", label: "Powder" },
  { value: "base", label: "Base" },
  { value: "other", label: "Other" },
];

export default function DnDIngredients() {
  const queryClient = useQueryClient();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("flavor");
  const [image, setImage] = useState("");

  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("flavor");
  const [editImage, setEditImage] = useState("");
  const [deleteItem, setDeleteItem] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["dnd-ingredients"],
    queryFn: async () => {
      const res = await dndAPI.getIngredients();
      return res.data || res || [];
    },
  });

  const { mutate: addMutate, isPending: adding } = useMutation({
    mutationFn: async () => dndAPI.createIngredient({ name: name.trim(), price: Number(price), category, image }),
    onSuccess: () => {
      queryClient.invalidateQueries(["dnd-ingredients"]);
      setAddOpen(false);
      setName("");
      setPrice("");
      setCategory("flavor");
      setImage("");
      setFormError("");
    },
    onError: (err) => setFormError(err?.response?.data?.message || "Failed to add item"),
  });

  const { mutate: updateMutate, isPending: updating } = useMutation({
    mutationFn: async () => dndAPI.updateIngredient(editItem._id, { name: editName.trim(), price: Number(editPrice), category: editCategory, image: editImage }),
    onSuccess: () => {
      queryClient.invalidateQueries(["dnd-ingredients"]);
      setEditOpen(false);
      setEditItem(null);
      setEditName("");
      setEditPrice("");
      setEditCategory("flavor");
      setEditImage("");
      setFormError("");
    },
    onError: (err) => setFormError(err?.response?.data?.message || "Failed to update item"),
  });

  const { mutate: deleteMutate, isPending: deleting } = useMutation({
    mutationFn: async () => dndAPI.deleteIngredient(deleteItem._id),
    onSuccess: () => {
      queryClient.invalidateQueries(["dnd-ingredients"]);
      setDeleteOpen(false);
      setDeleteItem(null);
    },
  });

  const mappedData = (data || []).map((it) => ({ ...it, id: it._id }));

  const columns = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "category",
      header: "Category",
      render: (row) => {
        const found = categoryOptions.find((c) => c.value === row.category);
        return found ? found.label : row.category;
      },
      meta: { filterOptions: categoryOptions.map((c) => c.label) },
    },
    {
      accessorKey: "price",
      header: "Price",
      render: (row) => `₱${Number(row.price).toFixed(2)}`,
    },
    {
      accessorKey: "image",
      header: "Image",
      render: (row) =>
        row.image ? (
          <img
            src={row.image}
            alt={row.name}
            className="h-12 w-12 object-cover rounded border border-[#FFC107] mx-auto"
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
              onClick={() => {
                setEditItem(row);
                setEditName(row.name);
                setEditPrice(row.price);
                setEditCategory(row.category);
                setEditImage(row.image || "");
                setFormError("");
                setEditOpen(true);
              }}
            >
              {updating && editItem && editItem._id === row._id ? "Saving..." : "Edit"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => {
                setDeleteItem(row);
                setDeleteOpen(true);
              }}
            >
              {deleting && deleteItem && deleteItem._id === row._id ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim()) return setFormError("Name is required");
    if (!price || isNaN(price)) return setFormError("Valid price is required");
    if (!image) return setFormError("Image is required");
    addMutate();
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!editName.trim()) return setFormError("Name is required");
    if (!editPrice || isNaN(editPrice)) return setFormError("Valid price is required");
    updateMutate();
  };

  return (
    <AdminLayout>
      <PageLayout
        title="D&D Ingredients"
        description="Manage drag-and-drop ingredients here."
        action={
          <Button variant="yellow" size="lg" onClick={() => setAddOpen(true)}>
            Add D&D Ingredient
          </Button>
        }
      >
        <DataTable columns={columns} data={mappedData} loading={isLoading} rowKey="id" />

        {/* ADD DIALOG */}
        <CustomAlertDialog
          open={addOpen}
          onOpenChange={adding ? undefined : setAddOpen}
          title="Add D&D Ingredient"
          description="Enter a new drag-and-drop ingredient."
          actions={
            <>
              <AlertDialogCancel className="h-10" disabled={adding}>
                Cancel
              </AlertDialogCancel>
              <Button type="submit" form="add-dnd-ingredient-form" variant="yellow" size="lg" loading={adding} disabled={adding}>
                {adding ? "Adding..." : "Add"}
              </Button>
            </>
          }
        >
          <Form id="add-dnd-ingredient-form" onSubmit={handleAdd}>
            <div className="flex flex-col gap-4">
              <FormInput
                label="Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={formError}
                variant="dark"
                placeholder="e.g. Caramel Shot"
              />
              <FormInput
                label="Price"
                name="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={formError}
                variant="dark"
                placeholder="0.00"
              />
              <CustomSelect
                label="Category"
                value={category}
                onChange={setCategory}
                options={categoryOptions}
                placeholder="Select category"
                name="category"
              />
              <div>
                <ImageUpload label="Image" value={image} onChange={setImage} error={formError} />
              </div>
            </div>
          </Form>
        </CustomAlertDialog>

        {/* EDIT DIALOG */}
        <CustomAlertDialog
          open={editOpen}
          onOpenChange={updating ? undefined : setEditOpen}
          title="Edit D&D Ingredient"
          description="Update the ingredient."
          actions={
            <>
              <AlertDialogCancel className="h-10" disabled={updating}>
                Cancel
              </AlertDialogCancel>
              <Button type="submit" form="edit-dnd-ingredient-form" variant="yellow" size="lg" loading={updating} disabled={updating}>
                {updating ? "Saving..." : "Save"}
              </Button>
            </>
          }
        >
          <Form id="edit-dnd-ingredient-form" onSubmit={handleEdit}>
            <div className="flex flex-col gap-4">
              <FormInput
                label="Name"
                name="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                error={formError}
                variant="dark"
              />
              <FormInput
                label="Price"
                name="editPrice"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                error={formError}
                variant="dark"
              />
              <CustomSelect
                label="Category"
                value={editCategory}
                onChange={setEditCategory}
                options={categoryOptions}
                placeholder="Select category"
                name="editCategory"
              />
              <div>
                <ImageUpload label="Image" value={editImage} onChange={setEditImage} error={formError} />
              </div>
            </div>
          </Form>
        </CustomAlertDialog>

        {/* DELETE DIALOG */}
        <CustomAlertDialog
          open={deleteOpen}
          onOpenChange={deleting ? undefined : setDeleteOpen}
          title="Delete D&D Ingredient"
          description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
          actions={
            <>
              <AlertDialogCancel className="h-10" disabled={deleting}>
                Cancel
              </AlertDialogCancel>
              <Button variant="yellow" size="lg" loading={deleting} disabled={deleting} onClick={() => deleteMutate()}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </>
          }
        />
      </PageLayout>
    </AdminLayout>
  );
}


