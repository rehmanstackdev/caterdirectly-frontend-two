


interface TableHeaderActionsProps {
  onPrevious: () => void;
  onNext: () => void;
  currentPage: number;
  totalPages: number;
}

const TableHeaderActions = ({ onPrevious, onNext, currentPage, totalPages }: TableHeaderActionsProps) => {
  return (
    <div className="flex gap-2">
      <button 
        className={`px-4 py-2 text-sm border rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
        onClick={onPrevious}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <button 
        className={`px-4 py-2 text-sm border rounded-md ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
        onClick={onNext}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        Next
      </button>
    </div>
  );
};

export default TableHeaderActions;
