/**
 * Maps Plaid's personal_finance_category.primary to the local application categories:
 * ['salary', 'food', 'utilities', 'transportation', 'entertainment', 'healthcare', 'shopping', 'other']
 */
export function mapPlaidCategory(plaidCategory) {
  if (!plaidCategory) return 'other';
  const cat = plaidCategory.toLowerCase();

  if (cat.includes('income') || cat.includes('salary') || cat.includes('transfer_in')) {
    return 'salary';
  }
  if (cat.includes('food') || cat.includes('drink') || cat.includes('restaurant') || cat.includes('grocery')) {
    return 'food';
  }
  if (cat.includes('utilities') || cat.includes('rent') || cat.includes('bill') || cat.includes('rent_and_utilities')) {
    return 'utilities';
  }
  if (cat.includes('transport') || cat.includes('gas') || cat.includes('taxi') || cat.includes('automotive') || cat.includes('transportation')) {
    return 'transportation';
  }
  if (cat.includes('entertainment') || cat.includes('recreation') || cat.includes('travel') || cat.includes('leisure')) {
    return 'entertainment';
  }
  if (cat.includes('medical') || cat.includes('healthcare') || cat.includes('pharmacy')) {
    return 'healthcare';
  }
  if (cat.includes('merchandise') || cat.includes('shopping') || cat.includes('apparel') || cat.includes('electronics')) {
    return 'shopping';
  }
  return 'other';
}
