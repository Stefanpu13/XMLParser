/// <reference path="rendererFactory.js" />
/// <reference path="jquery-2.1.0.min.js" />
function initializeRenderers() {    
    var DISPLAY_TYPE_SCALE = "scale",
        DISPLAY_TYPE_LABEL = "label",
        DISPLAY_TYPE_TEXT = "text",
        DISPLAY_TYPE_RADIO = "radio_group",
        DISPLAY_VERTICAL_GROUP = "vertical_group",
        DISPLAY_TYPE_DROPDOWN = "drop_box",
        DISPLAY_TYPE_DATE = "date",    
        DISPLAY_TYPE_DATADROPDOWN = "data_dropdown",
        DISPLAY_TYPE_CASCADEDROPDOWN = "cascade_dropdown",
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

    // #region radio renderer with div - not finished
    //function radioGroupRenderer(XMLDoc) {
    //    var doc = this.XMLDoc || XMLDoc,
    //        container, row, cell, lines, columns, linesCount, columnsCount, i = 0, j = 0;

    //    container = document.createElement('div');
    //    container.setAttribute('class', 'radio-contanier');
    //    lines = doc.getElementsByTagName('line');
    //    linesCount = lines.length;

    //    for (; i < linesCount; i++) {
    //        columns = lines[i].getElementsByTagName('column');
    //        columnsCount = columns.length;
    //        row = document.createElement('div');

    //        for (j = 0; j < columnsCount; j++) {
    //            createCell(columns[j]);
    //            row.appendChild(cell);
    //        }

    //        container.appendChild(row);
    //    }

    //    function createCell(column) {
    //        cell = document.createElement('div');
    //        cell.setAttribute('class', 'scale');
    //        cell.innerText = column.getAttribute('display');
    //        cell.setAttribute(VALUE_ATTRIBUTE, column.getAttribute('value'));
    //    }

    //    return container;
    //}
    // #endregion

    // #region radio renderer with tr
    function radioGroupRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc, rows = [], controlValues, controlValue,
        row, cellContent, lines, controlValuesCount, i = 0, radioCellClass ='radio-cell', 
        labelPattrernClass= 'label-cell';

        lines = doc.getElementsByTagName('line');
        if (lines.length) {
            var scales = scaleRenderer(doc);
            // add 'scales' array to rows array.
            rows.push.apply(rows, scales);
        }
       
        row = document.createElement('tr');
        controlValues = doc.getElementsByTagName('control_value');
        cellContent = { elementType: 'input', attributes: [{ name: 'type', value: 'radio' }] };        
        row = createRow(controlValues, cellContent, radioCellClass);
        //Insert cells for %%ExternalRef%% and %%QText%%       
        insertCells(row, ['%%ExternalRef%%', '%%QText%%'], radioCellClass + ' ' + labelPattrernClass);
        rows.push(row);

        return rows;
    }
    // #endregion

    function dropDownRenderer(XMLDoc) {
        // 'this' - refers to the rendering object created in 
        // 'addRenderer' method in 'rendererFactory'.
        var doc = this.XMLDoc || XMLDoc,        
            dropDowns = doc.getElementsByTagName('control_values'),
            dropDownsCount = dropDowns.length,
            i = 0,
            j = 0,
            columns,
            columnsCount,                        
            selectElement,
            optionElement;

        for (; i < dropDownsCount; i += 1) {
            columns = dropDowns[i].getElementsByTagName('control_value');
            // create 'select element'. 
            selectElement = document.createElement('select');
            columnsCount = columns.length;
            for (; j < columnsCount; j += 1) {
                // create 'option' element.
                optionElement = createOptionElement(columns[j]);
                selectElement.add(optionElement);
            }
        }        

        function createOptionElement(columnElement) {
            var optionElement = document.createElement('option');
            optionElement.setAttribute(VALUE_ATTRIBUTE, columnElement.getAttribute('value'));
            optionElement.innerText = columnElement.getAttribute('display');

            return optionElement;
        }

        return selectElement;
    }

    // #region 'scaleRenderer' using divs
    //function scaleRenderer(XMLDoc) {
    //    var doc = this.XMLDoc || XMLDoc, 
    //    container, row, cell, lines, columns,
    //    linesCount, columnsCount, i = 0, j = 0,
    //    // a tag that has 'value' attribute.
    //    columns_count_attr;

    //    container = document.createElement('div');
    //    container.setAttribute('class', 'scale-contanier');

    //    columns_count_attr = doc.getElementsByTagName('column_count')[0].getAttribute('value');
    //    container.setAttribute(COLUMNS_COUNT_ATTTRIBUTE, columns_count_attr);
    //    lines = doc.getElementsByTagName('line');
    //    linesCount = lines.length;

    //    // for each 'line' tag. 'columnsCount' might differ from 'columns_count_attr'.
    //    for (; i < linesCount; i++) {
    //        columns = lines[i].getElementsByTagName('column');
    //        columnsCount = columns.length;
    //        row = document.createElement('div');
    //        row.setAttribute('class', 'scale-row');
    //        for (j = 0; j < columnsCount; j++) {
    //            cell = createCell(columns[j]);                
    //            row.appendChild(cell);
    //        }

    //        container.appendChild(row);
    //    }

    //    function createCell(column) {
    //        var cell = document.createElement('div');
    //        cell.innerText = column.getAttribute('display');
    //        cell.setAttribute(VALUE_ATTRIBUTE, column.getAttribute('value'));
    //        cell.setAttribute('class', 'scale-cell');            
    //        cell.setAttribute('data-columns', column.getAttribute('columns'));

    //        return cell;
    //    }

    //    return container;
    //}
    // #endregion

    // #region 'scaleRenderer' using table.  Table has only thead.
    function scaleRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc, 
        rows = [],tHead, row, cell, lines, columns,
        linesCount, columnsCount, i = 0, j = 0,
          
        lines = doc.getElementsByTagName('line');
        linesCount = lines.length;

        // for each 'line' tag. 'columnsCount' might differ from 'columns_count_attr'.
        for (; i < linesCount; i++) {
            columns = lines[i].getElementsByTagName('column');      
            row = createRow(columns);
            rows.push(row);            
        }

        return rows
    }
    // #endregion

    function verticalGroupRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc;
        throw new Error("Renderer not implemented.");
    }

    function dateRenderer(XMLDoc) {
        var doc = this.XMLDoc || XMLDoc;
        throw new Error("Renderer not implemented.");
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

    function createRow(columns, cellContent, cellClass) {
        /// <summary>Creates 'tr' element and adds content to it. </summary>
        /// <param name='columns' type='Element'>The Element containing info about the row. </param>
        /// <param name='cellContent' type='Object'>Object representing the HTMLElement content of each cell. </param>   
        /// <param name='cellClass' type='String'>The class of the cells. </param>   
        /// <returns type="Element">A tr element.</returns>

        var row, columnsCount = columns.length, i;

        row = document.createElement('tr');
        for (i = 0; i < columnsCount; i++) {
            cell = createCell(columns[i], cellContent);
            if (cellClass !== undefined) {
                cell.setAttribute('class', cellClass);
            }

            row.appendChild(cell);
        }

        return row;
    }

    function createCell(column, cellContent) {
        /// <summary>Creates 'td' element and adds content to it. </summary>
        /// <param name='column' type='Element'>Element containing info about the cell. </param>
        /// <param name='cellContent' type='Object'>Object representing the HTMLElement content of the cell. </param>   
        /// <returns type="Element">A td element.</returns>

        var cell = document.createElement('td'), element;        
        cell.innerText = column.getAttribute('display');
        cell.setAttribute(VALUE_ATTRIBUTE, column.getAttribute('value'));
        cell.setAttribute('colspan', column.getAttribute('columns') || 1);        
        
        if (cellContent !== undefined) {            
            element = document.createElement(cellContent.elementType);
            cellContent.attributes.forEach(function (attr) {
                element.setAttribute(attr.name, attr.value);
            });
            cell.appendChild(element);
        }
        return cell;
    }

    function insertCells(row, cellsInnerText, cellClass) {
        /// <summary> Inserts td at the begining of the td.</summary>
        /// <param name='row' type='Element'>The td element. </param>
        /// <param name='cellsInnerText' type='String'>The inner texxt of the inserted cell. </param>   
        /// <param name='cellClass' type='String'>The class of the cells. </param>   
        /// <returns type="Element">A 'tr'; element.</returns>

        var length = cellsInnerText.length, i = length, cell;
        if (length) {
            // So that %%value%% are passed the same way as they should appear.
            while(i--) {
                cell = document.createElement('td');
                cell.setAttribute('class', cellClass);
                cell.innerText = cellsInnerText[i];                
                row.insertBefore(cell, row.firstChild);
            }
        }
    }

    XMLrendererFactory.addXMLRenderer(DISPLAY_TYPE_TEXT, textRenderer);
    XMLrendererFactory.addXMLRenderer(DISPLAY_TYPE_LABEL, labelRenderer);
    XMLrendererFactory.addXMLRenderer(DISPLAY_TYPE_RADIO, radioGroupRenderer);
    XMLrendererFactory.addXMLRenderer(DISPLAY_TYPE_DROPDOWN, dropDownRenderer);
    XMLrendererFactory.addXMLRenderer(DISPLAY_TYPE_SCALE, scaleRenderer);
    XMLrendererFactory.addXMLRenderer(DISPLAY_VERTICAL_GROUP, verticalGroupRenderer);
    XMLrendererFactory.addXMLRenderer(DISPLAY_TYPE_DATE, dateRenderer);
    XMLrendererFactory.addXMLRenderer(DISPLAY_TYPE_DATADROPDOWN, datadropDownRenderer);
    XMLrendererFactory.addXMLRenderer(DISPLAY_TYPE_CASCADEDROPDOWN, cascadedropDownRenderer);
}

