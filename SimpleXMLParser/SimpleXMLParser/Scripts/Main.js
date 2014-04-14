/// <reference path="jquery-2.1.0.min.js" />
/// <reference path="renderers.js" />
/// <reference path="rendererFactory.js" />

$(document).ready(function () {
    var button = document.getElementById('btn');
    var fileInput = document.getElementById('fileInput');
    var END_OF_XML = '/// End Of XML ///';    

    initializeRenderers();
    document.onkeydown = function (event) {
        if (event.keyCode === 13) {
            convertXMLToHTML();
        }
    }
    button.onclick = convertXMLToHTML;

    fileInput.onchange = selectFiles;

    function convertXMLToHTML() {
        var xmlType = 'text';
        var container = document.getElementById('container');
        var xmlContent = container.value;
        var renderer, element;

        // Last value in array is empty string.
        // Array represents the XMLs written to file when respective
        // web page questionary was rendered.
        // XMLs are separated by '/// End Of XML ///' string.
        allXMLs = xmlContent.split(END_OF_XML);

        for (var i = 0, currentXML; currentXML = allXMLs[i].trim() ; i++) {
            if (currentXML) {
                renderer = XMLRendererFactory.getXMLRenderer(currentXML);
                try {
                    element = renderer.convertToHTML();
                } catch (e) {
                    element = '';
                }
            }            
            
            // Is the element an array?
            if (element.forEach) {
                element.forEach(function (elem) {
                    addDOMElement('table-container', elem);
                });
            } else {
                addDOMElement('div-container', element);
            }
        }
    }

    function addDOMElement(containerId, element) {
        var elementContainer = document.getElementById(containerId);
        if (element) {
            elementContainer.appendChild(element);
        }
        
    }

    function selectFiles(evt) {
        var container = document.getElementById('container');
        var file = evt.target.files[0], reader, fileContent, content = '';

        // Reset container content
        container.innerText = '';

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            evt.stopPropagation();
            evt.preventDefault();

            reader = new FileReader();
            reader.onload = (function (f) {
                return function () {
                    content += reader.result;
                    container.innerText += content;
                }
            })(file);

            reader.readAsText(file);

        } else {
            alert('The File APIs are not fully supported by your browser.');
        }
    }
})