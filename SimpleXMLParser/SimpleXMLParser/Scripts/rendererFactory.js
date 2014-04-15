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
        labelPatternAttribute = 'label_pattern'
        

    var currentSelectedRenderer;
    
    function addXMLRenderer(XMLType, renderFunc) {
        /// <summary>Adds XML renderer based on the XML type </summary>
        /// <param name='XMLType' type='String'>The XML type. </param>
        /// <param name='renderFunc' type='Function'>The XML rendering function. </param>        

        // Properties are Case Sensitive!! Make case INSENSITIVE access.
        //  XMLType = 'TeXt' should be the same as XMLType= text;
        var XMLTypeToLower = XMLType.toLowerCase && XMLType.toLowerCase();

        if (XMLTypeToLower !== undefined) {
            // 'renderers[XMLType] === undefined' checks for inherited properties. 
            if (renderers[XMLType] === undefined || renderers.hasOwnProperty(XMLTypeToLower)) {               
                renderers[XMLTypeToLower] = renderFunc;
                
            } else {
                throw new Error('\'XMLType\' is inherited property and can not be added.');
            }
        }       
    }

    function getXMLRenderer(questionString) {
        /// <summary>Gets XML renderer based on the type of the XML content </summary>
        /// <param name='XMLContent' type='String'>The XML to render to HTML. </param>
        /// <returns type="XMLRenderer"> An XML renderer.</returns>
        var questionObject = JSON.parse(questionString).Data;

        var XMLDoc = parseXML(questionObject),
            questionTag = XMLDoc.getElementsByTagName(rootTag).item(0),
            displayType = questionTag.getAttribute(XMLTypeAttributeName),
            renderFunc,
            // Convert to lower case.
            displayTypeToLower = displayType.toLowerCase && displayType.toLowerCase();

        if (displayTypeToLower) {
            renderFunc = renderers[displayTypeToLower]; 
            if (renderFunc !== undefined) {
                // Make a copy of the renderer!!!                
                return new XMLRenderer(questionObject, XMLDoc, renderFunc);                
            } else {
                throw new Error('\'XMLType\' is not supported.')
            }
        } else {
            throw new TypeError('\'display_type\' attribute not found or is empty string.')
        }
    }
    
    function parseXML(question) {
        var XMLDoc = undefined, XMLContent = question.DisplayDefinition;
        // IE throws error if XML is invalid.
        try {
            if (window.DOMParser) {
                parser = new DOMParser();
                XMLDoc = parser.parseFromString(XMLContent, "text/xml");

            } else { // Internet Explorer 8
                XMLDoc = new ActiveXObject("Microsoft.XMLDOM");
                XMLDoc.async = false;
                XMLDoc.loadXML(txt);
            }

            addLabelTags(XMLDoc, question);
        } catch (e) {
            throw new Error('Can not get XML renderer. Invalid XML content');
        }        
        // Chrome 33, FF 28, Opera 20, Safari 5.1.7 do not throw exception if XML is invalid.
        if (isValidXML(XMLDoc) === false) {

            throw new Error('Can not get XML renderer. Invalid XML content');
        }

        // Adds two more tags for for '%%ExternalRef%%' and '%%QText%%' or replaces existing values.
        function addLabelTags(XMLDoc, question) {
            var root = XMLDoc.getElementsByTagName(rootTag)[0],
                label = root.getAttribute(labelPatternAttribute), attrName, labels,
                attrValue, tag, tagValue, oldNode, currentLabel, columns,
                labelsValues = ['%%ExternalRef%%','%%QText%%'];
            

            if (label) {
                labels = label.split('|');

                // create new tags with the names of the label values - 'ExternalRef' and 'QText'
                // add new tags ad begining of root tag - will be used as rows
                if (labels.length == 2) {
                    for (var i = 0; i < labels.length; i++) {
                        // get attr name - this is tag name
                        //attrName = labels[i].slice(2, -2); 
                        appendTagToXML(labels[i]);
                    }
                } else { // %%ExternalRef%%- %%QText%%
                    currentLabel = labels[0].replace('%%ExternalRef%%- ', '');
                    appendTagToXML(currentLabel);
                }

                function appendTagToXML(currentLabel) {
                    attrName = currentLabel.slice(2, -2); // Remove '%' from label.
                    // get value from object
                    attrValue = question[attrName];
                    // add new tag to XMLDoc. Use unified tag name for later use in 'createRow' and 'createCell' methods.
                    tag = XMLDoc.createElement('column');
                    tag.setAttribute('display', attrValue);

                    tagValue = XMLDoc.createTextNode(attrValue);
                    tag.appendChild(tagValue);
                    root.appendChild(tag);
                }

                oldNode = XMLDoc.getElementsByTagName(rootTag)[0];
                XMLDoc.replaceChild(oldNode, root);
            } else { // Check for label as 'display' value
                columns = XMLDoc.getElementsByTagName('column');
                if (columns) {
                    // Replace 'ExtRef' and Qtext
                    for (var i = 0; i < 2; i++) {
                        
                        if (columns[i].getAttribute('display') === '%%ExternalRef%%') {
                            columns[i].setAttribute('display', question['%%ExternalRef%%'] || '');
                        } else if (columns[i].getAttribute('display') === '%%QText%%') {
                            columns[i].setAttribute('display', question['%%QText%%'] || '');
                        }
                    }
                }
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