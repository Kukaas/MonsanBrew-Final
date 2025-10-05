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
import ImageUpload from "@/components/custom/ImageUpload";
import { Checkbox } from "@/components/ui/checkbox";

export default function DnDPreviews() {
  const queryClient = useQueryClient();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [blendImage, setBlendImage] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [isStandalone, setIsStandalone] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editBlendImage, setEditBlendImage] = useState("");
  const [editIngredients, setEditIngredients] = useState([]);
  const [editStandalone, setEditStandalone] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const { data: previews, isLoading } = useQuery({
    queryKey: ["dnd-previews"],
    queryFn: async () => {
      const res = await dndAPI.getPreviews();
      return res.data || res || [];
    },
  });

  const { data: availableIngredients } = useQuery({
    queryKey: ["dnd-ingredients"],
    queryFn: async () => {
      const res = await dndAPI.getIngredients();
      return res.data || res || [];
    },
  });

  const { mutate: addMutate, isPending: adding } = useMutation({
    mutationFn: async () => {
      const finalName = ingredients.length > 0 ? generatePreviewName(ingredients) : name;
      return dndAPI.createPreview({ name: finalName.trim(), image, blendImage, ingredients, isStandalone });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["dnd-previews"]);
      setAddOpen(false);
      setName("");
      setImage("");
      setBlendImage("");
      setIngredients([]);
      setIsStandalone(false);
      setFormError("");
    },
    onError: (err) => setFormError(err?.response?.data?.message || "Failed to add preview"),
  });

  const { mutate: updateMutate, isPending: updating } = useMutation({
    mutationFn: async () => {
      const finalName = editIngredients.length > 0 ? generatePreviewName(editIngredients) : editName;
      return dndAPI.updatePreview(editItem._id, { name: finalName.trim(), image: editImage, blendImage: editBlendImage, ingredients: editIngredients, isStandalone: editStandalone });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["dnd-previews"]);
      setEditOpen(false);
      setEditItem(null);
      setEditName("");
      setEditImage("");
      setEditBlendImage("");
      setEditIngredients([]);
      setEditStandalone(false);
      setFormError("");
    },
    onError: (err) => setFormError(err?.response?.data?.message || "Failed to update preview"),
  });

  const { mutate: deleteMutate, isPending: deleting } = useMutation({
    mutationFn: async () => dndAPI.deletePreview(deleteItem._id),
    onSuccess: () => {
      queryClient.invalidateQueries(["dnd-previews"]);
      setDeleteOpen(false);
      setDeleteItem(null);
    },
  });

  const mappedData = (previews || []).map((p) => ({ ...p, id: p._id }));

  const columns = [
    { accessorKey: "name", header: "Name" },
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
      accessorKey: "isStandalone",
      header: "Type",
      render: (row) => (row.isStandalone ? "Standalone" : "Linked"),
    },
    {
      accessorKey: "ingredients",
      header: "Ingredients",
      render: (row) => row.ingredients?.map((ing) => `${ing.ingredientId?.name} x${ing.quantity}`).join(", ") || "-",
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
                setEditImage(row.image || "");
                setEditBlendImage(row.blendImage || "");
                setEditIngredients(row.ingredients || []);
                setEditStandalone(Boolean(row.isStandalone));
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
    const finalName = ingredients.length > 0 ? generatePreviewName(ingredients) : name;
    if (!finalName.trim()) return setFormError("Name is required");
    if (!image) return setFormError("Image is required");
    addMutate();
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setFormError("");
    const finalName = editIngredients.length > 0 ? generatePreviewName(editIngredients) : editName;
    if (!finalName.trim()) return setFormError("Name is required");
    updateMutate();
  };

  const addIngredient = (ingredientId) => {
    const ingredient = ingredients.find(ing => ing.ingredientId === ingredientId);
    if (ingredient) {
      setIngredients(ingredients.map(ing =>
        ing.ingredientId === ingredientId
          ? { ...ing, quantity: ing.quantity + 1 }
          : ing
      ));
    } else {
      setIngredients([...ingredients, { ingredientId, quantity: 1 }]);
    }
  };

  const removeIngredient = (ingredientId) => {
    setIngredients(ingredients.filter(ing => ing.ingredientId !== ingredientId));
  };

  const updateQuantity = (ingredientId, quantity) => {
    if (quantity <= 0) {
      removeIngredient(ingredientId);
    } else {
      setIngredients(ingredients.map(ing =>
        ing.ingredientId === ingredientId
          ? { ...ing, quantity: Number(quantity) }
          : ing
      ));
    }
  };

  const addEditIngredient = (ingredientId) => {
    const ingredient = editIngredients.find(ing => ing.ingredientId === ingredientId);
    if (ingredient) {
      setEditIngredients(editIngredients.map(ing =>
        ing.ingredientId === ingredientId
          ? { ...ing, quantity: ing.quantity + 1 }
          : ing
      ));
    } else {
      setEditIngredients([...editIngredients, { ingredientId, quantity: 1 }]);
    }
  };

  const removeEditIngredient = (ingredientId) => {
    setEditIngredients(editIngredients.filter(ing => ing.ingredientId !== ingredientId));
  };

  const updateEditQuantity = (ingredientId, quantity) => {
    if (quantity <= 0) {
      removeEditIngredient(ingredientId);
    } else {
      setEditIngredients(editIngredients.map(ing =>
        ing.ingredientId === ingredientId
          ? { ...ing, quantity: Number(quantity) }
          : ing
      ));
    }
  };

  const generatePreviewName = (ingredientsList) => {
    if (!ingredientsList || ingredientsList.length === 0) return "";

    return ingredientsList.map(ing => {
      // Check if ingredient data is already populated (from database)
      if (ing.ingredientId && typeof ing.ingredientId === 'object') {
        const name = ing.ingredientId.name || 'Unknown';
        return ing.quantity > 1 ? `${name} x${ing.quantity}` : name;
      }
      // Otherwise, look up in availableIngredients
      const ingredient = availableIngredients.find(i => i._id === ing.ingredientId);
      const name = ingredient?.name || 'Unknown';
      return ing.quantity > 1 ? `${name} x${ing.quantity}` : name;
    }).join(" + ");
  };

  return (
    <AdminLayout>
      <PageLayout
        title="D&D Previews"
        description="Manage blended preview images and their ingredient links."
        action={
          <Button variant="yellow" size="lg" onClick={() => setAddOpen(true)}>
            Add D&D Preview
          </Button>
        }
      >
        <DataTable columns={columns} data={mappedData} loading={isLoading} rowKey="id" />

        {/* ADD DIALOG */}
        <CustomAlertDialog
          open={addOpen}
          onOpenChange={adding ? undefined : setAddOpen}
          title="Add D&D Preview"
          description="Create a new blended preview image."
          actions={
            <>
              <AlertDialogCancel className="h-10" disabled={adding}>
                Cancel
              </AlertDialogCancel>
              <Button type="submit" form="add-dnd-preview-form" variant="yellow" size="lg" loading={adding} disabled={adding}>
                {adding ? "Adding..." : "Add"}
              </Button>
            </>
          }
        >
          <Form id="add-dnd-preview-form" onSubmit={handleAdd}>
            <div className="flex flex-col gap-4">
              <label className="font-bold text-[#FFC107]">Link Ingredients (optional)</label>

              {/* Available Ingredients */}
              <div className="space-y-3">
                <div className="text-sm text-white font-semibold">Available Ingredients:</div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {(availableIngredients || []).map((it) => {
                    const isSelected = ingredients.some(ing => ing.ingredientId === it._id);
                    const selectedIngredient = ingredients.find(ing => ing.ingredientId === it._id);

                    return (
                      <div key={it._id} className="flex items-center gap-3 bg-[#232323] p-3 rounded-lg border border-[#444]">
                        <img
                          src={it.image}
                          alt={it.name}
                          className="h-8 w-8 object-cover rounded border border-[#FFC107]"
                        />
                        <span className="text-white flex-1">{it.name}</span>

                        {isSelected ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[#FFC107] text-sm">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={selectedIngredient.quantity}
                              onChange={(e) => updateQuantity(it._id, e.target.value)}
                              className="w-16 px-2 py-1 bg-[#2A2A2A] border border-[#444] text-white rounded text-center"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeIngredient(it._id)}
                              className="h-8 w-8 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="yellow"
                            size="sm"
                            onClick={() => addIngredient(it._id)}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Ingredients Summary */}
              {ingredients.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-white font-semibold">Preview Recipe:</div>
                  <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#FFC107]">
                    <div className="text-[#FFC107] font-semibold mb-2">Ingredients:</div>
                    <div className="space-y-1">
                      {ingredients.map((ing) => {
                        const ingredient = availableIngredients.find(i => i._id === ing.ingredientId);
                        return (
                          <div key={ing.ingredientId} className="flex items-center gap-2 text-white">
                            <span className="text-[#FFC107]">•</span>
                            <span>{ingredient?.name || 'Unknown'}</span>
                            <span className="text-[#FFC107]">x{ing.quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-white">
                <Checkbox
                  checked={isStandalone}
                  onCheckedChange={(v) => setIsStandalone(Boolean(v))}
                  className="border-[#444] data-[state=checked]:bg-[#FFC107] data-[state=checked]:border-[#FFC107]"
                />
                <span className="text-white">Standalone (not linked to ingredients)</span>
              </label>

              <FormInput
                label="Name"
                name="name"
                value={ingredients.length > 0 ? generatePreviewName(ingredients) : name}
                onChange={(e) => setName(e.target.value)}
                error={formError}
                variant="dark"
                placeholder="e.g. Caramel + Ice Blend"
                disabled={ingredients.length > 0}
              />

              <div>
                <ImageUpload label="Image" value={image} onChange={setImage} error={formError} />
              </div>

              {/* Optional Blend Image */}
              {ingredients.length > 0 && (
                <div>
                  <ImageUpload
                    label="Blend Preview (Optional)"
                    value={blendImage}
                    onChange={setBlendImage}
                    error={formError}
                  />
                  <div className="text-gray-400 text-xs mt-1">
                    Upload an image showing how "{generatePreviewName(ingredients)}" looks when blended together
                  </div>
                </div>
              )}
            </div>
          </Form>
        </CustomAlertDialog>

        {/* EDIT DIALOG */}
        <CustomAlertDialog
          open={editOpen}
          onOpenChange={updating ? undefined : setEditOpen}
          title="Edit D&D Preview"
          description="Update the preview image and links."
          actions={
            <>
              <AlertDialogCancel className="h-10" disabled={updating}>
                Cancel
              </AlertDialogCancel>
              <Button type="submit" form="edit-dnd-preview-form" variant="yellow" size="lg" loading={updating} disabled={updating}>
                {updating ? "Saving..." : "Save"}
              </Button>
            </>
          }
        >
          <Form id="edit-dnd-preview-form" onSubmit={handleEdit}>
            <div className="flex flex-col gap-4">
              <label className="font-bold text-[#FFC107]">Link Ingredients (optional)</label>

              {/* Available Ingredients */}
              <div className="space-y-3">
                <div className="text-sm text-white font-semibold">Available Ingredients:</div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {(availableIngredients || []).map((it) => {
                    const isSelected = editIngredients.some(ing => ing.ingredientId === it._id);
                    const selectedIngredient = editIngredients.find(ing => ing.ingredientId === it._id);

                    return (
                      <div key={it._id} className="flex items-center gap-3 bg-[#232323] p-3 rounded-lg border border-[#444]">
                        <img
                          src={it.image}
                          alt={it.name}
                          className="h-8 w-8 object-cover rounded border border-[#FFC107]"
                        />
                        <span className="text-white flex-1">{it.name}</span>

                        {isSelected ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[#FFC107] text-sm">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={selectedIngredient.quantity}
                              onChange={(e) => updateEditQuantity(it._id, e.target.value)}
                              className="w-16 px-2 py-1 bg-[#2A2A2A] border border-[#444] text-white rounded text-center"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeEditIngredient(it._id)}
                              className="h-8 w-8 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="yellow"
                            size="sm"
                            onClick={() => addEditIngredient(it._id)}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Ingredients Summary */}
              {editIngredients.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-white font-semibold">Preview Recipe:</div>
                  <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#FFC107]">
                    <div className="text-[#FFC107] font-semibold mb-2">Ingredients:</div>
                    <div className="space-y-1">
                      {editIngredients.map((ing) => {
                        // Check if ingredient data is already populated (from database)
                        const ingredientName = ing.ingredientId && typeof ing.ingredientId === 'object'
                          ? ing.ingredientId.name
                          : availableIngredients.find(i => i._id === ing.ingredientId)?.name || 'Unknown';

                        return (
                          <div key={ing.ingredientId} className="flex items-center gap-2 text-white">
                            <span className="text-[#FFC107]">•</span>
                            <span>{ingredientName}</span>
                            <span className="text-[#FFC107]">x{ing.quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-white">
                <Checkbox
                  checked={editStandalone}
                  onCheckedChange={(v) => setEditStandalone(Boolean(v))}
                  className="border-[#444] data-[state=checked]:bg-[#FFC107] data-[state=checked]:border-[#FFC107]"
                />
                <span className="text-white">Standalone (not linked to ingredients)</span>
              </label>

              <FormInput
                label="Name"
                name="editName"
                value={editIngredients.length > 0 ? generatePreviewName(editIngredients) : editName}
                onChange={(e) => setEditName(e.target.value)}
                error={formError}
                variant="dark"
                disabled={editIngredients.length > 0}
              />

              <div>
                <ImageUpload label="Image" value={editImage} onChange={setEditImage} error={formError} />
              </div>

              {/* Optional Blend Image */}
              {editIngredients.length > 0 && (
                <div>
                  <ImageUpload
                    label="Blend Preview (Optional)"
                    value={editBlendImage}
                    onChange={setEditBlendImage}
                    error={formError}
                  />
                  <div className="text-gray-400 text-xs mt-1">
                    Upload an image showing how "{generatePreviewName(editIngredients)}" looks when blended together
                  </div>
                </div>
              )}
            </div>
          </Form>
        </CustomAlertDialog>

        {/* DELETE DIALOG */}
        <CustomAlertDialog
          open={deleteOpen}
          onOpenChange={deleting ? undefined : setDeleteOpen}
          title="Delete D&D Preview"
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


