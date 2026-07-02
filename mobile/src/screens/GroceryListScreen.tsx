import React, { useState } from '../lib/react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CheckIcon } from '../components/icons';
import { useEffect, useCallback } from 'react';
import { socialService, GroceryCategoryDTO } from '../services/socialService';

// ─── Design Tokens ──────────────────────────────────────────────────────────

const colors = {
  bg: '#0A0F1E',
  surface: '#0C1220',
  border: '#1E293B',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  brand: '#2563EB',
  success: '#10B981',
};

// ─── Mock Data ──────────────────────────────────────────────────────────────

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
}

interface GroceryCategory {
  id: string;
  icon: string;
  label: string;
  items: GroceryItem[];
}

const groceryCategories: GroceryCategory[] = [
  {
    id: 'proteins',
    icon: '\u{1F969}',
    label: 'Proteins',
    items: [
      { id: 'p1', name: 'Chicken breast', quantity: '1.5kg' },
      { id: 'p2', name: 'Salmon', quantity: '500g' },
      { id: 'p3', name: 'Eggs', quantity: '2 dozen' },
      { id: 'p4', name: 'Greek yogurt', quantity: '1kg' },
    ],
  },
  {
    id: 'carbs',
    icon: '\u{1F35A}',
    label: 'Carbs',
    items: [
      { id: 'c1', name: 'Brown rice', quantity: '1kg' },
      { id: 'c2', name: 'Sweet potatoes', quantity: '2kg' },
      { id: 'c3', name: 'Oats', quantity: '500g' },
    ],
  },
  {
    id: 'vegetables',
    icon: '\u{1F966}',
    label: 'Vegetables',
    items: [
      { id: 'v1', name: 'Broccoli', quantity: '1kg' },
      { id: 'v2', name: 'Spinach', quantity: '500g' },
      { id: 'v3', name: 'Bell peppers', quantity: 'x6' },
      { id: 'v4', name: 'Onions', quantity: 'x4' },
    ],
  },
  {
    id: 'fruits',
    icon: '\u{1F34E}',
    label: 'Fruits',
    items: [
      { id: 'f1', name: 'Bananas', quantity: 'x7' },
      { id: 'f2', name: 'Blueberries', quantity: '500g' },
      { id: 'f3', name: 'Avocados', quantity: 'x4' },
    ],
  },
  {
    id: 'dairy',
    icon: '\u{1F95B}',
    label: 'Dairy',
    items: [
      { id: 'd1', name: 'Milk', quantity: '2L' },
      { id: 'd2', name: 'Cottage cheese', quantity: '500g' },
    ],
  },
  {
    id: 'pantry',
    icon: '\u{1FAD9}',
    label: 'Pantry',
    items: [
      { id: 'pt1', name: 'Olive oil', quantity: '1 bottle' },
      { id: 'pt2', name: 'Almonds', quantity: '250g' },
      { id: 'pt3', name: 'Whey protein', quantity: '1 tub' },
    ],
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  proteins: '\u{1F969}',
  carbs: '\u{1F35A}',
  produce: '\u{1F966}',
  fats: '\u{1F9C0}',
  other: '\u{1F6D2}',
};

function toCategory(c: GroceryCategoryDTO): GroceryCategory {
  return {
    id: c.id,
    icon: CATEGORY_ICONS[c.id] || CATEGORY_ICONS.other,
    label: c.label,
    items: c.items.map((it, i) => ({ id: `${c.id}-${i}-${it.name}`, name: it.name, quantity: it.quantity || '' })),
  };
}

export default function GroceryListScreen() {
  const [selectedWeek, setSelectedWeek] = useState<'this' | 'next'>('this');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<GroceryCategory[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await socialService.getGroceryList();
      setCategories(res.categories.map(toCategory));
    } catch (e) {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  const toggleItem = (itemId: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleSection = (categoryId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.header}>Grocery List</Text>

      {/* Week Toggle */}
      <View style={styles.weekToggle}>
        <TouchableOpacity
          style={[styles.weekBtn, selectedWeek === 'this' && styles.weekBtnActive]}
          onPress={() => setSelectedWeek('this')}
        >
          <Text style={[styles.weekBtnText, selectedWeek === 'this' && styles.weekBtnTextActive]}>
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.weekBtn, selectedWeek === 'next' && styles.weekBtnActive]}
          onPress={() => setSelectedWeek('next')}
        >
          <Text style={[styles.weekBtnText, selectedWeek === 'next' && styles.weekBtnTextActive]}>
            Next Week
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <Text style={styles.summary}>{totalItems} items &middot; Est. $85</Text>

      {/* Categories */}
      {categories.map((category) => {
        const isCollapsed = collapsedSections.has(category.id);
        return (
          <View key={category.id} style={styles.categoryContainer}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleSection(category.id)}
            >
              <Text style={styles.categoryLabel}>
                {category.icon} {category.label}
              </Text>
              <Text style={styles.collapseIcon}>{isCollapsed ? '+' : '−'}</Text>
            </TouchableOpacity>

            {!isCollapsed &&
              category.items.map((item) => {
                const isChecked = checkedItems.has(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemRow}
                    onPress={() => toggleItem(item.id)}
                  >
                    {/* Checkbox */}
                    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                      {isChecked && <CheckIcon color="#FFFFFF" size={14} strokeWidth={3} />}
                    </View>
                    {/* Item Text */}
                    <Text
                      style={[styles.itemName, isChecked && styles.itemChecked]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.itemQuantity, isChecked && styles.itemChecked]}
                    >
                      {item.quantity}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        );
      })}

      {/* Generated Note */}
      <Text style={styles.generatedNote}>Generated from your meal plan</Text>

      {/* Share Button */}
      <TouchableOpacity style={styles.shareBtn}>
        <Text style={styles.shareBtnText}>Share List</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },

  // Week Toggle
  weekToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 16,
  },
  weekBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  weekBtnActive: {
    backgroundColor: colors.brand,
  },
  weekBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  weekBtnTextActive: {
    color: colors.textPrimary,
  },

  // Summary
  summary: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
  },

  // Category
  categoryContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  collapseIcon: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemQuantity: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemChecked: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },

  // Generated Note
  generatedNote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    fontStyle: 'italic',
  },

  // Share Button
  shareBtn: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareBtnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
