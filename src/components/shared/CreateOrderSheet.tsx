import { Button } from "../ui/button";
import { toRupiah } from "@/utils/toRupiah";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
} from "../ui/alert-dialog";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { PaymentQRCode } from "./PaymentQrCode";
import { useCartStore } from "@/store/cart";
import { api } from "@/utils/api";
import { toast } from "sonner";

type OrderItemProps = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  onQuantityChange: (id: string, quantity: number) => void;
};

const OrderItem = ({
  id,
  name,
  price,
  quantity,
  imageUrl,
  onQuantityChange,
}: OrderItemProps) => {
  return (
    <div className="flex gap-3" key={id}>
      <div className="relative aspect-square h-20 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={imageUrl}
          alt={name}
          fill
          unoptimized
          className="object-cover"
        />
      </div>

      <div className="flex w-full flex-col justify-between">
        <div className="flex flex-col">
          <p>{name}</p>
          <p className="text-muted-foreground text-sm">
            {toRupiah(price)} x {quantity}
          </p>
        </div>

        <div className="flex w-full justify-between">
          <p className="font-medium">{toRupiah(quantity * price)}</p>

          <div className="flex items-center gap-3">
            <button
              className="bg-secondary hover:bg-secondary/80 cursor-pointer rounded-full p-1"
              onClick={() => onQuantityChange(id, Math.max(0, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="text-sm">{quantity}</span>

            <button
              className="bg-secondary hover:bg-secondary/80 cursor-pointer rounded-full p-1"
              onClick={() => onQuantityChange(id, quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type CreateOrderSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreateOrderSheet = ({
  open,
  onOpenChange,
}: CreateOrderSheetProps) => {
  const cartStore = useCartStore();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const subtotal = cartStore.items.reduce((a, b) => {
    return a + b.price * b.quantity;
  }, 0);
  const tax = useMemo(() => subtotal * 0.1, [subtotal]);
  const grandTotal = useMemo(() => subtotal + tax, [subtotal, tax]);

  const {
    mutate: createOrder,
    isPending: isPendingCreateOrder,
    data: createdOrder,
  } = api.order.createOrder.useMutation({
    onSuccess: () => {
      toast("Order created");

      setPaymentDialogOpen(true);
    },
  });

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity !== 0) {
      cartStore.updateQuantity(id, quantity);
    } else {
      cartStore.removeFromCart(id);
      onOpenChange(false);
    }
  };

  const handleCreateOrder = () => {
    if (!cartStore.items.length) {
      toast("Cart is empty. Please add items to the cart.");
      return;
    }

    createOrder({
      orderItems: cartStore.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
  };

  const { mutate: simulatePayment, isPending: isPendingSimulatePayment } =
    api.order.simulatePayment.useMutation({
      onSuccess: () => {
        toast("Payment simulated successfully");
      },
    });

  const {
    mutate: checkOrderStatus,
    data: orderPaid,
    isPending: isPendingCheckOrderStatus,
    reset: resetCheckOrderStatus,
  } = api.order.checkOrderStatus.useMutation({
    onSuccess: (orderPaid) => {
      if (orderPaid) {
        cartStore.clearCart();
        return;
      }
    },
  });

  const isPendingCheckStatus = isPendingCheckOrderStatus || orderPaid;

  const handleRefresh = () => {
    if (!createdOrder) return;

    checkOrderStatus({
      orderId: createdOrder?.order.id,
    });
  };

  const handleSimulatePayment = () => {
    if (!createdOrder) return;

    simulatePayment({
      orderId: createdOrder?.order.id,
    });
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    onOpenChange(false);
    resetCheckOrderStatus();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full">
          <SheetHeader>
            <SheetTitle className="text-2xl">Create New Order</SheetTitle>
            <SheetDescription>
              Add products to your cart and create a new order.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 overflow-y-scroll p-4">
            <h1 className="text-xl font-medium">Order Items</h1>
            <div className="flex flex-col gap-6">
              {cartStore.items.map((item) => {
                return (
                  <OrderItem
                    key={item.productId}
                    id={item.productId}
                    name={item.name}
                    price={item.price}
                    quantity={item.quantity}
                    imageUrl={item.imageUrl}
                    onQuantityChange={handleQuantityChange}
                  />
                );
              })}
            </div>
          </div>

          <SheetFooter>
            <h3 className="text-lg font-medium">Payment Details</h3>

            <div className="grid grid-cols-2 gap-2">
              <p>Subtotal</p>
              <p className="place-self-end">{toRupiah(subtotal)}</p>

              <p>Tax</p>
              <p className="place-self-end">{toRupiah(tax)}</p>

              <Separator className="col-span-2" />

              <p>Total</p>

              <p className="place-self-end">{toRupiah(grandTotal)}</p>
            </div>

            <Button
              size="lg"
              className="mt-8 w-full"
              onClick={handleCreateOrder}
              loading={isPendingCreateOrder}
            >
              Create Order
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <AlertDialogContent>
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-lg font-medium">Finish Payment</p>

            {!isPendingCheckStatus && (
              <Button
                variant="link"
                onClick={handleRefresh}
                loading={isPendingCheckOrderStatus}
              >
                {isPendingCheckOrderStatus ? "Refreshing..." : "Refresh"}
              </Button>
            )}

            {!isPendingCheckStatus ? (
              <PaymentQRCode qrString={createdOrder?.qrString ?? ""} />
            ) : (
              <CheckCircle2 className="size-80 text-green-500" />
            )}

            <p className="text-3xl font-medium">
              {toRupiah(createdOrder?.order?.grandTotal ?? 0)}
            </p>

            <p className="text-muted-foreground text-sm">
              Transaction ID: {createdOrder?.order?.id}
            </p>

            {!isPendingCheckStatus && (
              <Button
                variant="link"
                onClick={handleSimulatePayment}
                disabled={isPendingSimulatePayment}
              >
                {isPendingSimulatePayment
                  ? "Simulating..."
                  : "Simulate Payment"}
              </Button>
            )}
          </div>

          <AlertDialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClosePaymentDialog}
              loading={isPendingCheckOrderStatus}
            >
              Done
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
