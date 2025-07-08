import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Budget, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/expense';
import { formatCurrency } from '@/lib/expense-utils';
import { Edit, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetCard = ({ budget, spent, remaining, percentage, onEdit, onDelete }: BudgetCardProps) => {
  const isOverBudget = percentage > 100;
  const isNearLimit = percentage > 80 && percentage <= 100;
  const isOnTrack = percentage <= 80;

  const getStatusColor = () => {
    if (isOverBudget) return 'text-red-600';
    if (isNearLimit) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (isNearLimit) return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isOverBudget) return 'Over Budget';
    if (isNearLimit) return 'Near Limit';
    return 'On Track';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", CATEGORY_COLORS[budget.category])}>
              {CATEGORY_LABELS[budget.category]}
            </Badge>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className={cn("text-sm font-medium", getStatusColor())}>
                {getStatusText()}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(budget)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this budget for {CATEGORY_LABELS[budget.category]}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(budget.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Amount */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(budget.amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Period</p>
            <p className="text-sm font-medium capitalize">{budget.period}</p>
          </div>
        </div>

        {/* Spending Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Spent</span>
            <span className={cn("text-sm font-medium", getStatusColor())}>
              {formatCurrency(spent)} ({Math.round(percentage)}%)
            </span>
          </div>
          <Progress 
            value={Math.min(percentage, 100)} 
            className="h-2"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Remaining</span>
            <span className={cn("text-sm font-medium", isOverBudget ? "text-red-600" : "text-green-600")}>
              {isOverBudget ? `-${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Status Messages */}
        {isOverBudget && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">
                You've exceeded your budget by {formatCurrency(Math.abs(remaining))}
              </p>
            </div>
          </div>
        )}
        
        {isNearLimit && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                You're approaching your budget limit. {formatCurrency(remaining)} remaining.
              </p>
            </div>
          </div>
        )}
        
        {isOnTrack && percentage > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-700">
                Good job! You're staying within your budget.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};