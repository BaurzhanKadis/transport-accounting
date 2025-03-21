"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useMenuItem } from "@/store/menuItem";
import { useEffect } from "react";

// This is sample data.
const data = {
  navMain: [
    {
      id: 1,
      title: "Главная",
      url: "/",
    },
    {
      id: 2,
      title: "Автопарк",
      url: "#",
      items: [
        {
          id: 21,
          title: "Автопарк",
          url: "/transport",
          isActive: false,
        },
        {
          id: 22,
          title: "Назначения на ТС",
          url: "/vehicle-assignment",
          isActive: false,
        },
        {
          id: 23,
          title: "Статус ТС",
          url: "/status",
        },
        {
          id: 24,
          title: "ТО1 и ТО2",
          url: "/technical-maintenance",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const activeId = useMenuItem((state) => state.activeId);
  const setActiveId = useMenuItem((state) => state.setActiveId);
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = (id: number) => {
    setActiveId(id);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Функция для проверки, является ли пункт или его подпункты активными
  const isItemActive = (item: (typeof data.navMain)[0]) => {
    if (item.id === activeId) return true;
    if (item.items) {
      return item.items.some((subItem) => subItem.id === activeId);
    }
    return false;
  };

  useEffect(() => {
    const findActiveId = () => {
      for (const item of data.navMain) {
        if (item.url === pathname) {
          return item.id;
        }
        if (item.items) {
          const activeSubItem = item.items.find(
            (subItem) => subItem.url === pathname
          );
          if (activeSubItem) {
            return activeSubItem.id;
          }
        }
      }
      return 1;
    };

    setActiveId(findActiveId());
  }, [pathname, setActiveId]);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="#"
                onClick={() => handleLinkClick(1)}
                className="flex items-center"
              >
                <Image
                  src="/logo.webp"
                  alt="logo"
                  width={100}
                  height={100}
                  className="w-10 h-10 rounded-lg"
                />
                <div className="flex flex-col ml-3">
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent leading-tight">
                    Transport
                  </span>
                  <span className="text-sm font-medium text-slate-600 -mt-1">
                    accounting
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.url}
                    onClick={() => handleLinkClick(item.id)}
                    className={`font-medium transition-colors duration-200 ${
                      isItemActive(item)
                        ? "text-blue-600"
                        : "text-slate-600 hover:text-blue-600"
                    }`}
                  >
                    {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.id}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={activeId === subItem.id}
                          className={`transition-colors duration-200 ${
                            activeId === subItem.id
                              ? "!bg-blue-600 !text-white"
                              : "hover:bg-slate-50 hover:text-blue-600"
                          }`}
                        >
                          <Link
                            href={subItem.url}
                            onClick={() => handleLinkClick(subItem.id)}
                          >
                            {subItem.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
