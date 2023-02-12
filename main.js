class IwDatePicker extends HTMLElement {

    weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    constructor() {
        
        super();
        
        this.shadow = this.attachShadow({ mode: 'open' });
        this.dt = new Date();
        this.dtString = this.dt.toLocaleString(navigator.language, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
        this.date = this.dt.getDate();
        this.month = this.dt.toLocaleString('default', { month: 'long' });
        this.year = this.dt.getFullYear();
        this.prevMonthDays = this.dateString(this.firstDayOfMonth()).split(', ')[0];

        this.render();
    }

    /**
     * Get date string
     * @param {*} date 
     * @returns 
     */
    dateString(date) {
        return date.toLocaleString(navigator.language, { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' });
    }

    /**
     * Get first day of month
     * @returns 
     */
    firstDayOfMonth() {
        return new Date(this.year, this.dt.getMonth(), 1).getDay();
    }

    /**
     * Get total days in month
     * @returns 
     */
    daysInMonth() {
        return new Date(this.year, this.dt.getMonth() + 1, 0).getDate();
    }

    /**
     * Output week days
     */
    get outputWeekDays() {
        return this.weekDays.map(day => `<span class="iwDatePicker-weekDay">${day}</span>`).join('');
    }

    /**
     * Output calendar days
     */
    get outputCalendarDays() {

        const days = document.createElement('div');

        for(let i = 1; i <= +this.prevMonthDays + this.daysInMonth(); i++) {

            const day = document.createElement('span');
            day.className = 'iwDatePicker-day';

            if(i > this.prevMonthDays) {
                day.textContent = i - this.prevMonthDays;
                days.appendChild(day);

                if(i - +this.prevMonthDays === this.date) {
                    day.classList.add('active');
                }
            } else {
                day.classList.add('iwDatePicker-day--prevMonth');
                day.textContent = '';
                days.appendChild(day);
            }
        }

        return days.innerHTML;
    }

    /**
     * Web component CSS styles
     * @returns 
     */
    get style() {
        return `

            @font-face {
                font-display: block;
                font-family: 'FontAwesome6';
                font-style: normal;
                font-weight: 400;
                font-display: block;
                src: url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/webfonts/fa-regular-400.woff2) format('woff2'), 
                    url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/webfonts/fa-regular-400.woff) format('woff'), 
                    url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/webfonts/fa-regular-400.ttf) format('truetype'), 
                    url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/webfonts/fa-regular-400.svg#fontawesome) format('svg');
            }

            :host {
                display: block;
                font-size: 14px;
            }

            .iwDatePicker {
                background-color: #fff;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 20px 30px rgba(0, 0, 0, 0.2);
                width: 260px;
                padding: 1rem;
            }    
            
            .iwDatePicker-btn {
                background-color: #428cca;
                border: 1px solid #428cca;
                border-radius: 5px;
                color: #fff;
                padding: .375rem .75rem;
            }

            .iwDatePicker-nav,
            .iwDatePicker-actions {
                display: flex;
            }

            .iwDatePicker-next,
            .iwDatePicker-prev {
                background-color: transparent;
                border: none;
                display: block;
                font-size: 1rem;
                height: 1.5rem;
                position: relative;
                width: 1.5rem;
            }

            .iwDatePicker-next::before,
            .iwDatePicker-prev::before {
                display: block;
                left: 50%;
                position: absolute;
                top: 50%;
                transform: translate(-50%, -50%);
            }

            .iwDatePicker-monthYear {
                flex: 1;
                font-size: 1rem;
                text-align: center;
            }

            .iwDatePicker-actions {
                margin: 1.5rem 0;
            }

            .iwDatePicker-date {
                border: 1px solid #bababa;
                border-radius: 5px;
                flex: 1;
                margin-right: 1rem;
                padding: .375rem;
            }

            .iwDatePicker-cta {
                padding: .375rem .75rem;
            }

            .iwDatePicker-body {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                justify-items: center;
                align-items: center;
            }

            .iwDatePicker-weekDay {
                font-weight: 700;
                opacity: .75;
            }

            .iwDatePicker-day {
                color: rgba(0, 0, 0, 0.4);
                font-weight: 700;
                height: 34px;
                line-height: 34px;
                text-align: center;
                width: 34px;
            }

            .iwDatePicker-day:not(.active):hover {
                background-color: rgba(65, 140, 202, .15);
                border-radius: 8px;
                cursor: pointer;
            }

            .iwDatePicker-day.active {
                background-color: #428cca;
                border-radius: 8px;
                color: #fff;
            }
        `;
    }

    /**
     * Web component HTML template
     */
    render() {
        this.shadow.innerHTML = `
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css" />
            <style> ${this.style} </style>
            <div class="iwDatePicker">
                <div class="iwDatePicker-header">
                    <div class="iwDatePicker-nav">
                        <i class="fa-solid fa-chevron-left iwDatePicker-prev"></i>
                        <div class="iwDatePicker-monthYear"> ${this.month}, ${this.year} </div>
                        <i class="fa-solid fa-chevron-right iwDatePicker-next"></i>                        
                    </div>
                    <div class="iwDatePicker-actions">
                        <input type="text" class="iwDatePicker-date" />
                        <button class="iwDatePicker-btn iwDatePicker-btn--cta iwDatePicker-cta--today">Today</button>
                    </div>
                </div>
                <div class="iwDatePicker-body">
                    ${this.outputWeekDays}
                    ${this.outputCalendarDays}
                </div>
            </div>
        `;
    }

}

customElements.define('iw-datepicker', IwDatePicker);