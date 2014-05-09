/// <reference path="functions.js" />
/// <reference path="DropdownHttpClient.js" />
/// <reference path="debugHelper.js" />
/// <reference path="rendererFactory.js" />
/// <reference path="renderersCommonFunctions.js" />
/// <reference path="constants.js" />
/// <reference path="jquery-2.1.0.min.js" />
/// <reference path="RenderersCommonObjects.js" />
/// <reference path="dropdownRenderers.js" />
(function initializeRenderers() {
    var functions = renderersCommon.functions,
        objects = renderersCommon.objects,
        constants = renderersCommon.constants;

    //#region renderers    
    function textRenderer(XMLDoc) {
        var doc = XMLDoc || this.XMLDoc, row, dynamicTagName = 'column', textArea,
            textareaClass = 'teaxarea-cell', lengthTag, textAreaMaxLength,
            initialTextareaColsCount = 50, returnsAnswerAttribute = 'not required',
            // As is in original method. Don`t know why this value is chosen.
            initialTextareaRowsCount = 5, questionId = this.question.ID; 

        textArea = document.createElement('textarea');

        lengthTag = doc.getElementsByTagName('length')[0];
        textAreaMaxLength = lengthTag.getAttribute('value');
        textArea.setAttribute('maxlength', textAreaMaxLength);

        // Taken from original "RenderText" method.
        if (textAreaMaxLength > initialTextareaColsCount) {
            textArea.setAttribute('rows', initialTextareaRowsCount);
        }
        textArea.setAttribute('cols', initialTextareaColsCount);

        row = functions.createRow(textArea, undefined, textareaClass, returnsAnswerAttribute);
        row.firstChild.setAttribute('colspan',
            XMLRendererFactory.QuestionerDataStorage.dataColumnCount);
        functions.insertDynamicContents(doc, row, dynamicTagName);

        restoreAnswer(this.question);

        textArea.onchange = function updateAnswer() {
            var text = textArea.value, response, responseArray;
            if (text === '') {
                row.removeAttribute(constants.ANSWER_ATTRIBUTE);
            } else {
                response = new objects.Response(questionId, text, null);
                responseArray = [];

                responseArray.push(response);
                row.setAttribute(constants.ANSWER_ATTRIBUTE, JSON.stringify(responseArray));
            }
        };

        function restoreAnswer(question) {
            var response = question.Data.Response, restoredArray, restoredResponse, rValue;

            if (response !== null) {
                restoredArray = [];
                rValue = response.RValue;
                restoredResponse = new objects.Response(Number(question.ID), rValue, null);
                
                textArea.value = rValue;
                restoredArray.push(restoredResponse);
                row.setAttribute(constants.ANSWER_ATTRIBUTE, JSON.stringify(restoredArray));
            }
        }
                
        return row;
    }

    function labelRenderer(XMLDoc) {
        var doc = XMLDoc || this.XMLDoc, row, labelSpanTag = 'label_span',colSpanAttribute, colSpan,
            cellClass = 'label-cell', repeatlastScaleAttribute, repeatlastScale, cell,
            returnsAnswerAttribute = 'none';
        
        labelSpanTag = doc.getElementsByTagName(labelSpanTag)[0];
        colSpanAttribute = labelSpanTag.getAttribute('value');      

        colSpan = parseInt(colSpanAttribute);

        if (colSpanAttribute[0] === '+') {
            colSpan += XMLRendererFactory.QuestionerDataStorage.dataColumnCount;
        }

        row = document.createElement('tr');        
        row.setAttribute(constants.RETURN_ANSWER, returnsAnswerAttribute);
        functions.insertDynamicContents(doc, row, 'row', cellClass);
        row.firstChild.setAttribute('colspan', colSpan);

        repeatlastScaleAttribute = doc.getElementsByTagName('repeat_last_scale')[0];
        repeatlastScale = repeatlastScaleAttribute.getAttribute('value');
        if (repeatlastScale === 'true') {
            cell = document.createElement('td');
            cell.setAttribute('colspan', XMLRendererFactory.QuestionerDataStorage.dataColumnCount);
            cell.className = cellClass + ' cell';
            
            row.appendChild(cell);
        }

        return row;
    }

    function scaleRenderer(XMLDoc) {
        var doc = XMLDoc || this.XMLDoc,
        rows = [], row, cell, lines, columns,
        linesCount, columsCountAttribute, columnsCount, i = 0, j = 0,
        returnsAnswerAttribute = 'none';
        lines = doc.getElementsByTagName('line'), linesCount = lines.length;

        columsCountAttribute = doc.getElementsByTagName('column_count')[0];
        if (columsCountAttribute!== undefined) {
            XMLRendererFactory.QuestionerDataStorage.dataColumnCount = columnsCount =
            Number(columsCountAttribute.getAttribute('value'));
        }

        // for each 'line' tag. 'columnsCount' might differ from 'columns_count_attr'.
        for (; i < linesCount; i++) {
            columns = lines[i].getElementsByTagName('column');
            if (columns && columns.length) {
                row = functions.createRow(columns, undefined, 'scale-cell', returnsAnswerAttribute);
                row.className = this.rowClassName;
                rows.push(row);
            }
        }

        return rows
    }

    function radioGroupRenderer(XMLDoc) {
        var doc = XMLDoc || this.XMLDoc, controlValues, controlValuesRow,
        row, cellContent, lines, i = 0, answers, innerTableRadioCellClass,
        innerTableClass, labelPatternClass = 'label-cell', columns, question = this.question,
        dynamicTagName = 'column', innerTable, scales, innerTableLabelClass = undefined,
        returnsAnswerAttribute = 'required';

        controlValues = doc.getElementsByTagName('control_value');
        lines = doc.getElementsByTagName('line');
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
                        value: 'radio-' + question.ID
                    }]
                }]
            }]
        };
        //If true,  multiple rows to be inserted. Use table and again insert single row.
        if (lines.length) {
            initialiseInnerTableClasses();
            innerTable = document.createElement('table');
            populateInnerTable(innerTable);
            cellContent = undefined;
        } else {
            radioCellClass = 'radio-cell';
        }

        row = functions.createRow(innerTable || controlValues,
            cellContent, innerTableClass || radioCellClass,
            returnsAnswerAttribute);

        functions.insertDynamicContents(doc, row, dynamicTagName, innerTableLabelClass);

        functions.attachRowFunctionality(row, innerTable, question);

        function populateInnerTable(table) {
            dynamicTagName = 'row';
            scales = scaleRenderer.call(this, doc);

            scales.forEach(function (scale) {
                constants.forEach.call(scale.children, function (scaleCell) {
                    scaleCell.className = 'inner-table-scale-cell cell';
                });
                table.appendChild(scale);
            });
            controlValuesRow = functions.createRow(controlValues, cellContent, innerTableRadioCellClass);

            table.appendChild(controlValuesRow);
            table.className = 'inner-table';
        }

        function initialiseInnerTableClasses() {
            innerTableRadioCellClass = 'inner-table-radio-cell';
            innerTableLabelClass = 'inner-table-label';
            innerTableClass = 'radio-table-cell';
        }

        return row;
    }

    function verticalGroupRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc, controlValues, controlValue,
        row, cellContent, lines, controlValuesCount, i = 0, radioCellClass = 'vertical-radio-cell',
        columns, question = this.question, dynamicTagName = 'row', splitValue = false,
        innerTableLabelClass = 'vertical-radio-label', innerTable, returnsAnswerAttribute = 'required',
        answers;

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
                        value: 'vertical-radio-' + question.ID
                    }]
                }]
            }]
        };

        controlValues = doc.getElementsByTagName('control_value');

        if (controlValues[0].getAttribute('display').indexOf('|') >= 0) {
            splitValue = true;
            innerTable = document.createElement('table');
        }

        constants.forEach.call(controlValues, function addControlValuesRow(controlValue) {
            var radioCellClass, splitResult, splittedControlValues,
                controlValueTag;
            // First part of split to be converted into text, second part - into radio button.
            if (splitValue === true) {
                radioCellClass = 'horizontal-radio-cell';
                populateInnerTable(innerTable);                
            }

            function populateInnerTable(table) {
                var controlValueTag, innerTableRow;
                splitResult = controlValue.getAttribute('display').split('|');
                splittedControlValues = [];
                splittedControlValues.push(splitResult[0]);
                controlValueTag = functions.createControlValueTag(controlValue, splitResult[1]);
                splittedControlValues.push(controlValueTag);

                innerTableRow = functions.createRow(splittedControlValues, cellContent, radioCellClass);                
                table.appendChild(innerTableRow);
            }
        });

        row = functions.createRow(innerTable || controlValues, cellContent, radioCellClass,
            returnsAnswerAttribute);
        functions.insertDynamicContents(doc, row, dynamicTagName, innerTableLabelClass);

        functions.attachRowFunctionality(row, innerTable, question);

        return row;
    }

    function dateRenderer(XMLDoc) {
        var doc = XMLDoc || this.XMLDoc, question = this.question, dynamicTagName = 'column',
            response = question.Data.Response, row,
            calendar = new objects.Calendar(), responseDate, FORM_ID = 'calendar', DAY_SELECT_ID = 'day',
            MONTH_SELECT_ID = 'month', YEAR_SELECT_ID = 'year', returnsAnswerAttribute = 'required';
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

            updateAnswer();
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

            updateAnswer();
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

            updateAnswer();
        };
        // #endregion

        row = functions.createRow(form, undefined, '', returnsAnswerAttribute);
        row.firstChild.
            setAttribute('colspan', XMLRendererFactory.QuestionerDataStorage.dataColumnCount);
        functions.insertDynamicContents(doc, row, dynamicTagName);

        // If question has 'Response'  and 'Response.RValue'
        if (response!== null) {
            restoreAnswer(); // Should be called after 'row' is created.
        } else {
            // Will set the initial date.
            updateAnswer();
        }

        function restoreAnswer() {
            var restoredArray = [];
            var day, month, year, responseDate = new Date(response.RValue);
            day = responseDate.getDate();
            month = responseDate.getMonth();
            year = responseDate.getFullYear();

            daySelect.selectedIndex = day - 1;
            daySelect.onchange(day);
            monthSelect.onchange(month, year);
            yearSelect.onchange(year);

            updateAnswer();
        }

        function updateAnswer() {
            var responseArray = [];
            var date = '';
            date = calendar.year + '/' + calendar.month + '/' + calendar.day;
            responseArray.push(new objects.Response(question.ID, date, null));
            row.setAttribute(constants.ANSWER_ATTRIBUTE, JSON.stringify(responseArray));
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
                option.innerHTML = daysInCurrentMonth + i;
                daySelect.appendChild(option);
            }
        }

        return row;
    };

    //#endregion

    XMLRendererFactory.addXMLRenderer(constants.DISPLAY_TYPE_TEXT, textRenderer);
    XMLRendererFactory.addXMLRenderer(constants.DISPLAY_TYPE_LABEL, labelRenderer);
    XMLRendererFactory.addXMLRenderer(constants.DISPLAY_TYPE_RADIO, radioGroupRenderer);
    XMLRendererFactory.addXMLRenderer(constants.DISPLAY_TYPE_DROPDOWN,dropdownRenderers.dropDownRenderer);
    XMLRendererFactory.addXMLRenderer(constants.DISPLAY_TYPE_SCALE, scaleRenderer);
    XMLRendererFactory.addXMLRenderer(constants.DISPLAY_VERTICAL_GROUP, verticalGroupRenderer);
    XMLRendererFactory.addXMLRenderer(constants.DISPLAY_TYPE_DATE, dateRenderer);
    XMLRendererFactory.addXMLRenderer(constants.DISPLAY_TYPE_DATADROPDOWN, dropdownRenderers.datadropDownRenderer);
    XMLRendererFactory.addXMLRenderer(constants.DISPLAY_TYPE_CASCADEDROPDOWN, dropdownRenderers.cascadedropDownRenderer);
})();