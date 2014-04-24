/// <reference path="jquery-2.1.0.min.js" />
/// <reference path="renderers.js" />
/// <reference path="rendererFactory.js" />

$(document).ready(function () {
    var button = document.getElementById('btn');
    var fileInput = document.getElementById('fileInput');
    var END_OF_XML = '/// End Of XML ///';
    
    document.onkeydown = function (event) {
        //if (event.keyCode === 13) {
        //    convertXMLToHTML();
        //}
    }
    button.onclick = convertXMLToHTML;

    fileInput.onchange = selectFiles;

    function convertXMLToHTML() {
        var xmlType = 'text';
        var container = document.getElementById('container');
        var question = container.value;
        var renderer, element;

      
        // XMLs are separated by '/// End Of XML ///' string.
        allQuestions = question.split(END_OF_XML);

        for (var i = 0, currentQuestion; currentQuestion = allQuestions[i]; i++) {

            currentQuestion = currentQuestion.trim();
            if (currentQuestion) {
                // convert string to object.                        
                renderer = XMLRendererFactory.makeXMLRenderer(currentQuestion);
                try {
                    element = renderer.convertToHTML();
                } catch (e) {
                    console.log(e.message);
                    element = '';
                }
            }

            // Is the element an array?
            if (element && element.forEach) {
                element.forEach(function (elem) {
                    addDOMElement('table-container', elem);
                });
            } else {
                addDOMElement('table-container', element);
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
                    //container.innerText += content;
                    container.innerHTML += content;
                }
            })(file);

            reader.readAsText(file);

        } else {
            alert('The File APIs are not fully supported by your browser.');
        }
    }
})