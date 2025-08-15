# Modal Component - Quick Start

The global Modal component provides consistent, feature-rich dialogs across all prototypes.

## ⚡ Quick Setup

### 1. Include the component
```html
<!-- Styles are automatically included via base.css -->
<script src="shared/components/modal.js"></script>
```

### 2. Create a modal
```javascript
const modal = new Modal({
  title: 'My Modal',
  content: '<p>Modal content here</p>',
  footerActions: [
    { text: 'Cancel', type: 'secondary', action: () => modal.hide() },
    { text: 'Save', type: 'primary', action: () => alert('Saved!') }
  ]
});
modal.show();
```

## 🚀 Common Patterns

### Confirmation Dialog
```javascript
const confirmModal = new Modal({
  title: 'Delete Item',
  content: '<p>Are you sure? This cannot be undone.</p>',
  footerActions: [
    { text: 'Cancel', type: 'secondary', action: () => confirmModal.hide() },
    { text: 'Delete', type: 'destructive', action: () => deleteItem() }
  ]
});
```

### Form Modal
```javascript
const formContent = `
  ${Modal.createFormGroup('Name', Modal.createInput({ id: 'name', placeholder: 'Enter name' }))}
  ${Modal.createFormGroup('Email', Modal.createInput({ type: 'email', id: 'email' }))}
`;

const formModal = new Modal({
  title: 'Add User',
  content: formContent,
  footerActions: [
    { text: 'Cancel', type: 'secondary', action: () => formModal.hide() },
    { text: 'Add User', type: 'primary', action: () => submitForm() }
  ]
});
```

### Settings Modal with Collapsible Sections
```javascript
const uploadSection = Modal.createCollapsibleModule(
  'upload', 
  'Upload Settings', 
  '<p>Upload configuration options...</p>',
  false // expanded by default
);

const advancedSection = Modal.createCollapsibleModule(
  'advanced', 
  'Advanced Options', 
  '<p>Advanced settings...</p>',
  true // collapsed by default
);

const settingsModal = new Modal({
  title: 'Settings',
  content: uploadSection + advancedSection
});
```

## 🎨 Button Types

- **`primary`** - Main action (blue)
- **`secondary`** - Secondary action (gray border)
- **`destructive`** - Dangerous action (red)
- **`text`** - Link-style (no background)

## 🔧 Configuration Options

```javascript
new Modal({
  title: 'Modal Title',           // Header title
  content: '<p>Content</p>',      // HTML content
  footerActions: [],              // Array of action buttons
  showHeader: true,               // Show/hide header
  showFooter: true,               // Show/hide footer  
  closable: true,                 // Allow closing (ESC, X button)
  size: 'medium',                 // 'small', 'medium', 'large'
  className: 'custom-modal',      // Additional CSS classes
  onShow: (modal) => {},          // Callback when shown
  onHide: (modal) => {}           // Callback when hidden
})
```

## 🛠️ Methods

```javascript
modal.show()                     // Show modal
modal.hide()                     // Hide modal
modal.destroy()                  // Remove from DOM
modal.setTitle('New Title')      // Update title
modal.setContent('<p>New</p>')   // Update content
modal.setFooterActions([...])    // Update footer buttons
```

## 📝 Form Utilities

```javascript
// Create form group with label
Modal.createFormGroup('Label', inputHTML)

// Create input field
Modal.createInput({
  type: 'text',                  // input type
  id: 'field-id',               // element ID
  placeholder: 'Enter text...',  // placeholder text
  value: 'default',             // default value
  className: 'custom-class'     // additional classes
})

// Create select dropdown
Modal.createSelect({
  id: 'select-id',
  items: ['Option 1', 'Option 2'], // or [{ value: 'val', text: 'Text' }]
  selectedValue: 'default'
})
```

## 📂 Collapsible Modules

```javascript
// Create collapsible section
Modal.createCollapsibleModule(
  'module-id',           // unique ID
  'Module Title',        // header text
  '<p>Content...</p>',   // module content
  false                  // start collapsed? (true/false)
)

// Toggle module programmatically
Modal.toggleModule('module-id')
```

## 💡 Tips

- **Auto-cleanup**: Modals remove themselves from DOM when destroyed
- **Keyboard support**: ESC key closes modal (if `closable: true`)
- **Body scroll**: Automatically prevents body scrolling when modal is open
- **Event bubbling**: Click events on modal content won't close the modal
- **Responsive**: Automatically adjusts for mobile screens

## 🎯 Examples

See `modal-example.html` for live, interactive examples of all features.

---

**Need help?** Check the full documentation in `shared/components/README.md` 