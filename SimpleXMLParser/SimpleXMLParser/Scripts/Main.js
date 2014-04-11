/// <reference path="jquery-2.1.0.min.js" />
/// <reference path="renderers.js" />
/// <reference path="rendererFactory.js" />

$(document).ready(function () {

    initializeRenderers();

    document.onkeydown = function (event) {
        if (event.keyCode === 13) {
            convertXMLToHTML();
        }
    }

    var button = document.getElementById('btn');
    button.onclick = convertXMLToHTML;


    function convertXMLToHTML() {
        var xmlType = 'text';
        var container = document.getElementById('container');
        var xmlContent = container.value;
        var renderer = XMLrendererFactory.getXMLRenderer(xmlContent);
        var element = renderer.convertToHTML();

        // is element an array?
        if (element.forEach) {
            element.forEach(function (elem) {
                addDOMElement('table-container', elem);
            });
        } else {
            addDOMElement('div-container', element);
        }
        
        
        
    }

    function addDOMElement(containerId, element) {
        var elementContainer = document.getElementById(containerId);
        elementContainer.appendChild(element);
    }
})