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
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [transports, setTransports] = React.useState<Transport[]>([]);

  const ref = React.useRef(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useClickAway(ref, () => {
    setFocused(false);
    if (window.innerWidth < 768) {
      setIsExpanded(false);
    }
  });

  const onClickItem = () => {
    setFocused(false);
    setSearchQuery("");
    setTransports([]);
    setIsExpanded(false);
  };

  const handleSearchClick = () => {
    setIsExpanded(!isExpanded);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
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
        className={cn(
          "flex rounded-2xl h-9 relative z-30",
          "md:static md:w-[250px]",
          isExpanded ? "w-full" : "w-9",
          "ml-auto md:ml-0",
          className
        )}
      >
        <button
          onClick={handleSearchClick}
          className="md:hidden absolute left-0 top-0 w-9 h-9 flex items-center justify-center z-40 bg-gray-200 rounded-2xl"
        >
          <Search className="h-5 text-gray-400" />
        </button>

        <div className="relative flex-1 md:flex">
          <Search className="hidden md:block absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Найти ТС"
            value={searchQuery}
            onFocus={() => setFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "rounded-2xl outline-none bg-gray-200 p-2",
              "md:w-full md:opacity-100 md:visible md:pl-11",
              isExpanded
                ? "w-full opacity-100 visible pl-12 h-9"
                : "w-0 opacity-0 invisible",
              "transition-all duration-300 ease-in-out origin-right",
              "absolute right-0 md:static"
            )}
          />
        </div>

        {transports.length > 0 && (
          <div
            className={cn(
              "absolute w-full bg-white rounded-xl py-2 shadow-md transition-all duration-200 invisible opacity-0 z-30",
              "right-0 top-full",
              focused && "visible opacity-100 mt-1"
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
