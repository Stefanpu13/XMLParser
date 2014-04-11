// Gets XML renderer based on the type of the XML content. 
// Different renderers present different strategies to render XML to html.
var XMLrendererFactory = (function () {

    // Constructor function.
    var XMLRenderer = function (XMLDoc, XMLRenderingFunc) {
        /// <field name='XMLDoc' type='Document'>The document to be converted to HTML.</field>
        this.XMLDoc = XMLDoc;
        /// <field name='convertToHTML' type='Function'>The document to be converted to HTML.</field>
        this.convertToHTML = XMLRenderingFunc;
    },
    
    renderers = {};
    
    function addXMLRenderer(XMLType, renderFunc) {
        /// <summary>Adds XML renderer based on the XML type </summary>
        /// <param name='XMLType' type='String'>The XML type. </param>
        /// <param name='renderFunc' type='Function'>The XML rendering function. </param>        

        var renderer,
            // Properties are Case Sensitive!! Make case INSENSITIVE access.
            //  XMLType = 'TeXt' should be the same as XMLType= text;
            XMLTypeToLower = XMLType.toLowerCase && XMLType.toLowerCase();

        if (XMLTypeToLower !== undefined) {
            // 'renderers[XMLType] === undefined' checks for inherited properties. 
            if (renderers[XMLType] === undefined || renderers.hasOwnProperty(XMLTypeToLower)) {
                // XMLDoc is added when the renderer is requested.
                //renderer = {
                //    XMLDoc: undefined,                
                //    convertToHTML: renderFunc
                //};

                renderer = new XMLRenderer(undefined, renderFunc);
                renderers[XMLTypeToLower] = renderer;
            } else {
                throw new Error('\'XMLType\' is inherited property and can not be added.');
            }
        }       
    }

    function getXMLRenderer(XMLContent) {
        /// <summary>Gets XML renderer based on the type of the XML content </summary>
        /// <param name='XMLContent' type='String'>The XML to render to HTML. </param>
        /// <returns type="XMLRenderer"> An XML renderer.</returns>
        var XMLDoc = parseXML(XMLContent),
            questionTag = XMLDoc.getElementsByTagName('eval_question').item(0),
            displayType = questionTag.getAttribute('display_type'),
            renderer,
            // Convert to lower case.
            displayTypeToLower = displayType.toLowerCase && displayType.toLowerCase();

        if (displayTypeToLower) {
            if (renderers[displayTypeToLower] !== undefined) {
                renderer = renderers[displayTypeToLower];
                renderer.XMLDoc = XMLDoc;

                return renderer;
            } else {
                throw new Error('\'XMLType\' is not supported.')
            }
        } else {
            throw new TypeError('\'XMLType\' is not a string.')
        }
    }
    
    function parseXML(XMLContent) {
        var XMLDoc = undefined;
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
        } catch (e) {
            throw new SyntaxError('Can not get XML renderer. Invalid XML content');
        }        
        // Chrome 33, FF 28, Opera 20, Safari 5.1.7 do not throw exception if XML is invalid.
        if (isValidXML(XMLDoc) === false) {

            throw new SyntaxError('Can not get XML renderer. Invalid XML content');
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