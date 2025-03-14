"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useDebounce } from "react-use";
import { Api } from "@/services/api-client";
import { Category, Transport } from "@prisma/client";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";

interface Props {
  className?: string;
}

export const SideBar: React.FC<Props> = ({ className }) => {
  const [allTransports, setAllTransports] = React.useState<Transport[]>([]);
  const [categoryes, setCategoryes] = React.useState<Category[]>([]);

  useDebounce(
    async () => {
      try {
        const response = await Api.transports.allTransport();
        const bigData = await Api.categoryes.categoryes();
        setAllTransports(response);
        setCategoryes(bigData);
        console.log(bigData);
      } catch (error) {
        console.log(error);
      }
    },
    250,
    []
  );

  return (
    <div className={cn(className)}>
      <div className="flex items-center justify-between m-4">
        <h4>Траспортные средства</h4>
        <strong className="bg-white rounded-lg py-[1px] px-2">
          {allTransports.length}
        </strong>
      </div>
      {/* Categoryes */}
      <div className="m-4 bg-gradient-to-r from-sky-500 to-indigo-500">
        {categoryes.length > 0 ? (
          <>
            {categoryes.map((item) => (
              <Link
                key={item.id}
                href={`/transport/category/${item.id}`}
                className="flex justify-between mb-1 outline-slate-400 hover:outline-dashed"
              >
                <span className=" font-bold">{item.name}</span>
                <span className="bg-white rounded-lg py-[1px] px-2">
                  {allTransports.filter((e) => e.categoryId === item.id).length}
                </span>
              </Link>
            ))}
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Skeleton className="w-full h-[20px] rounded-full" />
            <Skeleton className="w-full h-[20px] rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
