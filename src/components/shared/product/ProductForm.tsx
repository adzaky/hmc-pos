import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFormSchema } from "@/forms/product";
import { uploadFileToSignedUrl } from "@/lib/supabase";
import { Bucket } from "@/server/bucket";
import { api } from "@/utils/api";
import Image from "next/image";
import Link from "next/link";
import type { ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

type ProductFormProps = {
  onSubmit: (values: ProductFormSchema) => void;
  onChangeImageUrl: (imageUrl: string) => void;
};
export const ProductForm = ({
  onSubmit,
  onChangeImageUrl,
}: ProductFormProps) => {
  const form = useFormContext<ProductFormSchema>();

  const { data: categories } = api.category.getCategories.useQuery();

  const { mutateAsync: createImageSignedUrl, isPending: isUploadImagePending } =
    api.product.createProductImageUploadSignedUrl.useMutation();

  const handleChangeImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files?.length > 0) {
      const file = files[0];
      if (!file) return;
      const { path, token } = await createImageSignedUrl();
      const imageUrl = await uploadFileToSignedUrl({
        bucket: Bucket.ProductImages,
        file,
        path,
        token,
      });
      form.setValue("imageUrl", imageUrl);
      onChangeImageUrl(imageUrl);
      toast("Product image uploaded!");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
      id="product-form"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((item, index) => (
                    <SelectItem key={index} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Product Image</Label>
          <Input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChangeImage}
            disabled={isUploadImagePending}
          />
        </div>

        {form.getValues("imageUrl") && (
          <div className="flex items-center">
            <Image
              src={form.getValues("imageUrl")}
              width={100}
              height={100}
              loading="lazy"
              alt={form.getValues("name")}
              className="rounded-md"
            />
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={form.getValues("imageUrl")}
              className="text-muted-foreground ml-2 text-sm hover:underline"
            >
              {form.getValues("imageUrl").split("/").pop() ?? "No image"}
            </Link>
          </div>
        )}
      </div>
    </form>
  );
};
