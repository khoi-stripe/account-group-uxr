# Shared Components

This directory contains reusable UI components used across the dashboard prototypes.

## Components

### Navigation Components
- **`navigation.js`** - Main navigation panel with collapsible sections
- **`nav-item.js`** - Individual navigation items with active states  
- **`account-switcher.js`** - Dropdown account/organization selector

### Layout Components
- **`header.js`** - Top header bar component
- **`dashboard-grid.js`** - Grid layout for dashboard modules

### UI Components
- **`popover.js`** - Tooltip and popover functionality

### **Account Groups Filter Component** 🆕
- **`account-groups-filter.js`** - Popover-based filter for account groups and individual accounts
- **`account-groups-filter.css`** - Component styles (included in base.css)
- **`account-groups-filter-example.html`** - Comprehensive usage examples and documentation

### **Modal Component** 🆕
- **`modal.js`** - Reusable modal dialog component with extensive features
- **`modal.css`** - Global modal styles (included in base.css)
- **`modal-example.html`** - Comprehensive usage examples and documentation

### **Wireframe System** 🆕
- **`wireframe-elements.js`** - Progressive fidelity wireframing components
- **`wireframe.css`** - Wireframe-specific styles (included in base.css)
- **`../prototypes/wireframe-templates/`** - Complete wireframe examples and documentation

## Modal Component Usage

The Modal component is a flexible, reusable dialog system with the following features:

### Basic Usage
```javascript
const modal = new Modal({
  title: 'Modal Title',
  content: '<p>Modal content goes here</p>',
  footerActions: [
    { text: 'Cancel', type: 'secondary', action: () => modal.hide() },
    { text: 'Save', type: 'primary', action: () => saveData() }
  ]
});
modal.show();
```

### Key Features
- **🎨 Consistent Styling** - Matches dashboard design system
- **📱 Responsive Design** - Works on all screen sizes
- **⌨️ Keyboard Support** - ESC to close, focus management
- **🔧 Flexible Configuration** - Customizable headers, footers, sizing
- **📝 Form Utilities** - Built-in form element helpers
- **📂 Collapsible Modules** - Organize complex content
- **🎯 Event Callbacks** - onShow/onHide lifecycle hooks
- **♻️ Reusable** - Single instance can be updated dynamically

### Button Types
- `primary` - Brand-colored call-to-action
- `secondary` - Neutral bordered button  
- `destructive` - Red warning/delete actions
- `text` - Text-only link style

### Utility Methods
```javascript
// Form elements
Modal.createFormGroup(label, inputHTML)
Modal.createInput({ type, id, placeholder, value })
Modal.createSelect({ id, items, selectedValue })

// Collapsible sections
Modal.createCollapsibleModule(id, title, content, collapsed)
Modal.toggleModule(moduleId)
```

### Example Files
- **`modal-example.html`** - Live examples of all modal features
- Run locally to see interactive demonstrations

## File Structure
```
shared/
├── components/
│   ├── modal.js              # Modal JavaScript component
│   ├── modal-example.html    # Usage examples & docs
│   ├── navigation.js         # Navigation panel
│   ├── account-switcher.js   # Account selector
│   └── ...
├── styles/
│   ├── modal.css            # Modal styles (auto-included)
│   ├── base.css             # Imports modal.css
│   └── ...
```

## Integration

The modal styles are automatically included via `base.css`. To use:

1. **Include the JavaScript:**
```html
   <script src="shared/components/modal.js"></script>
```

2. **Create and show a modal:**
   ```javascript
   const modal = new Modal({ /* options */ });
   modal.show();
   ```

The modal component is designed to replace custom modal implementations (like the prototype control panel) with a consistent, feature-rich solution.

## Account Groups Filter Component Usage

The Account Groups Filter provides a polished popover interface for selecting account groups and individual accounts. It follows the exact specifications from the design with proper dimensions and spacing.

### Basic Usage
```javascript
const filter = new AccountGroupsFilter(
  document.getElementById('filter-container'),
  {
    placeholder: 'Account Groups',
    onSelectionChange: (selection) => {
      console.log('Selected groups:', selection.selectedGroups);
      console.log('Selected accounts:', selection.selectedAccounts);
    }
  }
);
```

### Key Features
- **🎯 Design Compliant** - Follows exact redline specifications (532×360px popover)
- **🔍 Search Interface** - Built-in search with result count badge
- **📋 Dual Selection** - Choose entire groups or individual accounts within groups  
- **✅ Visual Feedback** - Checkboxes, hover states, and selection indicators
- **🎨 Account Icons** - Color-coded account icons (blue for Deliveries, green for Rides)
- **⌨️ Accessibility** - Keyboard navigation and proper focus management
- **🔧 Programmatic Control** - External API for getting/setting selections

### Options
```javascript
{
  placeholder: 'Account Groups',           // Button text when no selection
  selectedGroups: ['deliveries'],         // Initially selected groups
  selectedAccounts: ['acme-ca'],          // Initially selected accounts  
  onSelectionChange: (selection) => {}    // Callback when selection changes
}
```

### API Methods
```javascript
// Get current selection
const selection = filter.getSelection();

// Set selections programmatically
filter.setSelectedGroups(['deliveries', 'rides']);
filter.setSelectedAccounts(['acme-ca', 'acme-uk']);

// Control popover
filter.open();
filter.close();
```

### Example Files
- **`account-groups-filter-example.html`** - Live examples with various configurations
- Run locally to see interactive demonstrations

## Wireframe System Usage

The wireframe system enables progressive fidelity prototyping:

### Basic Usage
```javascript
import { WireframeElements, FidelityController } from './wireframe-elements.js';

// Initialize fidelity controls
FidelityController.init();

// Create wireframe components
const app = WireframeElements.layout({
  header: WireframeElements.header('My App'),
  sidebar: WireframeElements.sidebar(['Home', 'Profile']),
  main: WireframeElements.card('Main content area')
});
```

### Fidelity Levels
- **Low**: Gray boxes, dashed borders (`Alt+1`)
- **Mid**: Basic styling with design system (`Alt+2`) 
- **High**: Full component integration (`Alt+3`)

### Available Components
- Layout: `layout()`, `header()`, `sidebar()`
- Content: `box()`, `card()`, `text()`
- Forms: `form()`, `input()`, `button()`
- Data: `table()`

**See** `/prototypes/wireframe-templates/` for complete examples and documentation.

## Future Components

Consider adding these components as the prototype system grows:
- Data tables with sorting/filtering
- Toast notifications
- Date/time pickers
- File upload components
- Progress indicators 