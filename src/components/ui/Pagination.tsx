"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-[14px]"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-2 p-1.5 rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--foreground)]/5 shadow-premium">
        {getPages().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <MoreHorizontal className="w-4 h-4 opacity-40" />
              </div>
            ) : (
              <Button
                variant={currentPage === page ? "primary" : "ghost"}
                size="icon"
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "h-10 w-10 rounded-[12px] text-[12px] font-black transition-all",
                  currentPage === page ? "shadow-glow-purple" : "opacity-40 hover:opacity-100"
                )}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-[14px]"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
