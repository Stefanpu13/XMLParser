/// <reference path="RenderersCommonObjects.js" />
/// <reference path="renderersCommonFunctions.js" />
var dropdownRenderers = (function () {
   var currentIncompleteRow,
       functions = renderersCommon.functions,
       objects = renderersCommon.objects,
       constants = renderersCommon.constants;


    function dropDownRenderer(XMLDoc) {
        // 'this' - refers to the rendering object created in 
        // 'addRenderer' method in 'rendererFactory'.
        var doc = XMLDoc || this.XMLDoc, row,
            cellContent, returnsAnswerAttribute = 'required',
            responseArray = [],
            dynamicTagName = 'column', incompleteRowTag, incompleteRowTagValue,
            questionObject = this.question, questionId = questionObject.ID,
            yearSelectClass = 'years-select', monthSelectClass = 'months-select',
            selectElements, currentSelectedOption,
            dropDownLabelAttribute,
            createSelectElementsResult,
            colSpanAdjust = 2; // As used in original dorpDown renderer

        createSelectElementsResult =
            createSelectElements(doc, yearSelectClass, monthSelectClass);

        selectElements = createSelectElementsResult.selectContainer;
        dropDownLabelAttribute = createSelectElementsResult.dropDownLabelAttribute;

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

        restoreAllAnswers(selectElements);

        // Arguments after  the function 'updateDropDownAnswer' are passed as arguments to it.
        functions.attachChangeEventHandlers(selectElements, updateDropDownAnswer,
            row, questionId, dropDownLabelAttribute);

        function addFirstSelectElement(colSpan, questionId) {
            row = functions.createRow(selectElements, undefined,
                'select-cell', returnsAnswerAttribute);
            row.firstChild.setAttribute('colspan', colSpan);
            functions.insertDynamicContents(doc, row, dynamicTagName);

            if (incompleteRowTagValue === 'start') {
                currentIncompleteRow = row;
            }
        }

        function addLastSelectElement() {
            functions.appendCell(currentIncompleteRow, undefined, selectElements[0], 'select-cell cell');
            // The 'select' element is now last child.
            currentIncompleteRow.lastChild.setAttribute('colspan', colSpanAdjust);
            row = currentIncompleteRow;
        }

        function createSelectElements(doc, yearSelectClass, monthSelectClass) {
            var dropDowns = doc.getElementsByTagName('control_values'),
                dropDownsCount = dropDowns.length,
                i = 0,
                selectContainer = [],
                createSelectElementResult,
                labelContainer,
                dropDownLabelAttribute;

            for (; i < dropDownsCount; i += 1) {
                createSelectElementResult = functions.createSelectElement(dropDowns[i], questionId,
                     yearSelectClass, monthSelectClass);
                labelContainer = createSelectElementResult.labelContainer;
                dropDownLabelAttribute = createSelectElementResult.dropDownLabelAttribute;
                selectContainer.push(labelContainer);
            }

            return {
                selectContainer: selectContainer,
                dropDownLabelAttribute: dropDownLabelAttribute
            };
        }

        function restoreAllAnswers(selectElements) {
            selectElements.forEach(function (label) {
                var selectElem = label.lastChild;

                restoreAnswer(selectElem, row, dropDownLabelAttribute);
            });

            // Variant for two dropdowns on same row - questioner 3371
            var answerArray = JSON.parse(row.getAttribute(constants.ANSWER_ATTRIBUTE)) || [];
            answerArray.push.apply(answerArray, responseArray);
            row.setAttribute(constants.ANSWER_ATTRIBUTE, JSON.stringify(answerArray));
        }

        function restoreAnswer(selectElement, row) {
            var restoredOption, restoredResponse,
                response = questionObject.Data.Response,
                rValue = response && response.RValue,
                rValueInt = response && response.RValueInt,
                    monthsYearsObject;

            if (rValue !== null && response !== undefined) {
                if (functions.isMonthsYearsDropDownType(dropDownLabelAttribute)) { // Months years                   
                    monthsYearsObject = convertFromMonthsValue(rValue);
                    restoredResponse = restoreMonthAndDate(selectElement, monthsYearsObject);
                    if (restoredResponse !== undefined) {
                        responseArray.push(restoredResponse);
                    }
                } else {
                    if (rValueInt !== null) {
                        constants.forEach.call(selectElement.childNodes, function (optionElement, index) {
                            if (optionElement.getAttribute('value') == rValueInt) { // Compare string to int or int to int
                                selectElement.selectedIndex = index;
                                restoredOption = optionElement;
                            }
                        });
                    } else {
                        constants.forEach.call(selectElement.childNodes, function (optionElement, index) {
                            if (optionElement.innerHTML === rValue) {
                                selectElement.selectedIndex = index;
                                restoredOption = optionElement;
                            }
                        });
                    }

                    restoredResponse = new objects.Response(questionObject.ID, restoredOption.innerHTML, rValueInt);
                    responseArray.push(restoredResponse);
                }
            }

            function restoreMonthAndDate(selectElement, restoreObject) {
                var restoredResponse;
                if (selectElement.className === yearSelectClass) {
                    selectElement.selectedIndex = restoreObject.years;
                } else if (selectElement.className === monthSelectClass) {
                    selectElement.selectedIndex = restoreObject.months;
                }
                if (restoreObject.restoreValue) {
                    restoredResponse = new objects.Response(questionId, restoreObject.restoreValue, rValueInt);
                }

                return restoredResponse;
            }
        };

        // Whole part is years count, decimal part is months / 12.
        // Exmaple: 5.3333333 - years:3, months: 4
        function convertToMonthsValue() {
            var result;
            month =
                     Number(row.getElementsByClassName(monthSelectClass)[0].value);
            year =
               Number(row.getElementsByClassName(yearSelectClass)[0].value);
            result = year + month / 12;
            return result;
        }

        // Whole part is years count, decimal part is months / 12.
        // Exmaple: 5.3333333 - years:3, months: 4
        function convertFromMonthsValue(rValue) {
            var months, years, monthsValue;

            monthsValue = Number(rValue);
            months = parseInt(((monthsValue - parseInt(monthsValue)) * 12));
            years = Math.floor((monthsValue));

            return {
                years: years,
                months: months,
                restoreValue: monthsValue
            }
        }

        return row;
    }

    function datadropDownRenderer(XMLDoc) {
        var doc = XMLDoc || this.XMLDoc,
            controlValueContainingTag = document.createElement('control_values'),
            dynamicData = this.question.DynamicData,
            emptyOtion;

        functions.insertDynamicDataControlTags(controlValueContainingTag, dynamicData);

        doc.firstChild.appendChild(controlValueContainingTag);
        return dropDownRenderer.call(this, doc);
    };

    function cascadedropDownRenderer(XMLDoc) {
        var questionId = this.question.ID,
            doc = XMLDoc || this.XMLDoc,
            self = this,
            row = datadropDownRenderer.call(this, doc),
            selectElement = row.getElementsByTagName('select')[0],
            selectElementContainingTableCell = selectElement.parentElement.parentElement;

        // When the visible select element is changed two things(events) happen
        // 1. The option and answer is updated
        // 2. Dynamic DDL is requested, displayed/removed, and answer is again updated.
        // The two events should be fired in particular order.

        selectElement.onchange = function (e) {
            var answers = JSON.parse(row.getAttribute(constants.ANSWER_ATTRIBUTE)),
                currentAnswer,
                classType,
                httpClient,
                url;

            if (answers) {
                answers.forEach(function (a) {
                    if (a.questionId === self.question.ID) {
                        currentAnswer = a;
                        return;
                    }
                });
                classType = currentAnswer.RValueInt;

                httpClient = new objects.DropdownHttpClient('http://localhost:61008/api/');
                url =
                httpClient.getClassTypeUrl(self.question.Data.DisplayDefinition, classType);

                // create defered object - this is for testing purposes
                $.when(httpClient.getAuthenticationToken()).
                    then(function (data) {
                        httpClient.
                            getDynamicCascadeDropdown(url, data.Token).
                            success(function (dynamicData) {
                                var containingLabel = functions.insertDynamicSelect(dynamicData,
                                      selectElementContainingTableCell, questionId),
                                    selectElementsArray = [containingLabel];

                                functions.
                                    attachChangeEventHandlers(selectElementsArray,
                                    updateDropDownAnswer, row, questionId)
                            });
                    });

                //#region deploy variant
            } else {
                selectElementContainingTableCell.
                    removeChild(selectElementContainingTableCell.lastChild);
            }
        }

        return row;
    };


    //#region common dropdown functions
    function updateDropDownAnswer(e, args) {
        var selectElement = e.target,
            selectedOption = selectElement.options[selectElement.selectedIndex],
            selectedOptionValue = selectedOption.value,
            selectedOptionInnerText = selectedOption.innerText,
            responseObject, 
            row = args[0],
            questionId = args[1],
            dropDownLabelAttribute = args[2];

        updateAnswerAttribute(row, selectedOptionValue,
            selectedOptionInnerText, questionId, dropDownLabelAttribute);
    }

    // updates constants.ANSWER_ATTRIBUTE in the row by adding or removing responses 
    function updateAnswerAttribute(row, selectedOptionValue,
        selectedOptionInnerText, questionId, dropDownLabelAttribute) {
        if (selectedOptionValue !== '') {
            setNonEmptySelectedOptionAnswer(row, selectedOptionValue,
                selectedOptionInnerText, questionId, dropDownLabelAttribute);
        } else {
            setEmptySelectedOptionAnswer(row, selectedOptionValue,
                selectedOptionInnerText, questionId, dropDownLabelAttribute);
        }
    }

    // If drop down is "Years: Months" then null value choise of "years" or 'months'
    // does should not remove the answer if other option is not null
    function setEmptySelectedOptionAnswer(row, selectedOptionValue,
        selectedOptionInnerText, questionId, dropDownLabelAttribute) {
        var currentAnswer,
            newResponsesString,
            responses = [];
        if (functions.isMonthsYearsDropDownType(dropDownLabelAttribute)) {
            currentAnswer = row.getAttribute(constants.ANSWER_ATTRIBUTE);

            if (currentAnswer !== null) {
                responses = JSON.parse(currentAnswer);
                replaceResponse(responses, selectedOptionValue,
                    selectedOptionInnerText, questionId, dropDownLabelAttribute);
                if (responses[0].RValue === 0) {
                    responses = removeResponse(questionId);
                } else {
                    newResponsesString = JSON.stringify(responses);
                    row.setAttribute(constants.ANSWER_ATTRIBUTE, newResponsesString);
                }
            }
        } else {
            responses = removeResponse(row, questionId);
        }
    }

    function setNonEmptySelectedOptionAnswer(row, selectedOptionValue,
        selectedOptionInnerText, questionId, dropDownLabelAttribute) {
        var currentAnswer = row.getAttribute(constants.ANSWER_ATTRIBUTE),
            responses,
            newResponsesString;
        if (currentAnswer !== null) {
            responses = JSON.parse(currentAnswer);
            // will be array of 'response' objects
            if (containsResponse(responses, questionId)) {
                replaceResponse(responses, selectedOptionValue,
                    selectedOptionInnerText, questionId, dropDownLabelAttribute);
            } else {
                addNewResponse(responses, selectedOptionValue,
                    selectedOptionInnerText, questionId, dropDownLabelAttribute);
            }
        } else {
            responses = [];
            addNewResponse(responses, selectedOptionValue,
                selectedOptionInnerText, questionId, dropDownLabelAttribute);
        }

        newResponsesString = JSON.stringify(responses);
        row.setAttribute(constants.ANSWER_ATTRIBUTE, newResponsesString);
    }

    function containsResponse(responses, questionId) {
        var contains = responses.some(function (res) {
            return res.questionId === questionId;
        })

        return contains;
    };

    function replaceResponse(responses, selectedOptionValue,
        selectedOptionInnerText, questionId, dropDownLabelAttribute) {
        var rValue;
        if (functions.isMonthsYearsDropDownType(dropDownLabelAttribute)) {
            rValue = convertToMonthsValue();
        } else {
            rValue = selectedOptionInnerText;
        }

        responses.forEach(function (res, index) {
            if (res.questionId === questionId) {
                responses[index] =
                    new objects.Response(questionId, rValue,
                    selectedOptionValue);
            }
        });
    };

    function addNewResponse(responses, selectedOptionValue,
        selectedOptionInnerText, questionId, dropDownLabelAttribute) {
        var newResponse, rValue;

        if (functions.isMonthsYearsDropDownType(dropDownLabelAttribute)) {
            rValue = convertToMonthsValue();

        } else {
            rValue = selectedOptionInnerText;
        }

        newResponse = new objects.Response(questionId, rValue,
            selectedOptionValue);
        responses.push(newResponse);
    };

    function removeResponse(row, questionId) {
        var newResponsesString,
            currentAnswer = row.getAttribute(constants.ANSWER_ATTRIBUTE),
            responses = JSON.parse(currentAnswer), 
                answerIndex;

        if (responses.length > 1) {
            answerIndex = functions.findLastIndex(responses, questionId,
                function (currentResponse, searchedQuestionId) {
                    return currentResponse.questionId === searchedQuestionId;
                });

            if (answerIndex>= 0) {
                responses.splice(answerIndex, 1);
            }
      
            newResponsesString = JSON.stringify(responses);
            row.setAttribute(constants.ANSWER_ATTRIBUTE, newResponsesString);
        } else {
            row.removeAttribute(constants.ANSWER_ATTRIBUTE);
        }

        return responses;
    }
    //#endregion

    return {
        dropDownRenderer: dropDownRenderer,
        datadropDownRenderer: datadropDownRenderer,
        cascadedropDownRenderer: cascadedropDownRenderer
    }
})();