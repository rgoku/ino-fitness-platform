'use client';

import { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Copy,
  Send,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Beef,
  Wheat,
  Carrot,
  Apple,
  Milk,
  Package,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';

// --- Mock Data ---

type GroceryItem = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: 'proteins' | 'carbs' | 'vegetables' | 'fruits' | 'dairy' | 'pantry';
  estimatedCost: number;
  meals: string[];
};

const mockGroceryItems: GroceryItem[] = [
  // Proteins
  { id: '1', name: 'Chicken Breast', quantity: '2.4', unit: 'kg', category: 'proteins', estimatedCost: 18.50, meals: ['Lunch Mon', 'Dinner Tue', 'Lunch Wed', 'Dinner Thu', 'Lunch Fri'] },
  { id: '2', name: 'Salmon Fillet', quantity: '800', unit: 'g', category: 'proteins', estimatedCost: 22.00, meals: ['Dinner Mon', 'Dinner Wed'] },
  { id: '3', name: 'Eggs (Free Range)', quantity: '24', unit: 'pcs', category: 'proteins', estimatedCost: 8.50, meals: ['Breakfast daily'] },
  { id: '4', name: 'Greek Yogurt (Plain)', quantity: '1.5', unit: 'kg', category: 'proteins', estimatedCost: 7.20, meals: ['Snack daily'] },
  { id: '5', name: 'Lean Ground Turkey', quantity: '500', unit: 'g', category: 'proteins', estimatedCost: 9.80, meals: ['Dinner Fri', 'Lunch Sat'] },
  // Carbs
  { id: '6', name: 'Brown Rice', quantity: '1', unit: 'kg', category: 'carbs', estimatedCost: 4.50, meals: ['Lunch Mon-Fri'] },
  { id: '7', name: 'Sweet Potatoes', quantity: '1.5', unit: 'kg', category: 'carbs', estimatedCost: 5.20, meals: ['Dinner Mon', 'Dinner Wed', 'Dinner Fri'] },
  { id: '8', name: 'Oats (Rolled)', quantity: '750', unit: 'g', category: 'carbs', estimatedCost: 3.80, meals: ['Breakfast daily'] },
  { id: '9', name: 'Whole Wheat Pasta', quantity: '500', unit: 'g', category: 'carbs', estimatedCost: 2.90, meals: ['Dinner Tue', 'Lunch Sat'] },
  { id: '10', name: 'Quinoa', quantity: '400', unit: 'g', category: 'carbs', estimatedCost: 5.50, meals: ['Lunch Wed', 'Lunch Fri'] },
  // Vegetables
  { id: '11', name: 'Broccoli', quantity: '1', unit: 'kg', category: 'vegetables', estimatedCost: 4.20, meals: ['Dinner Mon', 'Lunch Wed', 'Dinner Fri'] },
  { id: '12', name: 'Spinach (Baby)', quantity: '400', unit: 'g', category: 'vegetables', estimatedCost: 3.90, meals: ['Lunch daily', 'Smoothie'] },
  { id: '13', name: 'Bell Peppers (Mixed)', quantity: '6', unit: 'pcs', category: 'vegetables', estimatedCost: 5.40, meals: ['Lunch Tue', 'Dinner Wed', 'Lunch Thu'] },
  { id: '14', name: 'Zucchini', quantity: '4', unit: 'pcs', category: 'vegetables', estimatedCost: 3.60, meals: ['Dinner Tue', 'Dinner Thu'] },
  { id: '15', name: 'Cherry Tomatoes', quantity: '500', unit: 'g', category: 'vegetables', estimatedCost: 4.00, meals: ['Lunch daily'] },
  // Fruits
  { id: '16', name: 'Bananas', quantity: '7', unit: 'pcs', category: 'fruits', estimatedCost: 2.80, meals: ['Breakfast daily'] },
  { id: '17', name: 'Blueberries', quantity: '500', unit: 'g', category: 'fruits', estimatedCost: 6.50, meals: ['Breakfast daily', 'Snack'] },
  { id: '18', name: 'Avocados', quantity: '5', unit: 'pcs', category: 'fruits', estimatedCost: 7.50, meals: ['Lunch Mon', 'Lunch Wed', 'Lunch Fri', 'Breakfast Sat', 'Breakfast Sun'] },
  // Dairy
  { id: '19', name: 'Whole Milk', quantity: '2', unit: 'L', category: 'dairy', estimatedCost: 4.40, meals: ['Breakfast daily', 'Smoothie'] },
  { id: '20', name: 'Cheddar Cheese', quantity: '200', unit: 'g', category: 'dairy', estimatedCost: 4.80, meals: ['Lunch Tue', 'Dinner Thu'] },
  { id: '21', name: 'Cottage Cheese', quantity: '500', unit: 'g', category: 'dairy', estimatedCost: 3.90, meals: ['Snack Mon', 'Snack Wed', 'Snack Fri'] },
  // Pantry
  { id: '22', name: 'Olive Oil (Extra Virgin)', quantity: '500', unit: 'ml', category: 'pantry', estimatedCost: 8.90, meals: ['Cooking daily'] },
  { id: '23', name: 'Almond Butter', quantity: '350', unit: 'g', category: 'pantry', estimatedCost: 7.80, meals: ['Breakfast daily', 'Snack'] },
  { id: '24', name: 'Whey Protein Powder', quantity: '500', unit: 'g', category: 'pantry', estimatedCost: 18.00, meals: ['Post-workout daily'] },
  { id: '25', name: 'Chia Seeds', quantity: '200', unit: 'g', category: 'pantry', estimatedCost: 4.50, meals: ['Breakfast daily'] },
];

const categories = [
  { id: 'proteins', label: 'Proteins', icon: Beef, color: 'text-red-500' },
  { id: 'carbs', label: 'Carbs', icon: Wheat, color: 'text-amber-500' },
  { id: 'vegetables', label: 'Vegetables', icon: Carrot, color: 'text-green-500' },
  { id: 'fruits', label: 'Fruits', icon: Apple, color: 'text-orange-500' },
  { id: 'dairy', label: 'Dairy', icon: Milk, color: 'text-blue-500' },
  { id: 'pantry', label: 'Pantry', icon: Package, color: 'text-purple-500' },
] as const;

const weekTabs = [
  { id: 'this-week', label: 'This Week' },
  { id: 'next-week', label: 'Next Week' },
];

export default function GroceryCalculatorPage() {
  const [activeWeek, setActiveWeek] = useState('this-week');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('proteins');
  const [listGenerated, setListGenerated] = useState(false);
  const [copying, setCopying] = useState(false);

  const items = useMemo(() => {
    // Mock: next week has slightly different quantities
    if (activeWeek === 'next-week') {
      return mockGroceryItems.map((item) => ({
        ...item,
        quantity: (parseFloat(item.quantity) * 1.1).toFixed(1),
        estimatedCost: +(item.estimatedCost * 1.05).toFixed(2),
      }));
    }
    return mockGroceryItems;
  }, [activeWeek]);

  const totalCost = useMemo(() => items.reduce((sum, item) => sum + item.estimatedCost, 0), [items]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, GroceryItem[]> = {};
    for (const cat of categories) {
      groups[cat.id] = items.filter((i) => i.category === cat.id);
    }
    return groups;
  }, [items]);

  const categoryCosts = useMemo(() => {
    const costs: Record<string, number> = {};
    for (const cat of categories) {
      costs[cat.id] = groupedItems[cat.id].reduce((sum, i) => sum + i.estimatedCost, 0);
    }
    return costs;
  }, [groupedItems]);

  const handleCopy = () => {
    const text = categories
      .map((cat) => {
        const catItems = groupedItems[cat.id];
        if (catItems.length === 0) return '';
        return `${cat.label.toUpperCase()}\n${catItems.map((i) => `  - ${i.name}: ${i.quantity} ${i.unit}`).join('\n')}`;
      })
      .filter(Boolean)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.6rem] font-semibold tracking-tight text-[var(--color-text-primary)]">
            AI Grocery Calculator
          </h1>
          <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
            Smart shopping lists from your clients&apos; meal plans
          </p>
        </div>
        <Badge variant="brand" dot>
          <Sparkles size={12} className="mr-1" />
          AI-Powered
        </Badge>
      </div>

      {/* Week Toggle */}
      <Tabs tabs={weekTabs} activeTab={activeWeek} onChange={setActiveWeek} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-body-xs text-[var(--color-text-tertiary)]">Total Items</p>
            <p className="text-xl font-semibold tabular-nums text-[var(--color-text-primary)]">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-body-xs text-[var(--color-text-tertiary)]">Categories</p>
            <p className="text-xl font-semibold tabular-nums text-[var(--color-text-primary)]">{categories.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-body-xs text-[var(--color-text-tertiary)]">Est. Budget</p>
            <p className="text-xl font-semibold tabular-nums text-[var(--color-text-primary)]">${totalCost.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-body-xs text-[var(--color-text-tertiary)]">Duplicates Saved</p>
            <p className="text-xl font-semibold tabular-nums text-[var(--color-text-primary)]">8</p>
          </CardContent>
        </Card>
      </div>

      {/* Smart List Notice */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
        <CardContent className="py-4 flex items-start gap-3">
          <ShoppingCart size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-body-sm font-medium text-[var(--color-text-primary)]">Smart List Active</p>
            <p className="text-body-xs text-[var(--color-text-secondary)]">
              Duplicates have been consolidated and quantities aggregated across all meals. 8 redundant entries removed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Sections */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const catItems = groupedItems[cat.id];
          const isExpanded = expandedCategory === cat.id;
          const catCost = categoryCosts[cat.id];

          return (
            <Card key={cat.id}>
              <button
                className="w-full px-6 py-4 flex items-center justify-between"
                onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={cat.color} />
                  <span className="text-body-sm font-medium text-[var(--color-text-primary)]">{cat.label}</span>
                  <Badge variant="default">{catItems.length} items</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-body-sm font-medium tabular-nums text-[var(--color-text-secondary)]">
                    ${catCost.toFixed(2)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-[var(--color-text-tertiary)]" />
                  ) : (
                    <ChevronDown size={16} className="text-[var(--color-text-tertiary)]" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <CardContent className="pt-0 pb-4">
                  <div className="border-t border-[var(--color-border-light)] pt-3">
                    <table className="w-full">
                      <thead>
                        <tr className="text-body-xs text-[var(--color-text-tertiary)]">
                          <th className="text-left font-medium pb-2">Item</th>
                          <th className="text-right font-medium pb-2">Qty</th>
                          <th className="text-right font-medium pb-2 hidden sm:table-cell">Used In</th>
                          <th className="text-right font-medium pb-2">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border-light)]">
                        {catItems.map((item) => (
                          <tr key={item.id} className="group">
                            <td className="py-2.5 text-body-sm text-[var(--color-text-primary)]">{item.name}</td>
                            <td className="py-2.5 text-body-sm text-right tabular-nums text-[var(--color-text-secondary)]">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-2.5 text-body-xs text-right text-[var(--color-text-tertiary)] hidden sm:table-cell max-w-[180px] truncate">
                              {item.meals.join(', ')}
                            </td>
                            <td className="py-2.5 text-body-sm text-right tabular-nums font-medium text-[var(--color-text-primary)]">
                              ${item.estimatedCost.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-body-sm font-medium text-[var(--color-text-primary)]">Total Estimated Budget</p>
              <p className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">${totalCost.toFixed(2)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!listGenerated ? (
                <Button
                  variant="primary"
                  icon={<Sparkles size={14} />}
                  onClick={() => setListGenerated(true)}
                >
                  Generate Shopping List
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    icon={<Copy size={14} />}
                    onClick={handleCopy}
                  >
                    {copying ? 'Copied!' : 'Copy to Clipboard'}
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Send size={14} />}
                    onClick={() => {}}
                  >
                    Send to Client
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Printer size={14} />}
                    onClick={handlePrint}
                  >
                    Print
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated List Preview */}
      {listGenerated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-blue-600" />
              Generated Shopping List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 print:space-y-2">
              {categories.map((cat) => {
                const catItems = groupedItems[cat.id];
                if (catItems.length === 0) return null;
                const Icon = cat.icon;
                return (
                  <div key={cat.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} className={cat.color} />
                      <h4 className="text-body-sm font-medium text-[var(--color-text-primary)]">{cat.label}</h4>
                    </div>
                    <ul className="space-y-1 pl-6">
                      {catItems.map((item) => (
                        <li key={item.id} className="text-body-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-tertiary)] shrink-0" />
                          <span>{item.name}</span>
                          <span className="text-[var(--color-text-tertiary)] tabular-nums">
                            ({item.quantity} {item.unit})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
