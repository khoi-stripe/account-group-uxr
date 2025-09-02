# 🧪 Static File Approach - Testing Checklist

## ✅ Test Results Log
*Check off each item as you test*

### Phase 1: Basic Functionality
- [ ] **Local server running** (http://localhost:8000)
- [ ] **Test page loads** (static-file-test.html)
- [ ] **Static data loader script** loads without errors
- [ ] **Console shows** "Static data ready" message

### Phase 2: Predefined Scenarios
- [ ] **Enterprise scenario** loads correct data (8 accounts)
- [ ] **Startup scenario** loads correct data (5 accounts)  
- [ ] **Agency scenario** loads correct data (6 accounts)
- [ ] **Network tab shows** only static file requests (no API calls)
- [ ] **Scenario buttons** copy URLs to clipboard automatically

### Phase 3: Researcher vs Participant Mode
- [ ] **Researcher mode** (no URL params) shows prototype control panel
- [ ] **Participant mode** (?mode=participant) hides prototype control panel
- [ ] **URL parameters** detected correctly in test page
- [ ] **Mode indicator** appears briefly in participant mode

### Phase 4: Control Panel Integration
- [ ] **Quick scenario buttons** work in Share tab
- [ ] **Custom organization sharing** generates participant files
- [ ] **Organization selector** populates with current data
- [ ] **Share URLs** are correctly formatted

### Phase 5: Data Integration
- [ ] **Account switcher** shows correct organization name
- [ ] **Account groups filter** shows correct accounts
- [ ] **Existing prototype features** work normally
- [ ] **No JavaScript errors** in console

### Phase 6: Chrome Security
- [ ] **No security warnings** when accessing via HTTP
- [ ] **Local server** serves files without issues
- [ ] **Network requests** are all to same domain
- [ ] **No external CDN** requests (Chart.js is local)

### Phase 7: File Upload Workflow (Manual Test)
1. [ ] Open master mode, configure custom organization
2. [ ] Go to Share tab, select organization
3. [ ] Generate participant file (downloads JSON)
4. [ ] Upload JSON to `data/participants/` directory
5. [ ] Test participant URL with custom data

## 🚨 Common Issues & Solutions

**Issue: Static files not loading**
- Solution: Make sure you're using http://localhost:8000 (not file://)

**Issue: "Failed to load scenario" error**
- Solution: Check that JSON files exist in data/scenarios/

**Issue: Prototype controls still showing in participant mode**
- Solution: Verify URL has ?mode=participant parameter

**Issue: Organization data not updating**
- Solution: Check browser console for staticDataReady event

## 📊 Performance Testing

**Network Tab Checklist:**
- [ ] Only GET requests to static files
- [ ] No POST requests to APIs
- [ ] No external domain requests
- [ ] Fast loading times (&lt;100ms per file)

## 🎯 Success Criteria

**✅ All tests pass when:**
1. Scenarios load different data correctly
2. Researcher/participant modes behave differently  
3. No Chrome security warnings
4. All existing features work
5. Network tab shows only static file requests
6. Control panel generates valid URLs

---

**Date Tested:** ___________  
**Tested By:** ___________  
**Overall Result:** [ ] PASS [ ] FAIL  
**Notes:**
