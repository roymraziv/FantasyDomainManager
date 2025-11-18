# Income/Upkeep Validation Implementation

## Summary
Implemented comprehensive validation and display logic for income and upkeep fields across all Domain and Enterprise forms and displays.

## Key Requirements Implemented

### 1. Mutual Exclusivity Validation
- Income flat value and income range (min/max) are mutually exclusive
- Upkeep flat value and upkeep range (min/max) are mutually exclusive
- Fields are disabled based on what's filled
- Error message: "Cannot specify both a flat value and a range for income/upkeep cost"

### 2. Range Validation
- Minimum must be strictly less than maximum (not equal or greater)
- Error messages:
  - "Income minimum must be less than income maximum"
  - "Upkeep cost minimum must be less than upkeep cost maximum"

### 3. Display Logic
- **Flat value**: Displays as formatted number (e.g., "1,000")
- **Range**: Displays as "min-max" (e.g., "100-1,000")
- **Empty**: Displays as "-"

## Files Modified

### Domain Forms
1. **`/client/app/page.tsx`** - Domain creation modal
   - Added validation for income/upkeep mutual exclusivity
   - Added validation for min < max
   - Added disabled attributes on form fields
   - Updated labels to indicate "(flat value)" and "(or range)"

2. **`/client/app/domains/[id]/page.tsx`** - Domain edit modal
   - Same validation as creation modal
   - Updated display logic to show flat OR range format

### Enterprise Forms
3. **`/client/components/EnterpriseSection.tsx`** - Enterprise create/edit modals
   - Added validation to both `handleCreate` and `handleUpdate` functions
   - Added disabled attributes on all income/upkeep form fields
   - Updated labels to match Domain forms

### Display Components
4. **`/client/components/EnterpriseCard.tsx`** - Enterprise card display
   - Updated income display: `income?.toLocaleString() OR min-max OR "-"`
   - Updated upkeep display: `upkeep?.toLocaleString() OR min-max OR "-"`

## Validation Logic Pattern

```typescript
// Mutual exclusivity check
if (formData.income !== null && (formData.incomeLowerLimit !== null || formData.incomeUpperLimit !== null)) {
  setError('Cannot specify both a flat value and a range for income');
  return;
}

// Range validation check
if (formData.incomeLowerLimit !== null && formData.incomeUpperLimit !== null) {
  if (formData.incomeLowerLimit >= formData.incomeUpperLimit) {
    setError('Income minimum must be less than income maximum');
    return;
  }
}
```

## Form Field Disabled State Pattern

```typescript
<input
  type="number"
  value={formData.income || ''}
  onChange={(e) => setFormData({ ...formData, income: e.target.value ? parseInt(e.target.value) : null })}
  disabled={formData.incomeLowerLimit !== null || formData.incomeUpperLimit !== null}
  className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-2 focus:border-amber-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
/>
```

## Display Logic Pattern

```typescript
{enterprise.income !== null
  ? enterprise.income.toLocaleString()
  : enterprise.incomeLowerLimit !== null && enterprise.incomeUpperLimit !== null
  ? `${enterprise.incomeLowerLimit.toLocaleString()}-${enterprise.incomeUpperLimit.toLocaleString()}`
  : '-'}
```

## Testing Checklist

When backend is available, test the following scenarios:

### Domain Creation
- [ ] Create domain with flat income value → should save and display as number
- [ ] Create domain with income range → should save and display as "min-max"
- [ ] Try to fill both flat income and range → fields should be disabled, error on submit
- [ ] Try to set min >= max → should show error
- [ ] Repeat all above for upkeep cost

### Domain Editing
- [ ] Edit domain to change from flat to range → should work
- [ ] Edit domain to change from range to flat → should work
- [ ] Try to fill both → should be prevented by disabled fields
- [ ] Verify min < max validation

### Enterprise Creation (via Domain detail page)
- [ ] Create enterprise with flat income → should save and display correctly
- [ ] Create enterprise with income range → should save and display correctly
- [ ] Test mutual exclusivity
- [ ] Test min < max validation
- [ ] Repeat for upkeep

### Enterprise Editing (via Domain detail page)
- [ ] Edit enterprise income from flat to range
- [ ] Edit enterprise income from range to flat
- [ ] Verify validation works

### Display Verification
- [ ] Domain detail page shows correct format for income/upkeep
- [ ] Enterprise cards show correct format for income/upkeep
- [ ] Numbers are formatted with commas (toLocaleString)
- [ ] Empty values show as "-"

## Error Messages Summary

All error messages are displayed in a red-bordered alert box at the top of the modal:

1. "Cannot specify both a flat value and a range for income"
2. "Cannot specify both a flat value and a range for upkeep cost"
3. "Income minimum must be less than income maximum"
4. "Upkeep cost minimum must be less than upkeep cost maximum"

## UI/UX Improvements

- Fields are visually disabled (opacity-50) when they can't be used
- Cursor changes to not-allowed on disabled fields
- Labels clearly indicate "(flat value)" vs "(or range)"
- Validation happens on form submit with clear error messages
- Display format is consistent across all components
