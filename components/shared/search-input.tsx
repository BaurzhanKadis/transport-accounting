"use client";
import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Api } from "@/services/api-client";
import { Search } from "lucide-react";
import { useClickAway, useDebounce } from "react-use";
import { Transport } from "@prisma/client";

interface Props {
  className?: string;
}

export const SearchInput: React.FC<Props> = ({ className }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [transports, setTransports] = React.useState<Transport[]>([]);

  const ref = React.useRef(null);

  useClickAway(ref, () => {
    setFocused(false);
  });
  const onClickItem = () => {
    setFocused(false);
    setSearchQuery("");
    setTransports([]);
  };
  useDebounce(
    async () => {
      try {
        const response = await Api.transports.search(searchQuery);
        if (searchQuery.length > 0) {
          setTransports(response);
        }
      } catch (error) {
        console.log(error);
      }
    },
    250,
    [searchQuery]
  );

  return (
    <>
      {focused && (
        <div className="fixed top-0 left-0 bottom-0 right-0 bg-black/50 z-30" />
      )}

      <div
        ref={ref}
        className={cn(" flex rounded-2xl h-9 relative z-30", className)}
      >
        <Search className=" absolute top-1/2 translate-y-[-50%] left-3 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Найти ТС"
          onFocus={() => setFocused(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
          className=" rounded-2xl outline-none w-full bg-gray-200 pl-11 p-3"
        />
        {transports.length > 0 && (
          <div
            className={cn(
              "absolute w-full bg-white rounded-xl py-2 top-14 shadow-md transition-all duration-200 invisible opacity-0 z-30",
              focused && "visible opacity-100 top-12"
            )}
          >
            {transports.map((transport) => (
              <Link
                onClick={onClickItem}
                key={transport.id}
                className="flex items-center gap-3 w-full px-3 py-2 hover:bg-primary/10"
                href={`/transport/${transport.id}`}
              >
                <span>{transport.gosNumber}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
