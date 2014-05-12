/// <reference path="renderersConstants.js" />
/// <reference path="renderersCommonFunctions.js" />
/// <reference path="renderersCommonObjects.js" />
/// <reference path="jquery-2.1.0.min.js" />

var dropdownRenderers = (function () {
   var currentIncompleteRow,
       functions = renderersCommon.functions,
       objects = renderersCommon.objects,
       constants = renderersCommon.constants,
       yearSelectClass = 'years-select',
       monthSelectClass = 'months-select';


   function dropDownRenderer(XMLDoc, skipRestoringAnswer, skipAttachingChangeEventHandlers) {
        // 'this' - refers to the rendering object created in 
        // 'addRenderer' method in 'rendererFactory'.
        var doc = XMLDoc || this.XMLDoc, row,
            cellContent, returnsAnswerAttribute = 'required',
            responseArray = [],
            dynamicTagName = 'column', incompleteRowTag, incompleteRowTagValue,
            questionObject = this.question, questionId = questionObject.ID,
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
            addFirstSelectElement(objects.QuestionerDataStorage.dataColumnCount,
                questionId);
        }

        if (!skipRestoringAnswer) {
            restoreAllAnswers(selectElements);
        }

       // Arguments after  the function 'updateDropDownAnswer' are passed as arguments to it.
        if (!skipAttachingChangeEventHandlers) {
            functions.attachChangeEventHandlers(selectElements, updateDropDownAnswer,
            row, questionId, dropDownLabelAttribute);
        }
        

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

            if (answerArray.length > 0 ) {
                row.setAttribute(constants.ANSWER_ATTRIBUTE, JSON.stringify(answerArray));
            }
        }

        function restoreAnswer(selectElement, row) {
            var restoredOption, restoredResponse,
                response = questionObject.Data.Response,
                rValue = response && response.RValue,
                rValueInt = response && response.RValueInt,
                    monthsYearsObject;

            if (rValue !== null && response !== undefined) {
                if (functions.isMonthsYearsDropDownType(dropDownLabelAttribute)) { // Months years 
                    restoreMonthAndDate(selectElement, rValue);                    
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

            function restoreMonthAndDate(selectElement, monthsYearsValue) {
                var restoredResponse,
                    restoreObject = convertFromMonthsValue(monthsYearsValue);

                if (selectElement.className === yearSelectClass) {
                    selectElement.selectedIndex = restoreObject.years;
                } else if (selectElement.className === monthSelectClass) {
                    selectElement.selectedIndex = restoreObject.months;
                }
                if (restoreObject.restoreValue) {
                    restoredResponse = new objects.Response(questionId, restoreObject.restoreValue, rValueInt);
                }

                if (restoredResponse !== undefined && responseArray.length === 0) {
                    responseArray.push(restoredResponse);
                }
            }
        };

        return row;
    }

    function datadropDownRenderer(XMLDoc, skipRrestoringAnswer, skipAttachingChangeEventHandlers) {
        var doc = XMLDoc || this.XMLDoc,
            controlValueContainingTag = document.createElement('control_values'),
            dynamicData = this.question.DynamicData,
            emptyOtion;

        functions.insertDynamicDataControlTags(controlValueContainingTag, dynamicData);

        doc.firstChild.appendChild(controlValueContainingTag);
        return dropDownRenderer.call(this, doc, skipRrestoringAnswer, skipAttachingChangeEventHandlers);
    };

    function cascadedropDownRenderer(XMLDoc) {
        var questionId = this.question.ID,
            doc = XMLDoc || this.XMLDoc,
            self = this,
            skipDropdownRendererAnswerRestore = true,
            skipAttachingChangeEventHandlers = true,
            row = datadropDownRenderer.call(this, doc, skipDropdownRendererAnswerRestore, skipAttachingChangeEventHandlers),
            selectElement = row.getElementsByTagName('select')[0],
            containingTableCell = selectElement.parentElement.parentElement,
            // array of 'DynamicData' objects(properties)
            cascadeDropdownsDataArray =
            Array.prototype.push.apply(['--- Select Option ---'], this.question.CascadingDynamicData);

        selectElement.onchange = updateAnswer;

        restoreAnswer(selectElement);

        return row;       

        function updateAnswer(e) {
            var selectElement = e.target,
                selectedOptionIndex = selectElement.selectedIndex,
                selectedOption = selectElement.options[selectedOptionIndex],
                rValue = selectedOption.innerText,
                rValueInt = selectedOption.value,
                answer;

            if (selectElement.selectedIndex > 0) {

                createCascadeDynamicDropdown(selectedOptionIndex, containingTableCell, questionId);

                answer = new objects.Response(questionId, rValue, rValueInt);
                row.setAttribute(constants.ANSWER_ATTRIBUTE, JSON.stringify(answer));
            } else {
                // removeAnswer
                row.removeAttribute(constants.ANSWER_ATTRIBUTE);

                if (containingTableCell.childNodes.length > 1) {
                    // remove dynamic dropdown if present
                    containingTableCell.
                        removeChild(containingTableCell.lastChild);
                }
            }
        }
        
        function containsDynamicResponse() {
            // the dynamic dropdown has its value set.
            var answers = JSON.parse(row.getAttribute(constants.ANSWER_ATTRIBUTE));
            // 'answers' might not be defined at all.
            return answers && answers.length > 1;
        }
        
        function restoreAnswer(selectElement) {
            var restoredResponse = self.question.Data.Response,
                firstAnswer,
                firstAnswerIndex,
                classType,
                httpClient = new objects.DropdownHttpClient(constants.baseUrl),
                url;
            
            //getAllDynamicData().
            //    then(getDropdownAndDynamicDropdownIndeces).
            //    then(setRootDropdownSelectedOption).
            //    then(setDynamicDropdownSelectedOption).
            //    then(setRowAnswerAttribute);


            // TODO: Remove promise wrapper.
            getDropdownAndDynamicDropdownIndeces().
                then(setDynamicDropdownSelectedOption).
                then(setRootDropdownSelectedOption).
                then(setRowAnswerAttribute);
                    
            //function getAllDynamicData() {
            //    return $.when(httpClient.getAuthenticationToken()).done(function (data) {
            //        var token = data.Token;
            //        localStorage.setItem('AuthorizationCookie', token);

            //        $.when(constants.forEach.call(selectElement.childNodes, function (currentOption, index) {
            //            classType = currentOption.value;
            //            if (classType) { // first option has no value  - '---Select Option---'

            //                url = httpClient.getClassTypeUrl(self.question.Data.DisplayDefinition, classType);

            //                httpClient.getDynamicCascadeDropdown(url, token, questionId).
            //                    then(function (dynamicData) {
            //                        cascadeDropdownsDataArray.push(dynamicData);
            //                    });
            //            }
            //        }));
            //    });
            //}

            function getDropdownAndDynamicDropdownIndeces() {
                var index = cascadeDropdownsDataArray.length,
                    dropDownSelectedOptionIndex,
                    dynamicDropDownSelectedOptionIndex = 0,
                    rootSelectChildren = selectElement.childNodes,
                    responseIndex;

                if (restoredResponse !== null) {
                    while (index--) {
                            responseIndex =
                            getDynamicDataResponseIndex(cascadeDropdownsDataArray[index], restoredResponse);

                        if (responseIndex > 0) {
                            dynamicDropDownSelectedOptionIndex = responseIndex;
                            dropDownSelectedOptionIndex = index;
                            break;
                        }
                    }

                    // the response is not found in dynamicDropdown so it is in the root dropdown.
                    if (index === -1) {
                        index = rootSelectChildren.length;

                        while (index--) {
                            if (rootSelectChildren[index].value === restoredResponse.RValueInt) {
                                dropDownSelectedOptionIndex = index;
                                break;
                            }
                        }
                    }                   
                }

                return $.when({
                    dropDownSelectedOptionIndex: dropDownSelectedOptionIndex,
                    dynamicDropDownSelectedOptionIndex: dynamicDropDownSelectedOptionIndex
                    });
            }

            function setRootDropdownSelectedOption(indecesContainer) {
                var dropDownSelectedOptionIndex = indecesContainer.dropDownSelectedOptionIndex;

                selectElement.selectedIndex = dropDownSelectedOptionIndex;
                return $.when(indecesContainer);
            }

            function setDynamicDropdownSelectedOption(indecesContainer) {
                var dropDownSelectedOptionIndex = indecesContainer.dropDownSelectedOptionIndex,
                    dynamicDropDownSelectedOptionIndex =
                    indecesContainer.dynamicDropDownSelectedOptionIndex,
                    skipCreatingCascadeDropDown = true,
                    labelContainer,
                    dynamicSelectElement;

                if (dropDownSelectedOptionIndex > 0) {
                    labelContainer = createCascadeDynamicDropdown(dropDownSelectedOptionIndex,
                    containingTableCell, questionId);
                    dynamicSelectElement = labelContainer.firstChild;
                    dynamicSelectElement.selectedIndex = dynamicDropDownSelectedOptionIndex;
                }
              
                return $.when();
            }

            function getDynamicDataResponseIndex(dynamicData, restoredResponse) {
                var index = functions.findLastIndex(dynamicData, restoredResponse,
                    function (keyValuePair, response) {
                        return keyValuePair.Key === response.RValueInt &&
                            keyValuePair.Value === response.RValue;
                    });

                return index;
            }

            function setRowAnswerAttribute() {
                if (restoredResponse !== null) {                    
                    row.setAttribute(constants.ANSWER_ATTRIBUTE, JSON.stringify(restoredResponse));
                }
            }
        }

        function createCascadeDynamicDropdown(selectedOptionIndex, containingTableCell, questionId) {
            var dynamicData = cascadeDropdownsDataArray[selectedOptionIndex],
                labelContainer =
                functions.insertDynamicSelect(dynamicData, containingTableCell, questionId);

            functions.attachChangeEventHandlers(labelContainer,
                function (e, args) {
                    var dynamicSelectElement = e.target,
                        row = args[0],
                        questionId = args[1],
                        selectedOptionIndex = dynamicSelectElement.selectedIndex,
                        selectedOption = dynamicSelectElement[selectedOptionIndex],
                        rValue = selectedOption.innerText,
                        rValueInt = selectedOption.value,
                        answer;

                    if (selectedOptionIndex === 0) {
                        selectedOption = selectElement[selectElement.selectedIndex];
                        rValue = selectedOption.innerText;
                        rValueInt = selectedOption.value;
                    } 

                    answer = new objects.Response(questionId, rValue, rValueInt);
                    row.setAttribute(constants.ANSWER_ATTRIBUTE, JSON.stringify(answer));
                }, row, questionId);

            return labelContainer;
        }
    }

    //#region common dropdown functions
    function updateDropDownAnswer(e, args) {
        var selectElement = e.target,
            selectedOption = selectElement.options[selectElement.selectedIndex],
            selectedOptionValue = selectedOption.value,
            selectedOptionInnerText = selectedOption.innerText,
            responseObject, 
            row = args[0],
            questionId = args[1],
            dropDownLabelAttribute = args[2],
            containsAnswerFunc = args[3];

        updateAnswerAttribute(row, selectedOptionValue, selectedOptionInnerText,
            questionId, dropDownLabelAttribute, containsAnswerFunc);
    }

    // updates constants.ANSWER_ATTRIBUTE in the row by adding or removing responses 
    function updateAnswerAttribute(row, selectedOptionValue, selectedOptionInnerText,
        questionId, dropDownLabelAttribute, containsAnswerFunc) {
        if (selectedOptionValue !== '') {
            setNonEmptySelectedOptionAnswer(row, selectedOptionValue, selectedOptionInnerText,
                questionId, dropDownLabelAttribute, containsAnswerFunc);
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
                replaceResponse(row, responses, selectedOptionValue,
                    selectedOptionInnerText, questionId, dropDownLabelAttribute);
                if (responses[0].RValue === 0) {
                    responses = removeResponse(row, questionId);
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
        selectedOptionInnerText, questionId, dropDownLabelAttribute, containsAnswerFunc) {
        var currentAnswer = row.getAttribute(constants.ANSWER_ATTRIBUTE),
            responses,
            newResponsesString,
            containsResponseResult;
        if (currentAnswer !== null) {
            // will be array of 'response' objects
            responses = JSON.parse(currentAnswer);
            
            // If there is 'responseAnswerFunc' - test with it else test with 'containsResponse'
            containsResponseResult = (containsAnswerFunc && containsAnswerFunc()) ||
               (!containsAnswerFunc && containsResponse(responses, questionId));

            if (containsResponseResult) {
                replaceResponse(row, responses, selectedOptionValue,
                    selectedOptionInnerText, questionId, dropDownLabelAttribute);
            } else {
                addNewResponse(row, responses, selectedOptionValue,
                    selectedOptionInnerText, questionId, dropDownLabelAttribute);
            }
        } else {
            responses = [];
            addNewResponse(row, responses, selectedOptionValue,
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

    function replaceResponse(row, responses, selectedOptionValue,
        selectedOptionInnerText, questionId, dropDownLabelAttribute) {
        var rValue, answerIndex;
        if (functions.isMonthsYearsDropDownType(dropDownLabelAttribute)) {
            rValue = convertToMonthsValue(row);
        } else {
            rValue = selectedOptionInnerText;
        }
        
        answerIndex = functions.findLastIndex(responses, questionId, 
            function (currentResponse, searchedQuestionId) {
                return currentResponse.questionId === searchedQuestionId;
            });

        if (answerIndex > -1) {
            responses[answerIndex] = new objects.Response(questionId, rValue,
                    selectedOptionValue);
        }        
    };

    function addNewResponse(row, responses, selectedOptionValue,
        selectedOptionInnerText, questionId, dropDownLabelAttribute) {
        var newResponse, rValue;

        if (functions.isMonthsYearsDropDownType(dropDownLabelAttribute)) {
            rValue = convertToMonthsValue(row);

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

    // Whole part is years count, decimal part is months / 12.
    // Exmaple: 5.3333333 - years:3, months: 4
    function convertToMonthsValue(row) {
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
        months = Math.round(((monthsValue - parseInt(monthsValue)) * 12));
        years = Math.floor((monthsValue));

        return {
            years: years,
            months: months,
            restoreValue: monthsValue
        }
    }
    //#endregion

    return {
        dropDownRenderer: dropDownRenderer,
        datadropDownRenderer: datadropDownRenderer,
        cascadedropDownRenderer: cascadedropDownRenderer
    }
})();