import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { supabaseAdmin } from "@/server/supabase-admin";
import { Bucket } from "@/server/bucket";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";

export const ProductRouter = createTRPCRouter({
  getProducts: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const whereClause: Prisma.ProductWhereInput = {};

      if (input.categoryId !== "ALL") {
        whereClause.categoryId = input.categoryId;
      }

      if (input.search) {
        whereClause.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          {
            category: { name: { contains: input.search, mode: "insensitive" } },
          },
        ];
      }

      const product = await db.product.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          price: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          imageUrl: true,
        },
      });

      return product;
    }),

  getProductById: protectedProcedure.input(
    z.object(({
      productId: z.string().uuid(),
    }))
  ).query(async ({ctx, input}) => {
    const { db } = ctx;

    const product = await db.product.findUnique({
      where: {
        id: input.productId,
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        imageUrl: true,
      },
    });

    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found",
      });
    }

    return product;
  }),

  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(50),
        price: z.coerce.number().min(1000),
        categoryId: z.string(),
        imageUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const newProduct = await db.product.create({
        data: {
          name: input.name,
          price: input.price,
          category: {
            connect: {
              id: input.categoryId,
            },
          },
          imageUrl: input.imageUrl,
        },
      });

      return newProduct;
    }),

  createProductImageUploadSignedUrl: protectedProcedure.mutation(async () => {
    const { data, error } = await supabaseAdmin.storage
      .from(Bucket.ProductImages)
      .createSignedUploadUrl(`${Date.now()}.jpeg`);

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    return data;
  }),

  deleteProduct: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const deletedProduct = await db.product.delete({
        where: {
          id: input.productId,
        },
      });

      return deletedProduct;
    }),

  editProduct: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        name: z.string().min(3).max(50),
        price: z.coerce.number().min(1000),
        categoryId: z.string(),
        imageUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const editedProduct = await db.product.update({
        where: {
          id: input.productId,
        },
        data: {
          name: input.name,
          price: input.price,
          category: {
            connect: {
              id: input.categoryId,
            },
          },
          imageUrl: input.imageUrl,
        },
        select: {
          id: true,
          name: true,
          price: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          imageUrl: true,
        },
      });

      return editedProduct;
    }),
});
