"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SearchInput } from "./search-input";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface Props {
  className?: string;
}

const breadcrumbTitles: { [key: string]: string } = {
  transport: "Транспорт",
  status: "Статусы",
  category: "Категории",
  create: "Создать",
  edit: "Редактировать",
};

export const Header: React.FC<Props> = ({ className }) => {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center gap-2 border-b justify-between px-3",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Главная</BreadcrumbLink>
            </BreadcrumbItem>
            {paths.map((path, index) => {
              const href = "/" + paths.slice(0, index + 1).join("/");
              const isNumber = !isNaN(Number(path));
              const title = isNumber
                ? `#${path}`
                : breadcrumbTitles[path] || path;

              return (
                <React.Fragment key={path}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index === paths.length - 1 ? (
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <SearchInput />
    </header>
  );
};
