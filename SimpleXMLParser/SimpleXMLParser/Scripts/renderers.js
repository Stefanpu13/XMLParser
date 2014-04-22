/// <reference path="rendererFactory.js" />
/// <reference path="jquery-2.1.0.min.js" />
/// <reference path="jquery-2.1.0.min.js" />
(function initializeRenderers() {
    var DISPLAY_TYPE_SCALE = "scale", DISPLAY_TYPE_LABEL = "label",
        DISPLAY_TYPE_TEXT = "text", DISPLAY_TYPE_RADIO = "radio_group",
        DISPLAY_VERTICAL_GROUP = "vertical_group", DISPLAY_TYPE_DROPDOWN = "drop_box",
        DISPLAY_TYPE_DATE = "date", DISPLAY_TYPE_DATADROPDOWN = "data_dropdown",
        DISPLAY_TYPE_CASCADEDROPDOWN = "cascade_dropdown", EXTERNAL_REF = 'ExternalRef',
        Q_TEXT = 'QText', currentIncompleteRow,
        // Custom attribute to be added to the different answer options.
        // #region custom attributes
        VALUE_ATTRIBUTE = "data-answer-value",
        COLUMNS_COUNT_ATTTRIBUTE = 'data-columns-count';
    // #endregion

    //#region renderers    
    function textRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc, row, dynamicTagName = 'column', textArea,
            textareaClass = 'teaxarea-cell', lengthTag, textAreaMaxLength,
            initialTextareaColsCount = 50,
            // As is in original method. Don`t know why this value is chosen.
            initialTextareaRowsCount = 5; 

        textArea = document.createElement('textarea');

        lengthTag = doc.getElementsByTagName('length')[0];
        textAreaMaxLength = lengthTag.getAttribute('value');
        textArea.setAttribute('maxlength', textAreaMaxLength);

        // Taken from original "RenderText" method.
        if (textAreaMaxLength > initialTextareaColsCount) {
            textArea.setAttribute('rows', initialTextareaRowsCount);
        }
        textArea.setAttribute('cols', initialTextareaColsCount);

        row = createRow(textArea, undefined, textareaClass);
        insertDynamicContents(doc, row, dynamicTagName);

        return row;
    }

    function labelRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc, row, labelSpanTag = 'label_span', colSpan,
            cellClass = 'label-cell';
        
        labelSpanTag = doc.getElementsByTagName(labelSpanTag)[0];
        colSpan = labelSpanTag.getAttribute('value');        

        row = document.createElement('tr');        
        insertDynamicContents(doc, row, 'row', 'label');        

        return row;
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

    function radioGroupRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc, controlValues, controlValuesRow,
        row, cellContent, lines, i = 0, radioCellClass = 'radio-cell',
        innerTableRadioCellClass = 'inner-table-radio-cell', labelPatternClass = 'label-cell',
        columns, questionID = this.question.ID, dynamicTagName = 'column', table, scales,
        innerTableClass = 'radio-table-cell', innerTableLabelClass = 'inner-table-label';

        lines = doc.getElementsByTagName('line');
        controlValues = doc.getElementsByTagName('control_value');

        cellContent = {
            elements: [{
                type: 'label',
                attributes: [{
                    name: 'class',
                    value: 'radio-label'
                }],
                innerElements: [{
                    type: 'input',
                    attributes: [{
                        name: 'type',
                        value: 'radio'
                    }, {
                        name: 'name',
                        value: 'radio-' + questionID
                    }]
                }]
            }]
        };        

        //If true,  multiple rows to be inserted. Use table and again insert single row.
        if (lines.length) {
            dynamicTagName = 'row';
            table = document.createElement('table');
            scales = scaleRenderer(doc);
            scales.forEach(function (scale) {
                Array.prototype.forEach.call(scale.children, (function (scaleCell) {
                    scaleCell.setAttribute('class', 'inner-table-scale-cell cell');
                }));
                table.appendChild(scale);
            });
            controlValuesRow = createRow(controlValues, cellContent, innerTableRadioCellClass);

            table.appendChild(controlValuesRow);
            table.setAttribute('class', 'inner-table');
            row = createRow(table, undefined, innerTableClass);
            insertDynamicContents(doc, row, dynamicTagName, innerTableLabelClass);

        } else {
            row = createRow(controlValues, cellContent, radioCellClass);
            insertDynamicContents(doc, row, dynamicTagName);
        }
        
        return row;
    }

    function verticalGroupRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc, controlValues, controlValue,
        row, cellContent, lines, controlValuesCount, i = 0, radioCellClass = 'vertical-radio-cell',
        columns, questionID = this.question.ID, dynamicTagName = 'row';
       
        controlValues = doc.getElementsByTagName('control_value');

        // cellContent is a 'label' tag with <input type=radio>
        cellContent = {
            elements: [{
                type: 'label',
                innerElements: [{
                    type: 'input',
                    attributes: [{
                        name: 'type',
                        value: 'radio'
                    }, {
                        name: 'name',
                        value: 'vertical-radio-' + questionID
                    }]
                }]
            }]
        };
        row = createRow(controlValues, cellContent, radioCellClass);
        insertDynamicContents(doc, row, dynamicTagName, 'vertical-radio-label cell');
       
        return row;
    }

    function dropDownRenderer(XMLDoc) {
        // 'this' - refers to the rendering object created in 
        // 'addRenderer' method in 'rendererFactory'.
        var doc = this.XMLDoc || XMLDoc,
            dropDowns = doc.getElementsByTagName('control_values'),
            dropDownsCount = dropDowns.length, i = 0, j = 0, controls, controlsCount, columns = [],
            selectElement, optionElement, tableRow, tableCell, cellContent,
            dynamicTagName = 'column', incompleteRowTag, incompleteRowTagValue;

        for (; i < dropDownsCount; i += 1) {
            controls = dropDowns[i].getElementsByTagName('control_value');
            selectElement = document.createElement('select');
            controlCount = controls.length;

            for (; j < controlCount; j += 1) {
                optionElement = createOptionElement(controls[j]);
                selectElement.add(optionElement);
            }
        }

        incompleteRowTag = doc.getElementsByTagName('incomplete_row')[0];
        if (incompleteRowTag !== undefined) {
            incompleteRowTagValue = incompleteRowTag.getAttribute('value');

            if (incompleteRowTagValue !== 'end') {
                selectElement.setAttribute('columns', 2);
                tableRow = createRow(selectElement, undefined, 'select-cell');
                selectElement.removeAttribute('columns');
                insertDynamicContents(doc, tableRow, dynamicTagName);

                if (incompleteRowTagValue === 'start') {
                    currentIncompleteRow = tableRow;
                }
            } else {
                selectElement.setAttribute('columns', 2);
                appendCell(currentIncompleteRow, undefined, selectElement, 'select-cell cell');
                selectElement.removeAttribute('columns');
            }

        }
        else {            
            tableRow = createRow(selectElement, undefined, 'select-cell');            
            insertDynamicContents(doc, tableRow, dynamicTagName);
        }




        function createOptionElement(columnElement) {
            var optionElement = document.createElement('option');
            optionElement.setAttribute(VALUE_ATTRIBUTE, columnElement.getAttribute('value'));
            //optionElement.innerText = columnElement.getAttribute('display');
            optionElement.innerHTML = columnElement.getAttribute('display');

            return optionElement;
        }

        return tableRow;
    }

    function dateRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc, question = this.question, dynamicTagName = 'column',
            responseDateString = question.Data.Response && question.Data.Response.RValue, row,
            calendar = new Calendar(), responseDate, FORM_ID = 'calendar', DAY_SELECT_ID = 'day',
            MONTH_SELECT_ID = 'month', YEAR_SELECT_ID = 'year';
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
        dayLabel.innerHTML = "Day: ";
        monthLabel.innerHTML = "Month: ";
        yearLabel.innerHTML = "Year: ";
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

        // #endregion

        // #region set 'calendar' properties
        calendar.day = daySelect.value;
        calendar.month = monthSelect.value;
        calendar.year = yearSelect.value;
        // #endregion

        // #region onchange events
        // 'e' can be event object or number representing a day.
        daySelect.onchange = function (e) {
            var selectedDay = Number(e && e.target && e.target.value || e);
            calendar.day = selectedDay;
            // update 'selectedIndex' property.
            daySelect.selectedIndex = selectedDay - 1;
        }

        // 'e' can be event object or number representing an year.
        monthSelect.onchange = function (e, year) {
            var selectedMonth;
            var currentMonth;
            var currentDay;
            var currentYear;
            var daysInSelectedMonth;
            var daysInCurrentMonth;

            if (e.target !== undefined) {
                selectedMonth = Number(e.target.value);
                currentMonth = calendar.month;
                currentDay = Number(daySelect.value);
                currentYear = Number(yearSelect.value);
                daysInSelectedMonth = calendar.getDaysInMonth(selectedMonth);
                daysInCurrentMonth = calendar.getDaysInMonth(currentMonth);

                calendar.month = selectedMonth;
            } else {
                monthSelect.selectedIndex = e;
                year = year || calendar.year;
                daysInSelectedMonth = calendar.getDaysInMonth(e + 1, year);
                daysInCurrentMonth = 31;

                calendar.month = e + 1;
            }

            resolveDaysOptionsCount();
            resolveSelectedDay();

            // Check if selected month days are less or more than current month days.
            // Hides or shows days options based on selected month.
            function resolveDaysOptionsCount() {
                if (daysInSelectedMonth < daysInCurrentMonth) {
                    hide(daysInSelectedMonth, daysInCurrentMonth);

                } else if (daysInSelectedMonth > daysInCurrentMonth) {
                    show(daysInCurrentMonth, daysInSelectedMonth);
                }
            }

            // If the last day of current month is chosen and new month
            //  has less days, the new month last day is selected.
            function resolveSelectedDay() {
                if (daysInSelectedMonth < currentDay) {
                    daySelect.onchange(daysInSelectedMonth);
                }
            };
        };

        // 'e' can be event object or number representing a month.
        yearSelect.onchange = function (e) {
            var selectedYear, currentYear, currentMonth, currentDay,
            february, leapYearFebDays, februaryDays;

            if (e.target !== undefined) {
                selectedYear = Number(e.target.value);
                currentYear = calendar.year;
                currentMonth = calendar.month;
                currentDay = Number(daySelect.value);
                february = 2;
                leapYearFebDays = 29;
                februaryDays = 28;

                // change from leap to non-leap. hide the 29th day.
                if (calendar.isLeap(currentYear) && calendar.isLeap(selectedYear) === false &&
                    currentMonth === february) {
                    daySelect.onchange(februaryDays);
                    hide(februaryDays, leapYearFebDays);
                } else if (calendar.isLeap(currentYear) === false && calendar.isLeap(selectedYear)
                    && currentMonth === february) { // change from non-leap to leap. show the 29th day.
                    show(februaryDays, leapYearFebDays);
                }

                calendar.year = selectedYear;
            } else {
                selectedYear = e;
                calendar.year = e;
            }

            yearSelect.selectedIndex = selectedYear - Number(yearSelect.firstChild.value);
        };
        // #endregion

        // If question has 'Response'  and 'Response.RValue'
        if (responseDateString) {
            restoreResponseDate();
        }

        row = createRow(form);
        insertDynamicContents(doc, row, dynamicTagName);

        function restoreResponseDate() {
            var day, month, year, responseDate = new Date(responseDateString);
            day = responseDate.getDate();
            month = responseDate.getMonth();
            year = responseDate.getFullYear();

            daySelect.selectedIndex = day - 1;
            daySelect.onchange(day);
            monthSelect.onchange(month, year);
            yearSelect.onchange(year);
        }

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

        function hide(startDayIndex, endDayIndex) {
            for (var i = startDayIndex; i < endDayIndex; i++) {
                daySelect.removeChild(daySelect.lastChild);
            }
        };

        function show(daysInCurrentMonth, daysInSelectedMonth) {
            var daysCount = daysInSelectedMonth - daysInCurrentMonth, i, option;

            for (i = 1; i <= daysCount; i++) {
                option = document.createElement('option');
                //option.innerText = daysInCurrentMonth + i;
                option.innerHTML = daysInCurrentMonth + i;
                daySelect.appendChild(option);
            }
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
        var row, columnsCount = columns.length, i, classAttribute;
        
        cellClass = (cellClass || '') + ' cell';
        row = document.createElement('tr');

        if (columns.nodeName) {
            appendCell(row, cellContent, columns, cellClass);
        } else {
            for (i = 0; i < columnsCount; i++) {
                appendCell(row, cellContent, columns[i], cellClass);
            }
        }

        return row;
    }

    function appendCell(row, cellContent, column, cellClass) {
        var cell = createCell(column, cellContent);
        cell.setAttribute('class', cellClass);
        row.appendChild(cell);
    }

    function createCell(column, cellContent) { 
        var possibleColumnNames = ['column', 'control_value'], cell = document.createElement('td'),
            element, displayAttrValue, columnValueAttr = column.getAttribute('value'),            
            dynamicAttribute = column.getAttribute(Q_TEXT) || column.getAttribute(EXTERNAL_REF);

        if (columnValueAttr) {
            cell.setAttribute(VALUE_ATTRIBUTE, columnValueAttr);
        }

        cell.setAttribute('colspan', column.getAttribute('columns') || 1);

        if (possibleColumnNames.indexOf(column.localName) < 0) {
            cell.appendChild(column);
        } else {
            if (cellContent !== undefined) {
                parseCellContent(cell, cellContent);
            }
        }
        
        if (dynamicAttribute) {
            //cell.innerText = dynamicAttribute;
            cell.innerHTML = dynamicAttribute;
        } else { // Insert display text at beginning of innerHTML         
            displayAttrValue = column.getAttribute('display');
            if (displayAttrValue !== null) {
                cell.innerHTML = cell.innerHTML + displayAttrValue;
            }
        }

        return cell;
    }

    // Creates the elements based on 'cellContent' object and inserts them in cell
    function parseCellContent(cell, cellContent) {
        var elements = cellContent.elements;
        elements.forEach(function (elem) {
            var domElement = createElement(elem);

            if (elem.innerElements !== undefined && elem.innerElements.length > 0) {
                elem.innerElements.forEach(function (innerElem) {
                    var innerElement = createElement(innerElem);
                    domElement.appendChild(innerElement);
                });
            }
            cell.appendChild(domElement);
        });
    }

    function createElement(elem) {
        var element = document.createElement(elem.type);
        if (elem.attributes && elem.attributes.length) {
            elem.attributes.forEach(function (attr) {
                element.setAttribute(attr.name, attr.value);
            });
        }

        return element;
    }

    function insertDynamicContents(doc, contentHolder, contentType, contentClass) {
        var dynamicContent = Array.prototype.slice.call(doc.getElementsByTagName(contentType), 0),
            i = dynamicContent.length - 1;
        
        for (; i >= 0; i--) {
            // Dynamic content is created and added as tag/s
            // during parsing XML in 'parseXML' method in the 'XMLRendererFactory'.
            insertDynamicContent(dynamicContent[i], contentHolder, contentClass);
        }
    }

    function insertDynamicContent(content, contentHolder, contentClass) {
        var cell, columnsAttributeValue;
        // Tag contains dynamic data: 
        //Example:   '<column ExternalRef='Some dynamic content' display="ExternalRef"/>'             

        if (content.getAttribute('display').indexOf(Q_TEXT) >= 0 ||
            content.getAttribute('display').indexOf(EXTERNAL_REF) >= 0) {
            cell = createCell(content);
            cell.setAttribute('class', (contentClass || '') + ' cell');

            addFirst(cell, contentHolder);
        }

        columnsAttributeValue = content.getAttribute('columns');
        if (columnsAttributeValue !== null) {
            cell.setAttribute('colspan', columnsAttributeValue);
        }
    };

    // If 'contentHolder' is 'tr' - use 'Node' methods,
    // if 'contentHolder' is array-like - use array methods
    function addFirst(cell, contentHolder) {

        var firstChild;
        if (contentHolder.length !== undefined) {
            if (contentHolder.length > 0) {
                Array.prototype.splice.call(contentHolder, 0, 0, cell);
            } else {
                Array.prototype.push.call(contentHolder, cell);
            }
        }

        if (contentHolder.nodeName !== undefined) {
            firstChild = contentHolder.firstChild;
            if (firstChild) {
                contentHolder.insertBefore(cell, firstChild);
            } else {
                contentHolder.appendChild(cell);
            }
        }
    }
    // #endregion

    // #region rendering objects     
    var Calendar = (function () {

        var Calendar = function () {
            this.day,
            this.month,
            this.year;
        };

        Calendar.prototype.isLeap = function (year) {
            return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
        }

        Calendar.prototype.getDaysInMonth = function (month, year) {
            return new Date(year || this.year, month, 0).getDate();
        }

        return Calendar;
    })();
    // #endregion

    // #region handlers
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
})();

