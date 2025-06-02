import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { CategoryFilterCard } from "@/components/shared/category/CategoryFilterCard";
import { CreateOrderSheet } from "@/components/shared/CreateOrderSheet";
import { ProductMenuCard } from "@/components/shared/product/ProductMenuCard";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";
import type { NextPageWithLayout } from "../_app";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import LoadingSpinner from "@/components/ui/loading-spinner";
import BadgeNumber from "@/components/ui/badge-number";

const DashboardPage: NextPageWithLayout = () => {
  const cartStore = useCartStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);

  const debouncedSearchQuery = useDebounce<string>(searchQuery, 300);

  const { data: categories, isPending: isPendingCategories } =
    api.category.getCategories.useQuery();

  const { data: products, isPending: isPendingProducts } =
    api.product.getProducts.useQuery({
      categoryId: selectedCategory,
      search: debouncedSearchQuery,
    });

  const totalProducts = products?.length ?? 0;

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleAddToCart = (productId: string) => {
    const productToAdd = products?.find((product) => product.id === productId);

    if (!productToAdd) {
      toast("Product not found");
      return;
    }

    cartStore.addToCart({
      productId: productToAdd.id,
      name: productToAdd.name,
      price: productToAdd.price,
      imageUrl: productToAdd.imageUrl ?? "",
    });
  };

  return (
    <>
      <DashboardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <DashboardTitle>Dashboard</DashboardTitle>
            <DashboardDescription>
              Welcome to your Hammercode POS system dashboard.
            </DashboardDescription>
          </div>

          {!!cartStore.items.length && (
            <Button
              className="animate-in slide-in-from-right"
              onClick={() => setOrderSheetOpen(true)}
            >
              <ShoppingCart /> Cart{" "}
              <BadgeNumber number={cartStore.items.length} />
            </Button>
          )}
        </div>
      </DashboardHeader>

      <div className="space-y-6">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          <CategoryFilterCard
            name={searchQuery ? "Searched Products" : "All Categories"}
            productCount={totalProducts}
            isSelected={selectedCategory === "ALL"}
            onClick={() => handleCategoryClick("ALL")}
          />
          {isPendingCategories && <LoadingSpinner />}
          {categories?.map((category) => (
            <CategoryFilterCard
              key={category.id}
              name={category.name}
              productCount={category._count.products}
              isSelected={selectedCategory === category.id}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </div>

        <div>
          {products?.length === 0 ? (
            <div className="my-8 flex flex-col items-center justify-center">
              <p className="text-muted-foreground text-center">
                No products found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {isPendingProducts && (
                <div className="col-span-4 flex h-96 items-center justify-center">
                  <LoadingSpinner size={32} />
                </div>
              )}
              {products?.map((product) => (
                <ProductMenuCard
                  key={product.id}
                  productId={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={
                    product.imageUrl ?? "https://placeholder.co/600x400"
                  }
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateOrderSheet
        open={orderSheetOpen}
        onOpenChange={setOrderSheetOpen}
      />
    </>
  );
};

DashboardPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;
