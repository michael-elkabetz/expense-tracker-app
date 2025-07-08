import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useExpenseStore, useExpenseData } from '@/stores/expense-store';
import { Expense, ExpenseCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/expense';
import { formatCurrency, formatDate, groupExpensesByDate } from '@/lib/expense-utils';
import { Search, Filter, Trash2, Edit, Receipt, RefreshCw, SortDesc, SortAsc } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ExpenseListProps {
  onEditExpense?: (expense: Expense) => void;
  showActions?: boolean;
  limit?: number;
}

export const ExpenseList = ({ onEditExpense, showActions = true, limit }: ExpenseListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  const { expenses, totalExpenses, isLoading, error } = useExpenseData();
  const { deleteExpense, setFilter, clearFilter } = useExpenseStore();
  const { toast } = useToast();

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.amount.toString().includes(searchTerm)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // Apply limit
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [expenses, searchTerm, selectedCategory, sortOrder, limit]);

  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    return groupExpensesByDate(filteredExpenses);
  }, [filteredExpenses]);

  const handleDeleteExpense = (id: string) => {
    try {
      deleteExpense(id);
      toast({
        title: "Expense Deleted",
        description: "The expense has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortOrder('desc');
    clearFilter();
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading expenses...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-red-500">
          <span>Error: {error}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Expenses</h2>
          <p className="text-muted-foreground">
            Total: {formatCurrency(totalExpenses)} • {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
          >
            {sortOrder === 'desc' ? <SortDesc className="w-4 h-4 mr-2" /> : <SortAsc className="w-4 h-4 mr-2" />}
            {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ExpenseCategory | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedCategory !== 'all' 
                ? "Try adjusting your filters or search term"
                : "Start by adding your first expense"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedExpenses).map(([dateKey, dayExpenses]) => (
            <div key={dateKey} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {formatDate(new Date(dateKey))}
                </h3>
                <div className="text-sm text-muted-foreground">
                  {dayExpenses.length} expense{dayExpenses.length !== 1 ? 's' : ''} • {formatCurrency(
                    dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                {dayExpenses.map((expense) => (
                  <Card key={expense.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={cn("text-xs", CATEGORY_COLORS[expense.category])}>
                              {CATEGORY_LABELS[expense.category]}
                            </Badge>
                            {expense.receiptImage && (
                              <Receipt className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <p className="font-medium text-lg mb-1">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(expense.date), 'MMM d, yyyy • h:mm a')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {formatCurrency(expense.amount)}
                            </div>
                          </div>
                          {showActions && (
                            <div className="flex gap-1">
                              {onEditExpense && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditExpense(expense)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this expense? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteExpense(expense.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {expense.receiptImage && (
                        <div className="mt-3 pt-3 border-t">
                          <img
                            src={expense.receiptImage}
                            alt="Receipt"
                            className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              // Open image in new tab
                              window.open(expense.receiptImage, '_blank');
                            }}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};