# Component Organization Structure

This document outlines the new organizational structure for the dashboard components after the refactoring.

## Folder Structure

```
src/app/dashboard/components/
├── sales/
│   ├── SalesModal.tsx
│   ├── EditSalesModal.tsx
│   ├── SalesSection.tsx
│   ├── SalesTable.tsx
│   └── index.ts
├── stock/
│   ├── StockModal.tsx
│   ├── StockSection.tsx
│   ├── StockTable.tsx
│   └── index.ts
└── shared/
    ├── AddProductModal.tsx
    ├── EditProductModal.tsx
    └── index.ts
```

## Component Organization

### Sales Components (`sales/`)
- **SalesModal.tsx**: Multi-step modal for creating new sales
- **EditSalesModal.tsx**: Modal for editing existing sales
- **SalesSection.tsx**: Main section component managing sales display
- **SalesTable.tsx**: Table component displaying sales history with search and filtering

### Stock Components (`stock/`)
- **StockModal.tsx**: Multi-step modal for stock management (add/remove stock)
- **StockSection.tsx**: Main section component managing stock/basket display
- **StockTable.tsx**: Table component displaying products in baskets with inventory management

### Shared Components (`shared/`)
- **AddProductModal.tsx**: Modal for adding new products to baskets
- **EditProductModal.tsx**: Modal for editing existing product details

## Features Maintained

All components maintain their existing functionality:

### Mobile/Tablet Compatibility
- ✅ Keyboard height detection and avoidance
- ✅ Modal positioning optimized for mobile/iPad
- ✅ Scrollable modals with body scroll lock
- ✅ Responsive design for all screen sizes

### Modal Features
- ✅ Quick set buttons (10, 20, 30) for quantity inputs
- ✅ Step-by-step workflows for complex operations
- ✅ Proper keyboard avoidance on mobile devices
- ✅ Touch-friendly controls and buttons

### Table Features
- ✅ Summary columns (Total Qty, Total Price) in sales table
- ✅ Responsive column hiding on smaller screens
- ✅ Enhanced Products column width for better mobile display
- ✅ Search and filtering capabilities
- ✅ Pagination support

## Import Usage

### Using Index Files (Recommended)
```tsx
// Clean imports using index files
import { SalesSection } from './components/sales';
import { StockSection } from './components/stock';
import { AddProductModal, EditProductModal } from './components/shared';
```

### Direct Imports
```tsx
// Direct imports when needed
import SalesModal from './components/sales/SalesModal';
import StockModal from './components/stock/StockModal';
```

## Benefits of This Structure

1. **Better Organization**: Related components are grouped together
2. **Easier Maintenance**: Changes to specific features are isolated to their respective folders
3. **Cleaner Imports**: Index files provide clean import statements
4. **Scalability**: Easy to add new components to appropriate sections
5. **Team Collaboration**: Clear separation of concerns for different developers

## Migration Notes

- All import paths have been updated in the main dashboard page
- Old component files have been removed to prevent confusion
- No functional changes were made - only reorganization
- All existing features and mobile optimizations are preserved

This restructuring makes the codebase more maintainable and easier to navigate while preserving all existing functionality.
