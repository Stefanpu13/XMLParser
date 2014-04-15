/// <reference path="rendererFactory.js" />
/// <reference path="jquery-2.1.0.min.js" />
/// <reference path="jquery-2.1.0.min.js" />
function initializeRenderers() {
    var DISPLAY_TYPE_SCALE = "scale", DISPLAY_TYPE_LABEL = "label",
        DISPLAY_TYPE_TEXT = "text", DISPLAY_TYPE_RADIO = "radio_group",
        DISPLAY_VERTICAL_GROUP = "vertical_group", DISPLAY_TYPE_DROPDOWN = "drop_box",
        DISPLAY_TYPE_DATE = "date", DISPLAY_TYPE_DATADROPDOWN = "data_dropdown",
        DISPLAY_TYPE_CASCADEDROPDOWN = "cascade_dropdown", EXTERNAL_REF = '%%ExternalRef%%',
        Q_TEXT = '%%QText%%',
        // Custom attribute to be added to the different answer options.
        // #region custom attributes
        VALUE_ATTRIBUTE = "data-answer-value",
        COLUMNS_COUNT_ATTTRIBUTE = 'data-columns-count'
    // #endregion
    ;

    //#region renderers    
    function textRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc;
        throw new Error("Renderer not implemented.");
    }

    function labelRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc;
        throw new Error("Renderer not implemented.");
    }   
        
    function radioGroupRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc, rows = [], controlValues, controlValue,
        row, cellContent, lines, controlValuesCount, i = 0, radioCellClass = 'radio-cell',
        labelPattrernClass = 'label-cell', columns;

        lines = doc.getElementsByTagName('line');
        if (lines.length) {
            var scales = scaleRenderer(doc);
            // add 'scales' array to rows array.
            rows.push.apply(rows, scales);
        }
        
        controlValues = doc.getElementsByTagName('control_value');
        cellContent = {
            elementType: 'input', wrappingElement: 'label',
            attributes: [{ name: 'type', value: 'radio' }]
        };
        row = createRow(controlValues, cellContent, radioCellClass);
        //Insert cells for %%ExternalRef%% and %%QText%%      
        insertDynamicColumns(doc, row);
        rows.push(row);

        return rows;
    }   

    function dropDownRenderer(XMLDoc) {
        // 'this' - refers to the rendering object created in 
        // 'addRenderer' method in 'rendererFactory'.
        var doc = this.XMLDoc || XMLDoc,
            dropDowns = doc.getElementsByTagName('control_values'),
            dropDownsCount = dropDowns.length, i = 0, j = 0, controls, controlsCount, columns = [],
            selectElement, optionElement, tableRow, tableCell;

        var columnTags = doc.getElementsByTagName('column');

        for (; i < dropDownsCount; i += 1) {
            controls = dropDowns[i].getElementsByTagName('control_value');
            // create 'select element'. 
            selectElement = document.createElement('select');
            controlCount = controls.length;
            for (; j < controlCount; j += 1) {
                // create 'option' element.
                optionElement = createOptionElement(controls[j]);
                selectElement.add(optionElement);
            }
        }

        // create table row. Convert HTMLCollection 'columnTags' to array and concatenate it.
        var collectionToArray = Array.prototype.slice.call(columnTags, 0);
        columns = columns.concat.apply(collectionToArray)
        columns.push(selectElement);
        tableRow = createRow(columns);

        function createOptionElement(columnElement) {
            var optionElement = document.createElement('option');
            optionElement.setAttribute(VALUE_ATTRIBUTE, columnElement.getAttribute('value'));
            optionElement.innerText = columnElement.getAttribute('display');

            return optionElement;
        }

        return tableRow;
    }
    
    function scaleRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc,
        rows = [], row, cell, lines, columns,
        linesCount, columnsCount, i = 0, j = 0,

        lines = doc.getElementsByTagName('line');
        linesCount = lines.length;

        // for each 'line' tag. 'columnsCount' might differ from 'columns_count_attr'.
        for (; i < linesCount; i++) {
            columns = lines[i].getElementsByTagName('column');
            row = createRow(columns, undefined, 'scale-cell');
            rows.push(row);
        }

        return rows
    }

    function verticalGroupRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc;
        throw new Error("Renderer not implemented.");
    }

    function dateRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc, question = this.question, day,
            responseDateString = question.Response && question.Response.RValue, row,
            calendar = new Calendar(), responseDate, FORM_ID = 'calendar', DAY_SELECT_ID = 'day',
            MONTH_SELECT_ID = 'month', YEAR_SELECT_ID = 'year', deletedDaysCount = 0;
            // #region calendar HTML elements.
            form = document.createElement('form'),
            daySelect = document.createElement('select'),
            monthSelect = document.createElement('select'),
            yearSelect = document.createElement('select'),
            dayLabel = document.createElement('label'),
            monthLabel = document.createElement('label'),
            yearLabel = document.createElement('label');
        // #endregion

        // #region setting form elemenets attributes.
        form.setAttribute('id', FORM_ID);
        daySelect.setAttribute('id', DAY_SELECT_ID);
        monthSelect.setAttribute('id', MONTH_SELECT_ID);
        yearSelect.setAttribute('id', YEAR_SELECT_ID);
        // #endregion

        // #region populate form
        // #region append option elements to selects
        appendOptionElements(daySelect, 1, 31);
        appendOptionElements(monthSelect, 1, 12);
        appendOptionElements(yearSelect, 1940, 2030);
        // #endregion

        // #region Add label info.
        dayLabel.innerHTML = "Days: ";
        monthLabel.innerHTML = "Months: ";
        yearLabel.innerHTML = "Years: ";
        // #endregion

        // #region append select to label
        dayLabel.appendChild(daySelect);
        monthLabel.appendChild(monthSelect);
        yearLabel.appendChild(yearSelect);
        // #endregion

        // #region append labels to form
        form.appendChild(monthLabel);
        form.appendChild(dayLabel);
        form.appendChild(yearLabel);
        //#endregion

        // #region add select elements options to 'Calendar' object.
        calendar.dayElements = daySelect.children;
        calendar.monthElements = monthSelect.children;
        calendar.yearElements = yearSelect.children;
        // #endregion
        // #endregion

        // #region set 'calendar' properties
        calendar.day = daySelect.value;
        calendar.month = monthSelect.value;
        calendar.year = yearSelect.value;
        // #endregion

        // #region onchange events
        daySelect.onchange = function (e) {
            // 'e' can be event object or the value of the month.
            calendar.day = e && e.target && e.target.value || e;
        }

        monthSelect.onchange = function (e) {
            var selectedMonth;
            var currentMonth ;
            var currentDay;
            var currentYear;
            var daysInSelectedMonth;
            var daysInCurrentMonth;

            if (e.target) {
                selectedMonth = e.target.value;
                currentMonth = calendar.month;
                currentDay = daySelect.value;
                currentYear = yearSelect.value;
                daysInSelectedMonth = calendar.getDaysInMonth(selectedMonth);
                daysInCurrentMonth = calendar.getDaysInMonth(currentMonth);

                resolveDaysOptionsCount();
                resolveSelectedDay();
                calendar.month = selectedMonth;
            } else {
                // 'Date.getMonth()' returns 0-based index;
                monthSelect.selectedIndex = e;
                calendar.month = e + 1;
            }
            
            // check if selected month days are less than current month days
            // Hides or shows elements based on selected month.
            function resolveDaysOptionsCount() {
                if (daysInSelectedMonth < daysInCurrentMonth) {
                    calendar.applyDaysMapper(function () {
                        hide(this);
                    }, daysInSelectedMonth);

                } else if (daysInSelectedMonth > daysInCurrentMonth) {
                    // The selected month might be with 30 or 31 days.
                    if (isSafari()) {
                        show();
                  
                    } else {
                        calendar.applyDaysMapper(function () {
                            $(this).show();
                        }, daysInCurrentMonth, daysInSelectedMonth);
                    }
                }
            }

            // If the last day of current month is chosen and new month
            // is has less days, the new month last day is selected.
            function resolveSelectedDay() {
                if (daysInSelectedMonth < currentDay) {
                    // update 'selectedIndex' property
                    daySelect.selectedIndex = daysInSelectedMonth - 1;
                    daySelect.onchange(daysInSelectedMonth);
                    calendar.applyDaysMapper(function () {
                        // here 'this' refers to the 'daysInMonth' elements.
                        hide(this);
                    }, daysInSelectedMonth);
                }
            };
            
        };

        yearSelect.onchange = function (e) {
            var selectedYear;
            var currentYear;
            var currentMonth;
            var currentDay;
            var february;
            var leapYearFebDays;
            var daysInFebruary;

            if (e.target) {
                selectedYear = e.target.value;
                currentYear = calendar.year;
                currentMonth = calendar.month;
                currentDay = daySelect.value;
                february = 2;
                leapYearFebDays = 29;
                daysInFebruary = 28;

                //var daysInCurrentMonth = calendar.getDaysInMonth(currentMonth);

                // if selected year is not leap && current was leap && month =2 && day = 29
                if (calendar.isLeap(currentYear) && !calendar.isLeap(selectedYear) &&
                    currentMonth == february && currentDay == 29) {
                    daySelect.selectedIndex = daysInFebruary - 1;
                    daySelect.onchange(daysInFebruary);
                    calendar.applyDaysMapper(function () {
                        hide(this);
                    }, currentDay - 1);
                } else if (!calendar.isLeap(currentYear) && calendar.isLeap(selectedYear)) {
                    // restore 29 days in Feb
                    if (isSafari()) {
                        show();
                    } else {
                        calendar.applyDaysMapper(function () {
                            $(this).show();
                        }, daysInFebruary, leapYearFebDays);
                    }
                }

                calendar.year = selectedYear;
            } else {                
                setYearSelectIndex(e);
                calendar.year = e;
            }

            function setYearSelectIndex(year) {
                // '+' for fast parsing to Number.
                var lastYear = +yearSelect.lastChild.innerText;
                var firstYear = +yearSelect.firstChild.innerText;
                if (year > lastYear) {
                    year = lastYear;
                }
                if (year < firstYear) {
                    year = firstYear;
                }
                yearSelect.selectedIndex = year - firstYear;
            }
        };
        // #endregion
        
        // If question has 'Response'  and 'Response.RValue'
        if (responseDateString) {           
            responseDate = new Date(responseDateString);
            
            day = responseDate.getDate();
            daySelect.selectedIndex = day - 1;
            daySelect.onchange(day);
            monthSelect.onchange(responseDate.getMonth());
            yearSelect.onchange(responseDate.getFullYear());
        }

        row = createRow(form);
        insertDynamicColumns(doc, row);

        function updateDateSelect(selectedIndex) {
            daySelect.selectedIndex = selectedIndex;
        }

        function appendOptionElements(selectContainer, start, end) {
            var option = document.createElement('option');
            option.setAttribute('selected', 'selected');
            option.innerHTML = start++;
            selectContainer.appendChild(option);

            for (; start <= end; start++) {
                option = document.createElement('option');
                option.innerHTML = start;
                selectContainer.appendChild(option);
            }
        };

        function hide(elem) {
            if (isSafari()) {
                daySelect.removeChild(elem);
                deletedDaysCount++;

            } else {
                $(elem).hide();
            }
        };

        function show() {

            for (var i = 1; i <= deletedDaysCount; i++) {
                var option = document.createElement('option');
                option.innerText = daysInCurrentMonth + i;
                daySelect.appendChild(option);
            }

            deletedDaysCount = 0;

        }

        function isSafari() {
            var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
            return isSafari;
        }

        return row;
    }

    function datadropDownRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc;
        throw new Error("Renderer not implemented.");
    }

    function cascadedropDownRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc;
        throw new Error("Renderer not implemented.");
    }
    //#endregion

    // #region helper functions
    function createRow(columns, cellContent, cellClass) {
        /// <summary>Creates 'tr' element and adds content to it. </summary>
        /// <param name='columns' type='Element'>The Element containing info about the row. </param>
        /// <param name='cellContent' type='Object'>Object representing the HTMLElement content of each cell. </param>   
        /// <param name='cellClass' type='String'>The class of the cells. </param>   
        /// <returns type="Element">A tr element.</returns>

        var row, columnsCount = columns.length, i;

        cellClass = (cellClass || '') + ' cell';
        row = document.createElement('tr');

        // If 'columns' is node, add it directly.
        if (columns.nodeName) {
            cell = createCell(columns, cellContent);
            cell.setAttribute('class', cellClass);
            row.appendChild(cell);
        } else {
            for (i = 0; i < columnsCount; i++) {
                cell = createCell(columns[i], cellContent);
                cell.setAttribute('class', cellClass);
                row.appendChild(cell);
            }
        }

        return row;
    }

    function createCell(column, cellContent) {
        /// <summary>Creates 'td' element and adds content to it. </summary>
        /// <param name='column' type='Element'>Element containing info about the cell. </param>
        /// <param name='cellContent' type='Object'>Object representing the HTMLElement content of the cell. </param>   
        /// <returns type="Element">A td element.</returns>
        var possibleColumnNames = ['column', 'control_value'];
        var cell = document.createElement('td'), element, wrappingElement, valueAttr = column.getAttribute('value');

        cell.innerText = column.getAttribute('display');

        if (valueAttr) {
            cell.setAttribute(VALUE_ATTRIBUTE, valueAttr);
        }
        cell.setAttribute('colspan', column.getAttribute('columns') || 1);

        if (possibleColumnNames.indexOf( column.localName) === -1) {
            cell.appendChild(column);
        } else {
            if (cellContent !== undefined) {
                element = document.createElement(cellContent.elementType);
                cellContent.attributes.forEach(function (attr) {
                    element.setAttribute(attr.name, attr.value);
                });

                if (cellContent.wrappingElement !== undefined) {
                    wrappingElement = document.createElement(cellContent.wrappingElement);
                    wrappingElement.appendChild(element);
                    cell.appendChild(wrappingElement);
                } else {
                    cell.appendChild(element);
                }
            }
        }
       
        return cell;
    }

    function insertDynamicColumns(doc, row) {
        var columns = Array.prototype.slice.call(doc.getElementsByTagName('column'), 0);
        var firstChild = row.firstChild;
        columns.forEach(function (col) {
            var cell = createCell(col);
            cell.setAttribute('class', 'cell');
            row.insertBefore(cell, firstChild);
        });
    }
    // #endregion

    // #region rendering objects     
    var Calendar = (function () {
        // Declare and populate 'daysInMonth' only once.
        var daysInMonth = [];
        (function populateDaysInMonth() {
            daysInMonth[0] = 31; // Jan
            daysInMonth[1] = 28; // Feb
            for (var i = 2; i <= 6; i++) {
                if (i % 2 == 0) {
                    daysInMonth[i] = 31;
                } else {
                    daysInMonth[i] = 30;
                }
            }
            for (i = 7; i < 12; i++) {
                if (i % 2 == 0) {
                    daysInMonth[i] = 30;
                } else {
                    daysInMonth[i] = 31;
                }
            }
        })();

        var Calendar = function () {
            this.day,
            this.month,
            this.year,
            this.dayElements = [], // HTML 'option' elements for days.
            this.monthElements = [], // HTML 'option' elements for months.
            this.yearElements = []; // HTML 'option' elements for years.
        };

        Calendar.prototype.isLeap = function (year) {
            return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
        }

        Calendar.prototype.getDaysInMonth = function (month) {
            var monthIndex = month - 1;
            if (this.isLeap(this.year) && month == 2) {
                // For Feb in a leap year return 29;
                return daysInMonth[monthIndex] + 1;
            }

            return daysInMonth[monthIndex];
        }

        Calendar.prototype.applyDaysMapper = function (callback, startIndex, endIndex) {
            var days= Array.prototype.slice.call(this.dayElements, startIndex, endIndex);            
            days.map(function (elem) {
                // use the elem as 'this' in the callback
                callback.apply(elem);
            });

        }

        return Calendar;
    })();
    // #endregion

    // #region handlers
    var calendar = document.getElementById("calendar");


    // #endregion

    XMLRendererFactory.addXMLRenderer(DISPLAY_TYPE_TEXT, textRenderer);
    XMLRendererFactory.addXMLRenderer(DISPLAY_TYPE_LABEL, labelRenderer);
    XMLRendererFactory.addXMLRenderer(DISPLAY_TYPE_RADIO, radioGroupRenderer);
    XMLRendererFactory.addXMLRenderer(DISPLAY_TYPE_DROPDOWN, dropDownRenderer);
    XMLRendererFactory.addXMLRenderer(DISPLAY_TYPE_SCALE, scaleRenderer);
    XMLRendererFactory.addXMLRenderer(DISPLAY_VERTICAL_GROUP, verticalGroupRenderer);
    XMLRendererFactory.addXMLRenderer(DISPLAY_TYPE_DATE, dateRenderer);
    XMLRendererFactory.addXMLRenderer(DISPLAY_TYPE_DATADROPDOWN, datadropDownRenderer);
    XMLRendererFactory.addXMLRenderer(DISPLAY_TYPE_CASCADEDROPDOWN, cascadedropDownRenderer);
}

