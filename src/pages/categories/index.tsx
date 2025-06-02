import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { CategoryCatalogCard } from "@/components/shared/category/CategoryCatalogCard";
import { CategoryForm } from "@/components/shared/category/CategoryForm";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { categoryFormSchema, type CategoryFormSchema } from "@/forms/category";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { NextPageWithLayout } from "../_app";
import { api } from "@/utils/api";
import { toast } from "sonner";
import type { Category } from "@prisma/client";

const CategoriesPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();

  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] =
    useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Omit<
    Category,
    "createdAt" | "updatedAt"
  > | null>(null);

  // Forms =====================================================================
  const createCategoryForm = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
  });

  const editCategoryForm = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
    values: {
      name: categoryToEdit?.name ?? "",
    },
  });

  // Queries ===================================================================
  const { data: categories } = api.category.getCategories.useQuery();

  const { mutate: createCategory, isPending: isPendingCreateCategory } =
    api.category.createCategory.useMutation({
      onSuccess: async () => {
        await apiUtils.category.getCategories.invalidate();

        toast("Category created successfully!");
        setCreateCategoryDialogOpen(false);
        createCategoryForm.reset();
      },
    });

  const { mutate: deleteCategoryById, isPending: isPendingDeleteCategory } =
    api.category.deleteCategory.useMutation({
      onSuccess: async () => {
        await apiUtils.category.getCategories.invalidate();

        toast("Category deleted successfully!");
        setCategoryToDelete(null);
      },
    });

  const { mutate: editCategory, isPending: isPendingEditCategory } =
    api.category.editCategory.useMutation({
      onSuccess: async () => {
        await apiUtils.category.getCategories.invalidate();

        toast("Category edited successfully!");
        setEditCategoryDialogOpen(false);
        editCategoryForm.reset();
      },
    });

  // Handlers ===================================================================
  const handleSubmitCreateCategory = (data: CategoryFormSchema) => {
    createCategory({
      name: data.name,
    });
  };

  const handleSubmitEditCategory = (data: CategoryFormSchema) => {
    if (!categoryToEdit) return;

    editCategory({
      categoryId: categoryToEdit.id,
      name: data.name,
    });
  };

  const handleClickEditCategory = (
    category: Omit<Category, "createdAt" | "updatedAt">,
  ) => {
    setEditCategoryDialogOpen(true);
    setCategoryToEdit(category);
  };

  const handleClickDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    deleteCategoryById({ categoryId: categoryToDelete });
  };

  return (
    <>
      <DashboardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <DashboardTitle>Category Management</DashboardTitle>
            <DashboardDescription>
              Organize your products with custom categories.
            </DashboardDescription>
          </div>

          <AlertDialog
            open={createCategoryDialogOpen}
            onOpenChange={setCreateCategoryDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Category</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Category</AlertDialogTitle>
              </AlertDialogHeader>
              <Form {...createCategoryForm}>
                <CategoryForm onSubmit={handleSubmitCreateCategory} />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => createCategoryForm.reset()}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  onClick={createCategoryForm.handleSubmit(
                    handleSubmitCreateCategory,
                  )}
                  loading={isPendingCreateCategory}
                >
                  Create Category
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
        {categories?.map((category) => {
          return (
            <CategoryCatalogCard
              key={category.id}
              name={category.name}
              productCount={category._count.products}
              onEdit={() => handleClickEditCategory(category)}
              onDelete={() => handleClickDeleteCategory(category.id)}
            />
          );
        })}
      </div>

      <AlertDialog
        open={editCategoryDialogOpen}
        onOpenChange={setEditCategoryDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Category</AlertDialogTitle>
          </AlertDialogHeader>
          <Form {...editCategoryForm}>
            <CategoryForm onSubmit={handleSubmitEditCategory} />
          </Form>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => editCategoryForm.reset()}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={editCategoryForm.handleSubmit(handleSubmitEditCategory)}
              loading={isPendingEditCategory}
            >
              Edit Category
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this category? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteCategory}
              loading={isPendingDeleteCategory}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

CategoriesPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default CategoriesPage;
