class iwDay {
  constructor(date = null, lang = 'default') {
    this.lang = lang;
    this.dt = date ?? new Date();
    this.date = this.dt.getDate();
    this.day = this.dt.toLocaleString(lang, { weekday: 'long'});
    this.dayNumber = this.dt.getDay() + 1;
    this.dayShort = this.dt.toLocaleString(lang, { weekday: 'short'});
    this.year = this.dt.getFullYear();
    this.yearShort = this.dt.toLocaleString(lang, { year: '2-digit'});
    this.month = this.dt.toLocaleString(lang, { month: 'long'});
    this.monthShort = this.dt.toLocaleString(lang, { month: 'short'});
    this.monthNumber = this.dt.getMonth() + 1;
    this.timestamp = this.dt.getTime();
    this.weekNumber = this.getWeekNumber(this.dt);
  }

  /**
   * Get week number
   * @param {*} date 
   * @returns 
   */
  getWeekNumber(date) {
    const firstDayOfTheYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfTheYear.getTime()) / 86400000;
    
    return Math.ceil((pastDaysOfYear + firstDayOfTheYear.getDay() + 1) / 7)
  }
  
  
  get isToday() {
    return this.isEqualTo(new Date());
  }
  
  
  isEqualTo(date) {
    date = date instanceof iwDay ? date.dt : date;
    
    return date.getDate() === this.date &&
      date.getMonth() === this.monthNumber - 1 &&
      date.getFullYear() === this.year;
  }
  
  /**
   * Format date
   * @param {*} formatStr 
   * @returns 
   */
  format(formatStr) {
    return formatStr
      .replace(/\bYYYY\b/, this.year)
      .replace(/\bYYY\b/, this.yearShort)
      .replace(/\bWW\b/, this.weekNumber.toString().padStart(2, '0'))
      .replace(/\bDDDD\b/, this.day)
      .replace(/\bDDD\b/, this.dayShort)
      .replace(/\bDD\b/, this.date.toString().padStart(2, '0'))
      .replace(/\bMMMM\b/, this.month)
      .replace(/\bMMM\b/, this.monthShort)
      .replace(/\bMM\b/, this.monthNumber.toString().padStart(2, '0'))
  }
}

class iwMonth {
  constructor(date = null, lang = 'default') {
    const dt = new iwDay(date, lang);

    this.lang = lang;   
    this.name = dt.month;
    this.number = dt.monthNumber;
    this.year = dt.year;
    this.numberOfDays = new Date(this.year, this.number, 0).getDate();
    
    this[Symbol.iterator] = function* () {
      for(let i = 0; i < this.numberOfDays; ++i) {
        yield this.getDay(i + 1);
      }
    }
  }

  /**
   * Check if year is leap year
   * @param {*} year 
   * @returns 
   */
  isLeapYear(year) {
    return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
  }
  
  /**
   * Get day of the month
   * @param {*} date 
   * @returns 
   */
  getDay(date) {
    return new iwDay(new Date(this.year, this.number - 1, date), this.lang);
  }
}

class iwCalendar {
  weekDays = Array.from({length: 7});
  
  constructor(year = null, monthNumber = null, lang = 'default') {
    this.today = new iwDay(null, lang);
    this.year = year ?? this.today.year;
    this.month = new iwMonth(new Date(this.year, (monthNumber || this.today.monthNumber) - 1), lang);
    this.lang = lang;
    
    this[Symbol.iterator] = function* () {
      for(let i = 0; i < 12; ++i) {
        yield this.getMonth(i + 1);
      }
    }
    
    this.weekDays.forEach((_, i) => {
      const day = this.month.getDay(i + 1);
      if(!this.weekDays.includes(day.day)) {
        this.weekDays[day.dayNumber - 1] = day.day
      }
    })
  }
  
  get isLeapYear() {
    return this.month.isLeapYear(this.year);
  }
  
  getMonth(monthNumber) {
    return new iwMonth(new Date(this.year, monthNumber - 1), this.lang);
  }
  
  getPreviousMonth() {
    if(this.month.number === 1) {
      return new iwMonth(new Date(this.year - 1, 11), this.lang);
    }
    
    return new iwMonth(new Date(this.year, this.month.number - 2), this.lang);
  }
  
  getNextMonth() {
    if(this.month.number === 12) {
      return new iwMonth(new Date(this.year + 1, 0), this.lang);
    }
    
    return new iwMonth(new Date(this.year, this.month.number + 2), this.lang);
  }
  
  goToDate(monthNumber, year) {
    this.month = new Month(new Date(year, monthNumber - 1), this.lang);
    this.year = year;
  }
  
  goToNextYear() {
    this.year += 1;
    this.month = new iwMonth(new Date(this.year, 0), this.lang);
  }
  
  goToPreviousYear() {
    this.year -= 1;
    this.month = new iwMonth(new Date(this.year, 11), this.lang);
  }
  
  goToNextMonth() {
    if(this.month.number === 12) {
      return this.goToNextYear();
    }
    
    this.month = new iwMonth(new Date(this.year, (this.month.number + 1) - 1), this.lang);
  }
  
  goToPreviousMonth() {
    if(this.month.number === 1) {
      return this.goToPreviousYear();
    }
    
    this.month = new iwMonth(new Date(this.year, (this.month.number - 1) - 1), this.lang);
  }
}

class iwDatePicker extends HTMLElement {
  format = 'MMM DD, YYYY';
  position = 'bottom';
  visible = false;
  date = null;
  mounted = false;
  toggleButton = null;
  calendarDropDown = null;
  calendarDateElement = null;
  calendarDaysContainer = null;
  selectedDayElement = null;
  
  constructor() {
    super();
    
    const lang = window.navigator.language;
    const date = new Date(this.date ?? (this.getAttribute("date") || Date.now()));
    
    this.shadow = this.attachShadow({mode: "open"});
    this.date = new iwDay(date, lang);
    this.calendar = new iwCalendar(this.date.year, this.date.monthNumber, lang);
    
    this.format = this.getAttribute('format') || this.format;
    this.position = this.position.includes(this.getAttribute('position'))
      ? this.getAttribute('position')
      : this.position;
    this.visible = this.getAttribute('visible') === '' 
      || this.getAttribute('visible') === 'true'
      || this.visible;
    
    this.render();
  }
  
  connectedCallback() {
    this.mounted = true;
    
    this.toggleButton = this.shadow.querySelector('.datePicker__toggle');
    this.calendarDropDown = this.shadow.querySelector('.datePicker');
    const [prevBtn, calendarDateElement, nextButton] = this.calendarDropDown
      .querySelector('.datePicker__header').children;
    this.calendarDateElement = calendarDateElement;
    this.calendarDaysContainer = this.calendarDropDown.querySelector('.days');
    
    this.toggleButton.addEventListener('click', () => this.toggleCalendar());
    this.todayBtn = this.shadow.querySelector('.datePicker__today');
    this.todayBtn.addEventListener('click', () => this.updateMonthDays());
    prevBtn.addEventListener('click', () => this.prevMonth());
    nextButton.addEventListener('click', () => this.nextMonth());
    document.addEventListener('click', (e) => this.handleClickOut(e));
    
    this.renderCalendarDays();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if(!this.mounted) return;
    
    switch(name) {
      case "date":
        this.date = new Day(new Date(newValue));
        this.calendar.goToDate(this.date.monthNumber, this.date.year);
        this.renderCalendarDays();
        this.updateToggleText();
        break;
      case "format":
        this.format = newValue;
        this.updateToggleText();
        break;
      case "visible":
        this.visible = ['', 'true', 'false'].includes(newValue) 
          ? newValue === '' || newValue === 'true'
          : this.visible;
        this.toggleCalendar(this.visible);
        break;
      case "position":
        this.position = DatePicker.position.includes(newValue)
          ? newValue
          : this.position;
        this.calendarDropDown.className = 
          `calendar-dropdown ${this.visible ? 'visible' : ''} ${this.position}`;
        break;
    }
  }
  
  toggleCalendar(visible = null) {
    if(visible === null) {
      this.calendarDropDown.classList.toggle('visible');
    } else if(visible) {
      this.calendarDropDown.classList.add('visible');
    } else {
      this.calendarDropDown.classList.remove('visible');
    }
    
    this.visible = this.calendarDropDown.className.includes('visible');
    
    if(this.visible) {
      this.calendarDateElement.focus();
    } else {
      this.toggleButton.focus();
      
      if(!this.isCurrentCalendarMonth()) {
        this.calendar.goToDate(this.date.monthNumber, this.date.year);
        this.renderCalendarDays();
      }
    }
  }
  
  prevMonth() {
    this.calendar.goToPreviousMonth();
    this.renderCalendarDays();
  }
  
  nextMonth() {
    this.calendar.goToNextMonth();
    this.renderCalendarDays();
  }
  
  updateHeaderText() {
    this.calendarDateElement.textContent = 
      `${this.calendar.month.name}, ${this.calendar.year}`;
    const monthYear = `${this.calendar.month.name}, ${this.calendar.year}`
    this.calendarDateElement
      .setAttribute('aria-label', `current month ${monthYear}`);
  }
  
  isSelectedDate(date) {
    return date.date === this.date.date &&
      date.monthNumber === this.date.monthNumber &&
      date.year === this.date.year;
  }
  
  isCurrentCalendarMonth() {
    return this.calendar.month.number === this.date.monthNumber &&
      this.calendar.year === this.date.year;
  }
  
  selectDay(el, day) {
    if(day.isEqualTo(this.date)) return;
    
    this.date = day;
    
    if(day.monthNumber !== this.calendar.month.number) {
      this.prevMonth();
    } else {
      el.classList.add('selected');
      this.selectedDayElement.classList.remove('selected');
      this.selectedDayElement = el;
    }
    
    this.toggleCalendar();
    this.updateToggleText();
  }
  
  handleClickOut(e) {
    if(this.visible && (this !== e.target)) {
      this.toggleCalendar(false);
    }
  }
  
  getWeekDaysElementStrings() {
    return this.calendar.weekDays
      .map(weekDay => `<span>${weekDay.substring(0, 3)}</span>`)
      .join('');
  }
  
  getMonthDaysGrid() {
    const firstDayOfTheMonth = this.calendar.month.getDay(1);
    const prevMonth = this.calendar.getPreviousMonth();
    const totalLastMonthFinalDays = firstDayOfTheMonth.dayNumber - 1;
    const totalDays = this.calendar.month.numberOfDays + totalLastMonthFinalDays;
    const monthList = Array.from({length: totalDays});
    
    for(let i = totalLastMonthFinalDays; i < totalDays; i++) {
      monthList[i] = this.calendar.month.getDay(i + 1 - totalLastMonthFinalDays)
    }
    
    for(let i = 0; i < totalLastMonthFinalDays; i++) {
      const inverted = totalLastMonthFinalDays - (i + 1);
      monthList[i] = prevMonth.getDay(prevMonth.numberOfDays - inverted);
    }
    
    return monthList;
  }
  
  updateToggleText() {
    const date = this.date.format(this.format)
    this.toggleButton.textContent = date;
  }
  
  updateMonthDays() {
    debugger;
    this.calendarDaysContainer.innerHTML = '';
    
    this.getMonthDaysGrid().forEach(day => {
      const el = document.createElement('button');
      el.className = 'day';
      el.textContent = day.date;
      el.addEventListener('click', (e) => this.selectDay(el, day));
      el.setAttribute('aria-label', day.format(this.format));
        
      if(day.monthNumber === this.calendar.month.number) {
        el.classList.add('current');
      }

      if(this.isSelectedDate(day)) {
        el.classList.add('selected');
        this.selectedDayElement = el;
      }
      
      this.calendarDaysContainer.appendChild(el);
    })
  }
  
  renderCalendarDays() {
    this.updateHeaderText();
    this.updateMonthDays();
    this.calendarDateElement.focus();
  }
  
  static get observedAttributes() { 
    return ['date', 'format', 'visible', 'position']; 
  }
    
  static get position() {
    return ['top', 'left', 'bottom', 'right'];
  }
  
  get style() {
    return `
      :host {
        font-family: sans-serif;
        position: relative;
      }
      
      .datePicker__toggle {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background: #eee;     
        border: none;
        border-radius: 6px;        
        color: #333;      
        cursor: pointer;        
        font-weight: bold;
        font-size: 1.1rem;
        padding: .75rem 1.5rem;
        text-transform: capitalize;
      }
      
      .datePicker {
        background: #fff;    
        border-radius: 5px;
        box-shadow: 0 0 8px rgba(0,0,0,0.2);     
        display: none;
        left: 50%;
        padding: 20px;
        position: absolute;
        transform: translate(-50%, 8px);
        width: 300px;
      }
      
      .datePicker.top {
        bottom: 100%;
        top: auto;
        transform: translate(-50%, -8px);
      }
      
      .datePicker.left {
        left: 0;
        top: 50%;
        transform: translate(calc(-8px + -100%), -50%);
      }
      
      .datePicker.right {
        left: 100%;
        top: 50%;
        transform: translate(8px, -50%);
      }
      
      .datePicker.visible {
        display: block;
      }
      
      .datePicker__header {
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin: .75rem 0;
      }
      
      .datePicker__title {
        font-size: 21px;
        font-weight: bold;
        margin: 0;
        text-transform: capitalize;
      }
      
      .datePicker__header button {
        background: none;
        border: 8px solid transparent;
        border-top-color: #222;
        border-radius: 2px;
        cursor: pointer;
        height: 0;
        padding: 0;
        position: relative;
        transform: rotate(90deg);
        width: 0;
      }
      
      .datePicker__header button::after {
        content: '';
        display: block;
        height: 25px;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 25px;
      }
      
      .datePicker__header button:last-of-type {
        transform: rotate(-90deg);
      }

      .datePicker__actions {
        display: flex;
        justify-content: flex-end;
        margin-bottom: .75rem;
      }

      .datePicker__today {
        background-color: #006fff;
        border: none;
        border-radius: 4px;
        color: #fff;
        padding: .5rem .75rem;
      }
      
      .weekDays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-gap: 5px;
        margin-bottom: 10px;
      }
      
      .weekDays span {
        align-items: center;
        display: flex;
        font-size: 12px;
        font-weight: bold;
        justify-content: center;
        text-transform: capitalize;
      }
      
      .days {
        align-items: center;
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-gap: 5px;
        justify-content: center;
      }
      
      .day {
        align-items: center;
        background-color: transparent;
        border: none;
        border-radius: 2px;
        color: #3a3e3f;
        cursor: pointer;
        display: flex;
        height: 32px;
        justify-content: center;
        justify-self: center;
        opacity: 0.3;
        width: 32px;
      }

      .day.current {
        font-weight: bold;
        opacity: 1;
      }
      
      .day.selected {
        background: #006fff;
        border-radius: 4px;
        color: #ffffff;
      }
      
      .day:hover {
        background: #dfedff;
      }
    `;
  }
  
  render() {
    const monthYear = `${this.calendar.month.name}, ${this.calendar.year}`;
    const date = this.date.format(this.format)
    this.shadow.innerHTML = `
      <style>${this.style}</style>
      <button type="button" class="datePicker__toggle">${date}</button>
      <div class="datePicker ${this.visible ? 'visible' : ''} ${this.position}">
        <div class="datePicker__header">
            <button type="button" class="prev-month" aria-label="previous month"></button>
            <h4 class="datePicker__title" tabindex="0" aria-label="current month ${monthYear}">
              ${monthYear}
            </h4>
            <button type="button" class="prev-month" aria-label="next month"></button>
        </div>
        <div class="datePicker__actions">
          <button class="datePicker__today">Today</button>
        </div>  
        <div class="weekDays">${this.getWeekDaysElementStrings()}</div>
        <div class="days"></div>
      </div>
    `
  }
}

customElements.define("iw-datepicker", iwDatePicker);