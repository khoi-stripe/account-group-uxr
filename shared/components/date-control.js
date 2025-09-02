/**
 * Date Control Component
 * A reusable component that provides period selection and date range display
 */

class DateControl {
  constructor(options = {}) {
    this.options = {
      containerId: 'dateControl',
      periodTriggerId: 'periodTrigger',
      periodPopoverId: 'periodPopover',
      dateRangeDisplayId: 'dateRangeDisplay',
      dateRangePickerId: 'dateRangePicker',
      defaultPeriod: 'last-month',
      onPeriodChange: null,
      onDateRangeChange: null,
      ...options
    };
    
    this.currentPeriod = this.options.defaultPeriod;
    this.customDateRange = null;
    
    this.periods = {
      'last-week': {
        label: 'Last week',
        getDates: () => this.getLastWeek()
      },
      'last-month': {
        label: 'Last month',
        getDates: () => this.getLastMonth()
      },
      'last-quarter': {
        label: 'Last quarter',
        getDates: () => this.getLastQuarter()
      },
      'last-year': {
        label: 'Last year',
        getDates: () => this.getLastYear()
      },
      'custom': {
        label: 'Custom range',
        getDates: () => this.customDateRange || this.getLastMonth()
      }
    };
    
    this.init();
  }
  
  init() {
    this.attachEventListeners();
    this.updateDisplay();
  }
  
  attachEventListeners() {
    const periodTrigger = document.getElementById(this.options.periodTriggerId);
    const dateRangeDisplay = document.getElementById(this.options.dateRangeDisplayId);
    const periodPopover = document.getElementById(this.options.periodPopoverId);
    
    if (periodTrigger) {
      periodTrigger.addEventListener('click', () => this.togglePeriodPopover());
    }
    
    if (dateRangeDisplay) {
      dateRangeDisplay.addEventListener('click', () => this.toggleDateRangePicker());
    }
    
    // Close popovers when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest(`#${this.options.containerId}`)) {
        this.closePeriodPopover();
        this.closeDateRangePicker();
      }
    });
    
    // Attach period option listeners
    if (periodPopover) {
      periodPopover.addEventListener('click', (e) => {
        if (e.target.classList.contains('period-option')) {
          const period = e.target.dataset.period;
          this.selectPeriod(period);
        }
      });
    }
  }
  
  togglePeriodPopover() {
    const trigger = document.getElementById(this.options.periodTriggerId);
    const popover = document.getElementById(this.options.periodPopoverId);
    
    if (!trigger || !popover) return;
    
    const isOpen = popover.classList.contains('open');
    
    if (isOpen) {
      this.closePeriodPopover();
    } else {
      this.closeDateRangePicker(); // Close other popover
      popover.classList.add('open');
      trigger.classList.add('open');
    }
  }
  
  closePeriodPopover() {
    const trigger = document.getElementById(this.options.periodTriggerId);
    const popover = document.getElementById(this.options.periodPopoverId);
    
    if (trigger) trigger.classList.remove('open');
    if (popover) popover.classList.remove('open');
  }
  
  toggleDateRangePicker() {
    const display = document.getElementById(this.options.dateRangeDisplayId);
    const picker = document.getElementById(this.options.dateRangePickerId);
    
    if (!display || !picker) return;
    
    const isOpen = picker.classList.contains('open');
    
    if (isOpen) {
      this.closeDateRangePicker();
    } else {
      this.closePeriodPopover(); // Close other popover
      picker.classList.add('open');
    }
  }
  
  closeDateRangePicker() {
    const picker = document.getElementById(this.options.dateRangePickerId);
    if (picker) picker.classList.remove('open');
  }
  
  selectPeriod(period) {
    this.currentPeriod = period;
    this.updateDisplay();
    this.closePeriodPopover();
    
    if (this.options.onPeriodChange) {
      const dates = this.getCurrentDateRange();
      this.options.onPeriodChange(period, dates);
    }
  }
  
  updateDisplay() {
    const periodTrigger = document.getElementById(this.options.periodTriggerId);
    const dateRangeDisplay = document.getElementById(this.options.dateRangeDisplayId);
    const periodOptions = document.querySelectorAll('.period-option');
    
    // Update period trigger text
    if (periodTrigger) {
      const periodData = this.periods[this.currentPeriod];
      if (periodData) {
        periodTrigger.querySelector('.period-text').textContent = periodData.label;
      }
    }
    
    // Update active period option
    periodOptions.forEach(option => {
      option.classList.toggle('active', option.dataset.period === this.currentPeriod);
    });
    
    // Update date range display
    if (dateRangeDisplay) {
      const dates = this.getCurrentDateRange();
      const formattedRange = this.formatDateRange(dates);
      dateRangeDisplay.querySelector('.date-range-text').textContent = formattedRange;
    }
  }
  
  getCurrentDateRange() {
    const periodData = this.periods[this.currentPeriod];
    return periodData ? periodData.getDates() : this.getLastMonth();
  }
  
  formatDateRange(dates) {
    const options = { month: 'short', day: 'numeric' };
    const startFormatted = dates.start.toLocaleDateString('en-US', options);
    const endFormatted = dates.end.toLocaleDateString('en-US', options);
    return `${startFormatted}–${endFormatted}`;
  }
  
  // Date calculation methods
  getLastWeek() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return { start, end };
  }
  
  getLastMonth() {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 1);
    return { start, end };
  }
  
  getLastQuarter() {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 3);
    return { start, end };
  }
  
  getLastYear() {
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 1);
    return { start, end };
  }
  
  // Public API
  setPeriod(period) {
    if (this.periods[period]) {
      this.selectPeriod(period);
    }
  }
  
  setCustomRange(startDate, endDate) {
    this.customDateRange = {
      start: new Date(startDate),
      end: new Date(endDate)
    };
    this.selectPeriod('custom');
  }
  
  getDateRange() {
    return this.getCurrentDateRange();
  }
} 