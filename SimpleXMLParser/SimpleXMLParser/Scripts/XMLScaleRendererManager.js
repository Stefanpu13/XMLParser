/// <reference path="jquery-2.1.0.min.js" />
var XMLScaleRendererManager = (function () {  
    var rendererManager, renderersGroup;
    function isScaleRenderer(displayType) {
        return displayType === 'scale';
    }

    function showScaleRowIfNotVisible(e) {

    }

    function currentRendererIsScale() {
        return rendererManager.isScaleRenderer(rendererManager.currentRendererType);
    }

    rendererManager = {
        isScaleRenderer: isScaleRenderer,
        currentRenderer: undefined,
        currentRendererType: undefined,
        showScaleRowIfNotVisible: showScaleRowIfNotVisible,
        currentRendererIsScale: currentRendererIsScale
    }
})();
