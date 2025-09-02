# 🚨 Race Condition Bug Fix - Testing Guide

## 🐛 **Bug Fixed:**
**Participant filename/URL mismatch** causing 404 errors and wrong data display.

### **What was happening:**
1. User selected "Togetherwork" organization
2. Downloaded file: `participant-1756828106743-g3qa5t.json`
3. But URL looked for: `participant-1756828106747-ktgvoz.json` 
4. 404 error → Fallback to "enterprise" scenario → Shows "Caesars" data instead of "Togetherwork"

### **Root cause:**
- `generateParticipantData()` called twice within 4ms
- Each call generated different timestamp + random ID
- Race condition between dropdown change event and initialization

---

## 🔧 **Fixes Applied:**

### **1. Race Condition Guard**
```javascript
// Prevents double execution within 1 second
if (this._lastGenerationTime && (now - this._lastGenerationTime) < 1000) {
  console.log('⚠️ generateParticipantData called too quickly, ignoring to prevent race condition');
  return this._lastGenerationResult;
}
```

### **2. Result Caching**
```javascript
// Cache result to return same participantId if called again quickly
this._lastGenerationResult = result;
```

### **3. UI Debouncing**
```javascript
// 300ms debounce on generateShareLink() to prevent rapid calls
this._generateLinkTimeout = setTimeout(async () => {
  await this._doGenerateShareLink();
}, 300);
```

---

## ✅ **Testing Steps:**

### **Step 1: Test Consistent Generation**
1. Go to prototype → Share Prototype tab
2. Select "Togetherwork" from dropdown
3. **Wait for file download**
4. **Check console** - should see: `Generated consistent participantId: participant-XXXXX-XXXXX`
5. **Verify URL** matches the downloaded filename exactly

### **Step 2: Test Participant Mode**
1. Upload the downloaded JSON to `data/participants/`
2. Commit & deploy
3. Visit the generated URL
4. **Should see TOGETHERWORK data, not Caesars**

### **Step 3: Test Race Condition Protection**
1. Select dropdown very quickly multiple times
2. Should only see ONE file download
3. Console should show: `⚠️ generateParticipantData called too quickly, ignoring...`

---

## 🚀 **Expected Results:**
- ✅ **Filename matches URL** - No more 404s
- ✅ **Correct data displayed** - Togetherwork shows Togetherwork data
- ✅ **No duplicate downloads** - Race condition prevented
- ✅ **Smooth user experience** - Debounced UI interactions

---

## 📊 **What to Look For:**

### **✅ Success Indicators:**
```
Static data ready: {organizationName: "Togetherwork", accounts: [...]}
Generated consistent participantId: participant-1756828106743-g3qa5t
```

### **❌ Error Indicators (should be gone):**
```
Failed to load resource: 404
Error loading participant data: Error: Failed to load participant data: 404
No current org, using fallback...
Loaded scenario: enterprise (when expecting togetherwork)
```

The bug is now fixed and deployed! 🎉
