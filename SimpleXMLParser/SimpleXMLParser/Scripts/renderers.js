/// <reference path="rendererFactory.js" />
/// <reference path="jquery-2.1.0.min.js" />
/// <reference path="jquery-2.1.0.min.js" />
(function initializeRenderers() {
    var DISPLAY_TYPE_SCALE = "scale", DISPLAY_TYPE_LABEL = "label",
        DISPLAY_TYPE_TEXT = "text", DISPLAY_TYPE_RADIO = "radio_group",
        DISPLAY_VERTICAL_GROUP = "vertical_group", DISPLAY_TYPE_DROPDOWN = "drop_box",
        DISPLAY_TYPE_DATE = "date", DISPLAY_TYPE_DATADROPDOWN = "data_dropdown",
        DISPLAY_TYPE_CASCADEDROPDOWN = "cascade_dropdown", EXTERNAL_REF = 'ExternalRef',
        Q_TEXT = 'QText', RETURN_ANSWER = 'data-return-answer', currentIncompleteRow,
        forEach = Array.prototype.forEach,
        // Custom attribute to be added to the different answer options.
        // #region custom attributes
        ANSWER_ATTRIBUTE = "data-answer-value",
        COLUMNS_COUNT_ATTTRIBUTE = 'data-columns-count';
    // #endregion

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

        row = createRow(textArea, undefined, textareaClass, returnsAnswerAttribute);
        row.firstChild.setAttribute('colspan',
            XMLRendererFactory.QuestionerDataStorage.dataColumnCount);
        insertDynamicContents(doc, row, dynamicTagName);

        restoreAnswer(this.question);

        textArea.onchange = function updateAnswer(e) {
            var response = new Response(questionId, textArea.value, null),
                responseToString = JSON.stringify(response);
            row.setAttribute(ANSWER_ATTRIBUTE,responseToString);
        };

        function restoreAnswer(question) {
            var response = question.Data.Response,
                value = response && response.RValue;

            if (value) {
                textArea.value = value;
                row.setAttribute(ANSWER_ATTRIBUTE, value);
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
        row.setAttribute(RETURN_ANSWER, returnsAnswerAttribute);
        insertDynamicContents(doc, row, 'row', cellClass);
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
        linesCount, columsCountAttribute, columnsCount, i = 0, j = 0, returnsAnswerAttribute = 'none';
        lines = doc.getElementsByTagName('line'), linesCount = lines.length;

        columsCountAttribute = doc.getElementsByTagName('column_count')[0];
        if (columsCountAttribute!== undefined) {
            XMLRendererFactory.QuestionerDataStorage.dataColumnCount = columnsCount =
            Number(columsCountAttribute.getAttribute('value'));
        }

        // for each 'line' tag. 'columnsCount' might differ from 'columns_count_attr'.
        for (; i < linesCount; i++) {
            columns = lines[i].getElementsByTagName('column');
            row = createRow(columns, undefined, 'scale-cell', returnsAnswerAttribute);            
            rows.push(row);
        }

        return rows
    }

    function radioGroupRenderer(XMLDoc) {
        var doc =XMLDoc || this.XMLDoc, controlValues, controlValuesRow,
        row, cellContent, lines, i = 0, radioCellClass = 'radio-cell',
        innerTableRadioCellClass = 'inner-table-radio-cell', labelPatternClass = 'label-cell',
        columns, questionId = this.question.ID, dynamicTagName = 'column', table, scales,
        innerTableClass = 'radio-table-cell', innerTableLabelClass = 'inner-table-label', returnsAnswerAttribute = 'required';
        
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
                        value: 'radio-' + questionId
                    }]
                }]
            }]
        };        
        controlValues = doc.getElementsByTagName('control_value');
        lines = doc.getElementsByTagName('line');
        //If true,  multiple rows to be inserted. Use table and again insert single row.
        if (lines.length) {
            dynamicTagName = 'row';
            table = document.createElement('table');
            //scales = scaleRenderer(doc);
            scales = scaleRenderer.call(this, doc);

            scales.forEach(function (scale) {
                forEach.call(scale.children, function (scaleCell) {
                    scaleCell.className = 'inner-table-scale-cell cell';
                });
                table.appendChild(scale);
            });
            controlValuesRow = createRow(controlValues, cellContent, innerTableRadioCellClass);

            table.appendChild(controlValuesRow);
            table.className = 'inner-table';
            row = createRow(table, undefined, innerTableClass, returnsAnswerAttribute);
            //Uncomment the following code if you want to use 'dataColumnCount' as in original method.
            // Also put in comment 'width:100%' of '.inner-table'.
            // row.firstChild.setAttribute('colspan', XMLRendererFactory.QuestionerDataStorage.dataColumnCount);


            insertDynamicContents(doc, row, dynamicTagName, innerTableLabelClass);
            // Change in innerTable row('controlValuesRow') updates answer on parent row('row').
            // The parent row is later used to get answer.
            forEach.call(controlValuesRow.childNodes, function (node) {
                attachUpdateAnswer.call(undefined, node, row);
            });

        } else {
            row = createRow(controlValues, cellContent,
                radioCellClass, returnsAnswerAttribute);
            insertDynamicContents(doc, row, dynamicTagName);

            forEach.call(row.childNodes, function (node) {
                attachUpdateAnswer.call(undefined, node, row);
            });
            }

        function attachUpdateAnswer(node, row) {

            // node is either 'td' with 'input' or 'td' with plain text.
            var radioButton = node.firstChild.firstChild; // radio 'input' is inside label'
            if (radioButton) {
                radioButton.onchange = function () {
                    updateAnswer(node, row);
                }
            }
        }        

        function updateAnswer(node, row) {
            var answerValue = node.getAttribute(ANSWER_ATTRIBUTE),
                response = new Response(questionId, answerValue, null),
                responseToString = JSON.stringify(response);
            responseToString = JSON.stringify(response);
            row.setAttribute(ANSWER_ATTRIBUTE, responseToString);            
        }
        
        return row;
    }

    function verticalGroupRenderer(XMLDoc) {
        var doc =  XMLDoc || this.XMLDoc, controlValues,
        row, rows = [], firstRow, splitValue, labelClass, cellContent, lines, controlValuesCount, i = 0,
        columns, questionId = this.question.ID, dynamicTagName = 'row', returnsAnswerAttribute = 'required',
            labelReturnsAnswerAttribute = 'none', currentSelectedRow;

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
                        value: 'vertical-radio-' + questionId
                    }]
                }]
            }]
        };
        controlValues = doc.getElementsByTagName('control_value');
        
        if (controlValues[0].getAttribute('display').indexOf('|') >= 0) {
            splitValue = true;            
        }

        forEach.call(controlValues, function addControlValueRow(controlValue) {
            var radioCellClass, splitResult, splittedControlValues;           

            // First part of split to be converted into text, second part - into radio button.
            if (splitValue === true) {
                splitResult = controlValue.getAttribute('display').split('|');
                splittedControlValues = [];
                splittedControlValues.push(splitResult[0]);
                createControlValueTag(splitResult[1], splittedControlValues);
                radioCellClass = 'horizontal-radio-cell';
            } else { // 'controlValue' to be converted to radio button.
                splittedControlValues = controlValue;
                radioCellClass = 'vertical-radio-cell';
            }

            row = createRow(splittedControlValues, cellContent,
                radioCellClass, returnsAnswerAttribute);
            rows.push(row);
        });

        if (splitValue === true) {
            firstRow = document.createElement('tr');
            firstRow.setAttribute(RETURN_ANSWER, labelReturnsAnswerAttribute);
            rows.unshift(firstRow);
            labelClass = 'horizontal-radio-label';
        } else {
            firstRow = rows[0];
            labelClass = 'vertical-radio-label';
        }
        
        insertDynamicContents(doc, firstRow, dynamicTagName, labelClass);

        rows.forEach(function (tr) {            
            var radioButton = tr.getElementsByTagName('input')[0], 
              td = tr.lastChild; // row might have two 'td'`s but the last contains the answer.
            // Answers per row are updated only once. 
            // Then 'RETURN_ANSWER' attribute is used to determine whether answer should be taken or not.
            
            if (radioButton) {
                updateAnswer(td, tr);

                radioButton.onchange = function () {
                    if (currentSelectedRow) {
                        currentSelectedRow.setAttribute(RETURN_ANSWER, labelReturnsAnswerAttribute);
                        tr.setAttribute(RETURN_ANSWER, 'required');
                        currentSelectedRow = tr;
                    } else {
                        // 'else' clause is entered only once - the first time a value is selected.
                        currentSelectedRow = tr;
                        rows.forEach(function (tr) {
                            if (tr !== currentSelectedRow) {
                                tr.setAttribute(RETURN_ANSWER, 'none');
                            }
                        })
                    }
                }
            }
        });

        function updateAnswer(node, row) {
            var answerValue = node.getAttribute(ANSWER_ATTRIBUTE),
                response = new Response(questionId, answerValue, null),
                responseToString = JSON.stringify(response);
            responseToString = JSON.stringify(response);
            row.setAttribute(ANSWER_ATTRIBUTE, responseToString);
        }

        function restoreAnswer() {
            // TODO: Implement 'restoreAnswer'.
            throw new Error("'VerticalGroup renderer' 'restoreAnswer' method not implemented.");
        }

        return rows;
    }

    function dropDownRenderer(XMLDoc) {
        // 'this' - refers to the rendering object created in 
        // 'addRenderer' method in 'rendererFactory'.
        var doc = XMLDoc || this.XMLDoc, row,
            cellContent, returnsAnswerAttribute = 'required',
            dynamicTagName = 'column', incompleteRowTag, incompleteRowTagValue,
            questionObject = this.question, questionId = questionObject.ID,
            selectElements, labelContainer, currentSelectedOption,
            colSpanAdjust = 2; // As used in original dorpDown renderer

        selectElements = createSelectElements();

        incompleteRowTag = doc.getElementsByTagName('incomplete_row')[0];
        if (incompleteRowTag !== undefined) {
            incompleteRowTagValue = incompleteRowTag.getAttribute('value');

            if (incompleteRowTagValue !== 'end') {   // 'true' or 'false'                
                addFirstSelectElement(colSpanAdjust, questionId);
             
            } else {
                addLastSelectElement(questionId);              
            }
        }
        else {    
            addFirstSelectElement(XMLRendererFactory.QuestionerDataStorage.dataColumnCount,
                questionId);
        }

        selectElements.forEach(function (e) {
            e.onchange = updateAnswer;
        });        

        function addFirstSelectElement(colSpan, questionId) {
            row = createRow(selectElements, undefined,
                'select-cell', returnsAnswerAttribute);
            row.firstChild.setAttribute('colspan', colSpan);
            insertDynamicContents(doc, row, dynamicTagName);

            if (incompleteRowTagValue === 'start') {
                currentIncompleteRow = row;
            }
        }

        function addLastSelectElement() {
            appendCell(currentIncompleteRow, undefined, selectElements[0], 'select-cell cell');
            // The 'select' element is now last child.
            currentIncompleteRow.lastChild.setAttribute('colspan', colSpanAdjust);

            row = currentIncompleteRow;
        }

        function createSelectElements() {
            var dropDowns = doc.getElementsByTagName('control_values'),
                dropDownsCount = dropDowns.length, i = 0, j = 0, controls, controlsCount,
                selectContainer = [], selectElement, optionElement;

            for (; i < dropDownsCount; i += 1) {
                controls = dropDowns[i].getElementsByTagName('control_value');
                selectElement = document.createElement('select');
                selectElement.setAttribute('data-questionId', questionId);

                labelContainer = document.createElement('label');
                controlCount = controls.length;

                for (; j < controlCount; j += 1) {
                    optionElement = createOptionElement(controls[j]);
                    selectElement.add(optionElement);
                }

                if (dropDowns[i].getAttribute('label') !== null) {
                    // TODO: 'years' and 'months' populating
                }

                labelContainer.appendChild(selectElement);
                selectContainer.push(labelContainer);
            }

            return selectContainer;
        }

        function createOptionElement(columnElement) {
            var optionElement = document.createElement('option');            
            optionElement.setAttribute('value', columnElement.getAttribute('value'));
            optionElement.innerHTML = columnElement.getAttribute('display');

            return optionElement;
        }

        function updateAnswer(e) {
            var selectElement = e.target,
                selectedOption = selectElement.options[selectElement.selectedIndex],
                selectedOptionValue = selectedOption.value, innerText = selectedOption.innerText,
                dataOptionAttribute, dataAnswerAttribute, response,
                responses, newResponse, newResponseString,
                newResponsesString, responseObject, currentAnswer;

            if (selectedOptionValue !== '') {               
                currentAnswer = row.getAttribute(ANSWER_ATTRIBUTE);
                if (currentAnswer !== null) {
                    responses = JSON.parse(currentAnswer);
                    // will be array of 'response' objects
                    if (containsResponse(responses, questionId)) {
                        replaceResponse(responses, questionId);
                    } else {
                        addNewResponse(questionId);
                    }
                } else {
                    responses = [];
                    addNewResponse(questionId);
                }

                newResponsesString = JSON.stringify(responses);
                row.setAttribute(ANSWER_ATTRIBUTE, newResponsesString);
            } else {
                removeResponse(questionId);
            }

            function containsResponse(responses, questionId) {
                var contains = responses.some(function (res) {
                    return res.questionId === questionId;
                })

                return contains;
            };

            function replaceResponse(responses, questionId) {
                responses.forEach(function (res, index) {
                    if (res.questionId === questionId) {
                        responses[index] =
                            new Response(questionId, innerText,
                            parseAsNumberOrNull(selectedOptionValue));
                    }
                });
            };

            function addNewResponse(questionId) {
                newResponse = new Response(questionId, innerText,
                    parseAsNumberOrNull(selectedOptionValue));
                responses.push(newResponse);
            };

            function removeResponse(questionId) {
                var currentAnswer = row.getAttribute(ANSWER_ATTRIBUTE);
                var responses = JSON.parse(currentAnswer);

                if (responses.length > 1) {
                    responses.forEach(function (res, index, arr) {
                        if (res.questionId === questionId) {
                            arr.splice(index, 1);
                        }
                    });

                    newResponsesString = JSON.stringify(responses);
                    row.setAttribute(ANSWER_ATTRIBUTE, newResponsesString);
                } else {
                    row.removeAttribute(ANSWER_ATTRIBUTE);
                }
            }
        }

        function restoreAnswer() {
            var response = questionObject.Data.Response;
            var rValue = response && response.RValue;
            // TODO: finish implementing response answer
        };

        return row;
    }

    function dateRenderer(XMLDoc) {
        var doc = XMLDoc || this.XMLDoc, question = this.question, dynamicTagName = 'column',
            responseDateString = question.Data.Response && question.Data.Response.RValue, row,
            calendar = new Calendar(), responseDate, FORM_ID = 'calendar', DAY_SELECT_ID = 'day',
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

        row = createRow(form, undefined, '', returnsAnswerAttribute);
        row.firstChild.
            setAttribute('colspan', XMLRendererFactory.QuestionerDataStorage.dataColumnCount);
        insertDynamicContents(doc, row, dynamicTagName);

        // If question has 'Response'  and 'Response.RValue'
        if (responseDateString) {
            restoreAnswer(); // Should be called after 'row' is created.
        } else {
            // Will set the initial date.
            updateAnswer();
        }

        function restoreAnswer() {
            var day, month, year, responseDate = new Date(responseDateString);
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
            var date = '';
            date = calendar.year + '/' + calendar.month + '/' + calendar.day;
            row.setAttribute(ANSWER_ATTRIBUTE, new Response(question.ID, date, null));
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

    function datadropDownRenderer(XMLDoc) {
        var doc = XMLDoc || this.XMLDoc;
        throw new Error("Renderer not implemented.");
    };

    function cascadedropDownRenderer(XMLDoc) {
        var doc = XMLDoc || this.XMLDoc;
        throw new Error("Renderer not implemented.");
    };
    //#endregion

    // #region helper functions
    function createRow(columns, cellContent, cellClass, returnsAnswerAttribute) {
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
       
        if (returnsAnswerAttribute !== undefined) {
            row.setAttribute(RETURN_ANSWER, returnsAnswerAttribute);
        }
        

        return row;
    }

    function appendCell(row, cellContent, column, cellClass) {
        var cell = createCell(column, cellContent);
        cell.className = cellClass;
        row.appendChild(cell);
    }

    function createCell(column, cellContent) { 
        var possibleColumnNames = ['column', 'control_value'], cell = document.createElement('td'),
            element, displayAttrValue, columnValueAttr, dynamicAttribute;

        if (column.getAttribute !== undefined) {
            columnValueAttr = column.getAttribute('value');
            dynamicAttribute = column.getAttribute(Q_TEXT) || column.getAttribute(EXTERNAL_REF);

            if (columnValueAttr) {
                cell.setAttribute(ANSWER_ATTRIBUTE, columnValueAttr);
            }

            cell.setAttribute('colspan', column.getAttribute('columns') || 1);

            if (possibleColumnNames.indexOf(column.localName) < 0) {
                cell.appendChild(column);
            } else {
                if (cellContent !== undefined) {
                    parseCellContent(cell, cellContent);
                }
            }

            if (dynamicAttribute !== null) {
                //cell.innerText = dynamicAttribute;
                cell.innerHTML = dynamicAttribute;
            } else { // Insert display text at beginning of innerHTML         
                displayAttrValue = column.getAttribute('display');
                if (displayAttrValue !== null) {
                    cell.innerHTML = cell.innerHTML + displayAttrValue;
                }
            }
        } else { // simple text.
            cell.innerHTML = column;
            cell.setAttribute('colspan', 1);
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
            cell.className = (contentClass || '') + ' cell';

            addFirst(cell, contentHolder);
        }

        columnsAttributeValue = content.getAttribute('columns');
        if (columnsAttributeValue !== null) {
            cell.setAttribute('colspan', columnsAttributeValue);
        }
    };

    function parseAsNumberOrNull(obj) {
        var res = parseFloat(obj);         
        return obj - res >= 0 ? res : null; // Used code from jQuery.isNumeric
    }

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
    
    function createControlValueTag(columnDisplay, container) {
        var col = document.createElement('control_value');
        col.setAttribute('display', columnDisplay);
        col.setAttribute('colspan', 1);
        container.push(col);
    }

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

    var Response = function (id, rValue, rValueInt) {
        this.questionId = id;
        this.RValue = rValue;
        this.RValueInt = rValueInt;
    }

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

