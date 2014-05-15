/// <reference path="RenderersCommonObjects.js" />
/// <reference path="objects.XMLScaleRendererManager.js" />
/// <reference path="jquery-2.1.0.min.js" />
// Gets XML renderer based on the type of the XML content. 
// Different renderers present different strategies to render XML to html.
var XMLRendererFactory = (function () {    
    var renderers = {}, // Assosiative array of rendering functions.
        ROOT_TAG = 'eval_question',        
        EXTERNAL_REF = 'ExternalRef',
        Q_TEXT = 'QText',
        objects = renderersCommon.objects,
        currentSelectedRenderer,
        scaleManager = objects.dynamicScaleManager;
    
    function addXMLRenderer(XMLType, renderFunc) {
        /// <summary>Adds XML renderer based on the XML type </summary>
        /// <param name='XMLType' type='String'>The XML type. </param>
        /// <param name='renderFunc' type='Function'>The XML rendering function. </param>  
        renderers[XMLType] = renderFunc;
    }

    function makeXMLRenderer(questionString) {
        /// <summary>Gets XML renderer based on the type of the XML content </summary>
        /// <param name='XMLContent' type='String'>The XML to render to HTML. </param>
        /// <returns type="XMLRenderer"> An XML renderer.</returns>
        var questionObject,
            xmlRenderer,
            scaleRowClassName,            
            typeOfQuestionString = typeof questionString,
            dynamicScaleQuestionId;

        try {
            if (typeOfQuestionString === 'string') {
                questionObject = JSON.parse(questionString);
            } else {
                questionObject = questionString;
            }
        } catch (e) { // Invalid JSON. Possible reasons: unescaped characters(quotes)
            console.log(e.message);
        }

        var XMLDoc = parseXML(questionObject),
            XML_TYPE_ATTRIBUTE_NAME = 'display_type',
            questionTag = XMLDoc.getElementsByTagName(ROOT_TAG).item(0),
            displayType = questionTag.getAttribute(XML_TYPE_ATTRIBUTE_NAME),
            renderFunc;

        renderFunc = renderers[displayType];
        // Make a copy of the renderer!!!

        manageScaleMode();
    

        xmlRenderer = new objects.XMLRenderer(questionObject, XMLDoc, renderFunc, dynamicScaleQuestionId);

        return xmlRenderer;

        function manageScaleMode() {
            if (scaleManager.isScaleRednerer(displayType)) {
                if (scaleManager.isScaleModeOn() === false) {
                    scaleManager.turnScaleModeOn();
                    scaleManager.CurrentScaleQuestionId = questionObject.ID;
                }

            } else {
                if (scaleManager.isRadioRenderer(displayType)) {
                    scaleManager.turnScaleModeOff();
                    dynamicScaleQuestionId = scaleManager.CurrentScaleQuestionId;
                } 
            }
        }        
    }
    
    function parseXML(question) {
        var XMLDoc = undefined, XMLContent = question.Data.DisplayDefinition,
        parser = new DOMParser();

        XMLContent = changeNOBRWithSpan(XMLContent);

        XMLDoc = parser.parseFromString(XMLContent, "text/xml");
        if (XMLDoc.getElementsByTagName('parsererror').length > 0) {
            //TODO: fix erroneous parts in 'XMLContent' - unescaped symbols, mostly.
            XMLDoc = parser.parseFromString(XMLContent, "text/xml");
        }

        addLabelTags(XMLDoc, question);

        return XMLDoc;
    }

    // Adds two more tags for for '%%ExternalRef%%' and '%%QText%%' or replaces existing values.
    function addLabelTags(XMLDoc, questionObject) {
        var root = XMLDoc.getElementsByTagName(ROOT_TAG)[0], extRefValue,
            LABEL_PATTERN_ATTRIBUTE = 'label_pattern', NO_LABEL_VALUE = 'NO_LABEL',
            label = root.getAttribute(LABEL_PATTERN_ATTRIBUTE), labels,
            attrValue, tag, tagName, tagValue, oldNode, columns,
            question = questionObject.Data, i;

        if (label) {
            labels = label.split('|');

            // create new tags with the names of the label values - 'ExternalRef' and 'QText'
            // add new tags at begining of root tag - will be used as rows.
            if (labels.length >= 2) {
                for (i = 0; i < labels.length; i++) {
                    tagName = 'column';
                    appendTagToXML(labels[i], tagName);
                }
            } else { // %%ExternalRef%%- %%QText%%   
                // Label should have value to convert it to tag.
                if (label !== NO_LABEL_VALUE) {
                    tagName = 'row'
                    appendTagToXML(labels[0], tagName);
                }
            }

            oldNode = XMLDoc.getElementsByTagName(ROOT_TAG)[0];
            XMLDoc.replaceChild(oldNode, root);
        } else { // Check for label as 'display' value
            columns = XMLDoc.getElementsByTagName('column');
            if (columns) {
                // Replace 'ExtRef' and Qtext
                for (i = 0; i < columns.length; i++) {
                    if (columns[i].getAttribute('display') === '%%ExternalRef%%') {
                        columns[i].setAttribute(EXTERNAL_REF, question[EXTERNAL_REF] || '');
                    } else if (columns[i].getAttribute('display') === '%%QText%%') {
                        columns[i].setAttribute(Q_TEXT, question[Q_TEXT] || '');
                    }
                }
            }
        }

        function appendTagToXML(currentLabel, tagName) {
            var tags, attrName, separator;
            // Remove '%' from label.               
            currentLabel = replaceSymbol(currentLabel, '%%', '');

            tag = XMLDoc.createElement(tagName);
            attrName = currentLabel;

            if (tagName === 'row') {
                // Add the two dynamic values to same tag. Use 'ExternalRef' as attr name.
                // That attr name will later be used in 'insertDynamicContents'
                separator = getSeparator();

                tags = currentLabel.split(separator);
                attrValue = question[tags[0]] + separator;
                attrValue += question[tags[1]];
                attrName = tags[0];
                tag.setAttribute(attrName, attrValue);
                // In original method 'ParseLabelPattern' if dynamic is NOT type "%%ExternalRef%%|%%QText%%" 
                // its colspan is assigned value of 2. Add attribute 'columns' and use it in 'insertDynamicContents' method.
                tag.setAttribute('columns', 2);
            } else {
                attrValue = question[currentLabel];
                tag.setAttribute(currentLabel, attrValue);
            }
            // set 'display' value to 'ExternalRef' or 'QText'
            tag.setAttribute('display', attrName);

            function getSeparator() {
                var exterRefIndex, qTextIndex, separator, separatorIndex;
                exterRefIndex = 0;
                qTextIndex = currentLabel.indexOf(Q_TEXT);
                separatorIndex = EXTERNAL_REF.length;
                separator = currentLabel.substring(separatorIndex, qTextIndex);

                return separator;
            }
            //// Adds content to tag                
            root.appendChild(tag);
        }
    }

    function replaceSymbol(text, symbol, replacement) {
        while (text.indexOf(symbol) >= 0) {
            text = text.replace(symbol, replacement);
        }

        return text;
    }

    function changeNOBRWithSpan(content) {
        // Invalid '<' and '>'
        // Replace nobr with system of 'class' attr and 'span'
        if (content.indexOf('nobr') >= 0) {
            content = replaceSymbol(content, '<nobr>', '&lt;span class=&quot;no-wrap&quot;&gt;');
        }
        if (content.indexOf('/nobr') >= 0) {
            content = replaceSymbol(content, '</nobr>', '&lt;/span&gt;');
        }

        return content
    }

    return {
        addXMLRenderer: addXMLRenderer,
        makeXMLRenderer: makeXMLRenderer        
    }
})();