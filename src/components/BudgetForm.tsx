import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CreateBudgetSchema, CreateBudgetInput, CATEGORY_LABELS, ExpenseCategory } from '@/types/expense';
import { formatCurrency } from '@/lib/expense-utils';
import { TrendingUp } from 'lucide-react';

interface BudgetFormProps {
  onSubmit: (budget: CreateBudgetInput) => void;
  onCancel?: () => void;
  defaultValues?: Partial<CreateBudgetInput>;
  existingCategories?: ExpenseCategory[];
}

export const BudgetForm = ({ onSubmit, onCancel, defaultValues, existingCategories = [] }: BudgetFormProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<CreateBudgetInput>({
    resolver: zodResolver(CreateBudgetSchema),
    defaultValues: {
      category: defaultValues?.category || 'other',
      amount: defaultValues?.amount || 0,
      period: defaultValues?.period || 'monthly'
    }
  });

  const watchedCategory = watch('category');
  const watchedPeriod = watch('period');

  const handleFormSubmit = async (data: CreateBudgetInput) => {
    try {
      // Check if budget already exists for this category
      if (existingCategories.includes(data.category) && !defaultValues) {
        toast({
          title: "Budget Exists",
          description: "A budget for this category already exists. Please edit the existing budget or choose a different category.",
          variant: "destructive",
        });
        return;
      }

      onSubmit(data);
      
      toast({
        title: "Budget Saved",
        description: `Budget for ${CATEGORY_LABELS[data.category]} has been ${defaultValues ? 'updated' : 'created'} successfully.`,
      });

      if (!defaultValues) {
        reset();
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter out categories that already have budgets (except current one being edited)
  const availableCategories = Object.entries(CATEGORY_LABELS).filter(([value]) => 
    !existingCategories.includes(value as ExpenseCategory) || value === defaultValues?.category
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {defaultValues ? 'Edit Budget' : 'Create Budget'}
        </CardTitle>
        <CardDescription>
          Set spending limits for different expense categories to help manage your finances.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watchedCategory}
              onValueChange={(value) => setValue('category', value as ExpenseCategory)}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
            {availableCategories.length === 0 && (
              <p className="text-sm text-yellow-600">
                All categories already have budgets. Please edit existing budgets.
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period">Budget Period</Label>
            <Select
              value={watchedPeriod}
              onValueChange={(value) => setValue('period', value as 'monthly' | 'weekly' | 'yearly')}
            >
              <SelectTrigger className={errors.period ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            {errors.period && (
              <p className="text-sm text-red-500">{errors.period.message}</p>
            )}
          </div>

          {/* Budget Summary */}
          {watch('amount') > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Budget Summary</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>Category: {CATEGORY_LABELS[watchedCategory]}</p>
                <p>Amount: {formatCurrency(watch('amount') || 0)}</p>
                <p>Period: {watchedPeriod}</p>
                {watchedPeriod === 'monthly' && (
                  <p>Daily allowance: {formatCurrency((watch('amount') || 0) / 30)}</p>
                )}
                {watchedPeriod === 'weekly' && (
                  <p>Daily allowance: {formatCurrency((watch('amount') || 0) / 7)}</p>
                )}
                {watchedPeriod === 'yearly' && (
                  <p>Monthly allowance: {formatCurrency((watch('amount') || 0) / 12)}</p>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || availableCategories.length === 0}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : defaultValues ? 'Update Budget' : 'Create Budget'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};