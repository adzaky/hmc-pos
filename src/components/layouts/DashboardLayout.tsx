import { BarChart3, Grid3X3, Package, ShoppingCart } from "lucide-react";
import React, { type ReactNode } from "react";

import { SignOutButton } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

// App sidebar component
const AppSidebar = () => {
  const { toggleSidebar } = useSidebar();

  const [isPendingSignOut, setIsPendingSignOut] =
    React.useState<boolean>(false);

  const router = useRouter();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-bold">Hammercode POS</h2>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Create Order"
              isActive={router.pathname.includes("/dashboard")}
              onClick={toggleSidebar}
            >
              <Link href="/dashboard">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create Order
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="my-2" />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Category Management"
              isActive={router.pathname.includes("/categories")}
              onClick={toggleSidebar}
            >
              <Link href="/categories">
                <Grid3X3 className="mr-2 h-4 w-4" />
                Category Management
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Product Management"
              isActive={router.pathname.includes("/products")}
              onClick={toggleSidebar}
            >
              <Link href="/products">
                <Package className="mr-2 h-4 w-4" />
                Product Management
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Sales Dashboard"
              isActive={router.pathname.includes("/sales")}
              onClick={toggleSidebar}
            >
              <Link href="/sales">
                <BarChart3 className="mr-2 h-4 w-4" />
                Sales Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <p className="text-muted-foreground text-xs">Hammercode POS v1.0</p>
        <SignOutButton redirectUrl="/sign-in">
          <Button
            variant="destructive"
            className="hover:opacity-80"
            onClick={() => setIsPendingSignOut(true)}
            loading={isPendingSignOut}
          >
            Sign Out
          </Button>
        </SignOutButton>
      </SidebarFooter>
    </Sidebar>
  );
};

// Dashboard header component
interface DashboardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const DashboardHeader = ({
  children,
  className = "",
}: DashboardHeaderProps) => {
  return <header className={`mb-6 space-y-2 ${className}`}>{children}</header>;
};

// Dashboard title component
interface DashboardTitleProps {
  children: ReactNode;
  className?: string;
}

export const DashboardTitle = ({
  children,
  className = "",
}: DashboardTitleProps) => {
  return (
    <h1 className={`text-2xl font-bold tracking-tight ${className}`}>
      {children}
    </h1>
  );
};

// Dashboard description component
interface DashboardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const DashboardDescription = ({
  children,
  className = "",
}: DashboardDescriptionProps) => {
  return <p className={`text-muted-foreground ${className}`}>{children}</p>;
};

// Main dashboard layout component
interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h3 className="text-lg font-bold">Hammercode POS</h3>
          </header>
          <main className="relative flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
