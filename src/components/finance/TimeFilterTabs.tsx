import { TimeFilter } from '@/hooks/finance/useFinancialMetrics';

interface TimeFilterTabsProps {
  activeFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
}

export function TimeFilterTabs({ activeFilter, onFilterChange }: TimeFilterTabsProps) {
  const filters: { value: TimeFilter; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-1.5 border border-white/50 shadow-glass inline-flex gap-1">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`
            px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
            ${
              activeFilter === filter.value
                ? 'bg-white text-brand shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
