import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CreateExpenseSchema, CreateExpenseInput, CATEGORY_LABELS, ExpenseCategory } from '@/types/expense';
import { formatDateForInput, generateId } from '@/lib/expense-utils';
import { Camera, Upload, X } from 'lucide-react';

interface ExpenseEntryFormProps {
  onSubmit: (expense: CreateExpenseInput) => void;
  onCancel?: () => void;
  defaultValues?: Partial<CreateExpenseInput>;
}

export const ExpenseEntryForm = ({ onSubmit, onCancel, defaultValues }: ExpenseEntryFormProps) => {
  const [receiptImage, setReceiptImage] = useState<string | null>(defaultValues?.receiptImage || null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(CreateExpenseSchema),
    defaultValues: {
      amount: defaultValues?.amount || 0,
      category: defaultValues?.category || 'other',
      description: defaultValues?.description || '',
      date: defaultValues?.date || new Date(),
      receiptImage: defaultValues?.receiptImage || undefined
    }
  });

  const watchedCategory = watch('category');

  const handleFormSubmit = async (data: CreateExpenseInput) => {
    try {
      const expenseData = {
        ...data,
        receiptImage: receiptImage || undefined
      };

      onSubmit(expenseData);
      
      toast({
        title: "Expense Added",
        description: "Your expense has been successfully recorded.",
      });

      // Reset form
      reset();
      setReceiptImage(null);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setReceiptImage(result);
        setValue('receiptImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setReceiptImage(null);
    setValue('receiptImage', undefined);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Expense</CardTitle>
        <CardDescription>
          Enter your expense details below. All fields are required except receipt image.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
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
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter expense description..."
              {...register('description')}
              className={errors.description ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register('date', { valueAsDate: true })}
              className={errors.date ? 'border-red-500' : ''}
              defaultValue={formatDateForInput(new Date())}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Receipt Image */}
          <div className="space-y-2">
            <Label>Receipt Image (Optional)</Label>
            <div className="space-y-3">
              {receiptImage ? (
                <div className="relative">
                  <img
                    src={receiptImage}
                    alt="Receipt"
                    className="w-full max-w-sm h-48 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Label htmlFor="receipt-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload Receipt</span>
                    </div>
                    <Input
                      id="receipt-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </Label>
                  <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-500">
                    <Camera className="w-4 h-4" />
                    <span>Take Photo (Web)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
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