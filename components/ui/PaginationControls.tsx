import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

type PaginationControlProps = {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
};

const PaginationControls = ({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
}: PaginationControlProps) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  const onPrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const onNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={currentPage > 1 ? onPrev : undefined}
            className={currentPage <= 1 ? "opacity-50 cursor-not-allowed" : ""}
            aria-disabled={currentPage <= 1}
          />
        </PaginationItem>
        {/* Add numbered pages here if needed */}
        <PaginationItem>
          <PaginationNext
            onClick={currentPage < totalPages ? onNext : undefined}
            className={
              currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : ""
            }
            aria-disabled={currentPage >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
