"use client";

import React, { useEffect } from "react";
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
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import useAuthStore from "@/store/authUser";

interface Props {
  className?: string;
}

const breadcrumbTitles: { [key: string]: string } = {
  // Основные маршруты
  dashboard: "Дашборд",
  transport: "Транспорт",
  status: "Статусы",
  category: "Категории",
  profile: "Профиль",
  login: "Вход",
  "technical-maintenance": "Техобслуживание",
  "vehicle-assignment": "Назначение транспорта",

  // Действия
  create: "Создать",
  edit: "Редактировать",
  view: "Просмотр",
  delete: "Удалить",

  // Прочее
  api: "API",
  auth: "Авторизация",
  settings: "Настройки",
  users: "Пользователи",
  reports: "Отчеты",
};

export const Header: React.FC<Props> = ({ className }) => {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);
  const { fetchUser } = useAuthStore();

  // Проверяем авторизацию при переходе между страницами
  useEffect(() => {
    console.log("Header: Path changed, checking auth", pathname);
    fetchUser().then((user) => {
      console.log("Header: Auth check completed", { isAuthenticated: !!user });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Максимальное количество видимых элементов (без учета Home и текущей страницы)
  const maxVisibleItems = 3;
  // Нужно ли сокращать элементы (если путь длинный)
  const shouldCollapse = paths.length > maxVisibleItems + 1;
  // Индекс, с которого начинается коллапс
  const collapseStartIndex = 1;
  // Количество элементов для коллапса
  const itemsToCollapse = shouldCollapse ? paths.length - maxVisibleItems : 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b justify-between px-3 bg-background",
        className
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="flex-1 overflow-hidden">
          <BreadcrumbList className="flex-nowrap overflow-x-auto no-scrollbar">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Главная</BreadcrumbLink>
            </BreadcrumbItem>

            {paths.map((path, index) => {
              const href = "/" + paths.slice(0, index + 1).join("/");
              const isNumber = !isNaN(Number(path));
              const title = isNumber
                ? `#${path}`
                : breadcrumbTitles[path] || path;

              // Скрываем элементы, которые нужно коллапсировать
              if (
                shouldCollapse &&
                index >= collapseStartIndex &&
                index < collapseStartIndex + itemsToCollapse
              ) {
                // Показываем эллипсис только на первом свернутом элементе
                if (index === collapseStartIndex) {
                  return (
                    <React.Fragment key={`ellipsis-${index}`}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbEllipsis />
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                }
                // Остальные свернутые элементы не показываем
                return null;
              }

              return (
                <React.Fragment key={`${path}-${index}`}>
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
