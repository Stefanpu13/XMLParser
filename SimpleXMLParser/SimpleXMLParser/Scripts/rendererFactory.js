/// <reference path="jquery-2.1.0.min.js" />
// Gets XML renderer based on the type of the XML content. 
// Different renderers present different strategies to render XML to html.
var XMLRendererFactory = (function () {
    // Constructor function.
    var XMLRenderer = (function () {
        var XMLRenderer = function (questionObject, XMLDoc, XMLRenderingFunc) {
            this.question = questionObject;
            this.XMLDoc = XMLDoc;
            this.convertToHTML = XMLRenderingFunc;
        }
        // function is set to prototype and not copied to each object.
        XMLRenderer.prototype.convertToHTML = function () { };

        return XMLRenderer;
    })(),
    // Assosiative array of rendering functions.
        renderers = {},
        rootTag = 'eval_question',
        XMLTypeAttributeName = 'display_type',
        labelPatternAttribute = 'label_pattern',
        EXTERNAL_REF = 'ExternalRef',
        Q_TEXT = 'QText', currentSelectedRenderer;
    
    function addXMLRenderer(XMLType, renderFunc) {
        /// <summary>Adds XML renderer based on the XML type </summary>
        /// <param name='XMLType' type='String'>The XML type. </param>
        /// <param name='renderFunc' type='Function'>The XML rendering function. </param>  
        renderers[XMLType] = renderFunc;
    }

    function getXMLRenderer(questionString) {
        /// <summary>Gets XML renderer based on the type of the XML content </summary>
        /// <param name='XMLContent' type='String'>The XML to render to HTML. </param>
        /// <returns type="XMLRenderer"> An XML renderer.</returns>
        var questionObject = JSON.parse(questionString);

        var XMLDoc = parseXML(questionObject),
            questionTag = XMLDoc.getElementsByTagName(rootTag).item(0),
            displayType = questionTag.getAttribute(XMLTypeAttributeName),
            renderFunc;           

        if (displayType) {
            renderFunc = renderers[displayType];
            if (renderFunc !== undefined) {
                // Make a copy of the renderer!!!                
                return new XMLRenderer(questionObject, XMLDoc, renderFunc);                
            } else {
                throw new Error('\'XMLType\' is not supported.')
            }
        } else {
            throw new Error('\'display_type\' attribute not found or is empty string.')
        }
    }
    
    function parseXML(question) {
        var XMLDoc = undefined, XMLContent = question.Data.DisplayDefinition;
        // IE throws error if XML is invalid.
        try {

            parser = new DOMParser();
            XMLDoc = parser.parseFromString(XMLContent, "text/xml");

            addLabelTags(XMLDoc, question);
        } catch (e) {
            //throw new Error('Can not get XML renderer. Invalid XML content');
            throw new Error(e.message);
        }        
        // Chrome 33, FF 28, Opera 20, Safari 5.1.7 do not throw exception if XML is invalid.
        if (isValidXML(XMLDoc) === false) {
            throw new Error('Can not get XML renderer. Invalid XML content');
        }

        // Adds two more tags for for '%%ExternalRef%%' and '%%QText%%' or replaces existing values.
        function addLabelTags(XMLDoc, questionObject) {
            var root = XMLDoc.getElementsByTagName(rootTag)[0], extRefValue,
                label = root.getAttribute(labelPatternAttribute), labels,
                attrValue, tag, tagName, tagValue, oldNode, columns, question = questionObject.Data, i;
                //labelsValues = ['ExternalRef','QText'];            

            if (label) {
                labels = label.split('|');

                // create new tags with the names of the label values - 'ExternalRef' and 'QText'
                // add new tags ad begining of root tag - will be used as rows
                if (labels.length >= 2) {
                    for (i = 0; i < labels.length; i++) {
                        tagName = 'column';
                        appendTagToXML(labels[i], tagName);
                    }
                } else { // %%ExternalRef%%- %%QText%%                    
                    tagName = 'row'
                    appendTagToXML(labels[0], tagName);
                }

                oldNode = XMLDoc.getElementsByTagName(rootTag)[0];
                XMLDoc.replaceChild(oldNode, root);
            } else { // Check for label as 'display' value
                columns = XMLDoc.getElementsByTagName('column');
                if (columns) {
                    // Replace 'ExtRef' and Qtext
                    for (i = 0; i < 2; i++) {
                        
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
                while (currentLabel.indexOf('%%') >= 0) {
                    currentLabel = currentLabel.replace('%%', '');
                }

                tag = XMLDoc.createElement(tagName);
                attrName = currentLabel;

                if (tagName === 'row') {
                    // Add the two dynamic values to same tag. Use 'ExternalRef' as attr name.
                    // That attr name will later be used in 'insertDynamicContent'
                    separator = getSeparator();
                  
                    tags = currentLabel.split(separator);
                    attrValue = question[tags[0]] + separator;
                    attrValue += question[tags[1]];                    
                    attrName = tags[0];
                    tag.setAttribute(attrName, attrValue);
                    // In original method 'ParseLabelPattern' if dynamic is NOT type "%%ExternalRef%%|%%QText%%" 
                    // its colspan is assigned value of 2. Add attribute 'columns' and use it in 'insertDynamicContent' method.
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

        return XMLDoc;
    }

    function isValidXML(XMLDoc) {
        var parseErrorTag = XMLDoc.documentElement;        
        // Works in Chrome 33, FF 28, Opera 20, Safari 5.1.7
        var isValid =
            parseErrorTag.nodeName !== 'parsererror' && parseErrorTag.firstChild.nodeName !== 'parsererror';

        return isValid;
    }

    return {
        addXMLRenderer: addXMLRenderer,
        getXMLRenderer: getXMLRenderer
    }
})();