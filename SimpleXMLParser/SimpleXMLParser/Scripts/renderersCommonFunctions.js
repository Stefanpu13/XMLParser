var renderersCommon = renderersCommon || {}; // namespace declaration in different classes
renderersCommon.functions = (function () {
    var objects = renderersCommon.objects,
        constants = renderersCommon.constants;

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

        if (returnsAnswerAttribute) { // not null, undefined, false
            row.setAttribute(constants.RETURN_ANSWER, returnsAnswerAttribute);
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
            dynamicAttribute = column.getAttribute(constants.Q_TEXT) || column.getAttribute(constants.EXTERNAL_REF);

            if (columnValueAttr) {
                cell.setAttribute(constants.ANSWER_ATTRIBUTE, columnValueAttr);
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

        if (content.getAttribute('display').indexOf(constants.Q_TEXT) >= 0 ||
            content.getAttribute('display').indexOf(constants.EXTERNAL_REF) >= 0) {
            cell = createCell(content);
            cell.className = (contentClass || '') + ' cell';

            addFirst(cell, contentHolder);
        }

        columnsAttributeValue = content.getAttribute('columns');
        if (columnsAttributeValue !== null) {
            cell.setAttribute('colspan', columnsAttributeValue);
        }
    };

    function insertDynamicSelect(dynamicData, selectElementContainingTableCell, questionId) {
        var controlValueContainingTag = document.createElement('control_values'),
            labelContainer;

        insertDynamicDataControlTags(controlValueContainingTag, dynamicData);
        labelContainer =
            createSelectElement(controlValueContainingTag, questionId,
             "", "", constants.DYNAMIC_SELECT_CLASS_NAME).labelContainer;

        // If there is already dynamic select element - remove it.
        if (selectElementContainingTableCell.lastChild !== selectElementContainingTableCell.firstChild) {
            selectElementContainingTableCell.
                removeChild(selectElementContainingTableCell.lastChild);
        }

        selectElementContainingTableCell.appendChild(labelContainer);

        return labelContainer;
    }

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

    function createControlValueTag(controlValue, columnDisplay) {
        var col = document.createElement('control_value'),
            value =
            (controlValue.getAttribute && controlValue.getAttribute('value')) ||
            controlValue;

        col.setAttribute('display', columnDisplay);
        col.setAttribute('value', value);
        col.setAttribute('colspan', 1);

        return col;
    }

    function attachUpdateAnswer(node, row, question) {
        var radioButtons = node.getElementsByTagName('input');
        if (radioButtons.length >= 0) {
            constants.forEach.call(radioButtons, function (radioButton) {
                radioButton.addEventListener('change', function () {
                    var td = radioButton.parentNode.parentNode; // 'input' is in 'label', which is in 'td'.
                    updateAnswer(td, row, question);
                });
            });
        }
    }

    function attachRowFunctionality(row, innerTable, question) {
        answers = (innerTable && innerTable.childNodes) || row.childNodes;

        constants.forEach.call(answers, function (node) {
            attachUpdateAnswer(node, row, question);
        });

        restoreAnswer(row, answers, question);
    }

    function attachChangeEventHandlers(selectElements, handlerFunction) {
        var args = arguments;

        selectElements.forEach(function (label) {
            var selectElem = label.lastChild,                
                // arguments to 'handlerFunction' are passed to 'attachChangeEventHandlers'
                argsArray = Array.prototype.slice.call(args, 2);
            selectElem.addEventListener('change', function (e) {
                //updateDropDownAnswer(e);
                handlerFunction(e, argsArray);
            });
        });
    }

    function updateAnswer(node, row, question) {
        var answerValue = node.getAttribute(constants.ANSWER_ATTRIBUTE), responseArray = [],
            response = new objects.Response(question.ID, answerValue, null);
        responseArray.push(response);

        responseToString = JSON.stringify(responseArray);
        row.setAttribute(constants.ANSWER_ATTRIBUTE, responseToString);
    }

    function restoreAnswer(row, childNodes, question) {
        // If response != null
        var response = question.Data.Response, rValue;

        if (response !== null) {
            rValue = response.RValue;

            constants.forEach.call(childNodes, function (node) {
                var radioButtons = node.getElementsByTagName('input');
                if (radioButtons.length >= 0) {
                    constants.forEach.call(radioButtons, function (radioButton) {
                        var td = radioButton.parentNode.parentNode,
                            dataAnswerValue = td.getAttribute(constants.ANSWER_ATTRIBUTE);

                        if (dataAnswerValue === response.RValue) {
                            radioButton.setAttribute('checked', 'checked');
                            updateAnswer(td, row, question);
                        }

                    });
                }

            });
        }
    }

    function findLastIndex(array,comparedValue,  predicateFunction) {
        var length = array.length,
            i = length - 1;

        for (; i>=0; i--) {
            if (predicateFunction(array[i], comparedValue)) {
                return i;
            }
        }

        return -1;
    }

    // #region dropdown renderers helper functions
    function createSelectElement(dropDown, questionId, yearSelectClass, monthSelectClass, selectClassName) {
        var optionElement,
            i = 0,
            labelContainer = document.createElement('label'),
            controls = dropDown.getElementsByTagName('control_value'),
            controlCount = controls.length,
            selectElement = document.createElement('select'),
            dropDownLabelAttribute = dropDown.getAttribute('label');

        selectElement.setAttribute('data-questionId', questionId);
        selectElement.className = selectClassName || '';

        if (isMonthsYearsDropDownType(dropDownLabelAttribute)) {
            populateSelectElementRange(dropDown, selectElement, dropDownLabelAttribute, yearSelectClass, monthSelectClass);
            labelContainer.innerHTML = dropDownLabelAttribute;
        } else {
            for (; i < controlCount; i += 1) {
                optionElement = createOptionElement(controls[i]);
                selectElement.add(optionElement);
            }
        }

        labelContainer.appendChild(selectElement);

        return {
            labelContainer: labelContainer,
            dropDownLabelAttribute: dropDownLabelAttribute
        };
    }

    function populateSelectElementRange(controlValuesTag, selectElement, dropDownLabelAttribute, yearSelectClass, monthSelectClass) {
        var controlValueRange =
            controlValuesTag.getElementsByTagName('control_value_range')[0],
            min = Number(controlValueRange.getAttribute('min')),
            max = controlValueRange.getAttribute('max'),
            step = Number(controlValueRange.getAttribute('step') || 1),
            optionElement,
            selectElementClass = dropDownLabelAttribute.indexOf('Year') >= 0 ?
            yearSelectClass : monthSelectClass;

        max =
            max === 'CURRENT_YEAR' ? new Date().getFullYear : Number(max);

        if (step > 0) {
            for (var i = min; i <= max; i += step) {
                optionElement = createOptionElement(undefined, i, i);
                selectElement.appendChild(optionElement);
            }
        } else {
            for (var i = max; i <= min; i += step) {
                optionElement = createOptionElement(undefined, i, i);
                selectElement.appendChild(optionElement);
            }
        }

        selectElement.className = selectElementClass;
    }

    function createOptionElement(columnElement, elemValue, elemInnerHTML) {
        var value = (columnElement && columnElement.getAttribute('value')) || elemValue || "",
            innerHTML = (columnElement && columnElement.getAttribute('display')) || elemInnerHTML || "";

        var optionElement = document.createElement('option');
        optionElement.setAttribute('value', value);
        optionElement.innerHTML = innerHTML;

        return optionElement;
    }

    function insertDynamicDataControlTags(controlValueContainingTag, dynamicData) {
        emptyOtion = createControlValueTag('', '--Select Option--');
        controlValueContainingTag.appendChild(emptyOtion);

        dynamicData.forEach(function (keyValuePair) {
            var controlValueTag = createControlValueTag(keyValuePair.Key, keyValuePair.Value);
            controlValueContainingTag.appendChild(controlValueTag);
        });
    }

    // A special type of drop down menu -
    // two menus that correspond to single question and row.
    // See questionary 4993.
    function isMonthsYearsDropDownType(dropDownLabelAttribute) {
        return dropDownLabelAttribute !== null && dropDownLabelAttribute !== undefined;
    }
    // #endregion

    return {
        createRow: createRow,
        appendCell: appendCell,                 
        insertDynamicContents: insertDynamicContents,
        insertDynamicSelect:insertDynamicSelect,
        createControlValueTag: createControlValueTag,        
        attachRowFunctionality: attachRowFunctionality,
        attachChangeEventHandlers:attachChangeEventHandlers,
        createSelectElement: createSelectElement,        
        createOptionElement: createOptionElement,        
        insertDynamicDataControlTags: insertDynamicDataControlTags,
        isMonthsYearsDropDownType: isMonthsYearsDropDownType,
        findLastIndex: findLastIndex
    }
})();