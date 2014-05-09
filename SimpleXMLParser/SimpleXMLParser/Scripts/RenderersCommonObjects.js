var renderersCommon = renderersCommon || {}; // namespace declaration in different classes
renderersCommon.objects = (function () {

    var Calendar = (function () {

        var Calendar = function () {
            this.day,
            this.month,
            this.year;
        };

        Calendar.prototype.isLeap = function (year) {
            return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
        }

        Calendar.prototype.getDaysInMonth = function (month, year) {
            return new Date(year || this.year, month, 0).getDate();
        }

        return Calendar;
    })(),

        Response = function (id, rValue, rValueInt) {
            this.questionId = id;
            this.RValue = rValue;
            this.RValueInt = rValueInt;
        },

        DropdownHttpClient = (function () {
            var DropdownHttpClient = function (baseUrl) {
                this.baseUrl = baseUrl;
            }

            DropdownHttpClient.prototype.getClassTypeUrl = function (displayDef, classType) {
                return this.baseUrl + "questions/CascadeDropDownClasses?displayDef=" +
                   displayDef + '&classType=' + classType;
            }

            DropdownHttpClient.prototype.getAuthenticationToken = function () {
                var token = localStorage.getItem('AuthorizationCookie');

                return { Token: token };
            }

            DropdownHttpClient.prototype.getTestAuthenticationToken = function () {
                var user = {
                    UserName: 'demoresident611',
                    Password: '222222',
                    FacilityId: '150'
                },
                    url = 'http://localhost:61008/api/Users/Authenticate';

                return $.ajax({
                    url: url,
                    type: 'post',
                    data: JSON.stringify(user),
                    contentType: 'application/json',
                    error: function (e) {
                        console.log(e);
                    }
                });
            }

            DropdownHttpClient.prototype.getDynamicCascadeDropdown =
                function (url, token, selectElementContainingTableCell, questionId) {
                    $.ajax({
                        url: url,
                        type: 'get',
                        // 'async' is set to execute next 'change' event ONLY avter the current has returned.
                        async: false,
                        headers: {
                            'X-Token': token,
                            'Content-Type': 'application/json'
                        },
                        success: function insertDynamicSelect(dynamicData) {
                            var controlValueContainingTag = document.createElement('control_values'),
                                labelContainer,
                                dynamicSelectClassName = 'dynamic-select',
                                functions = renderersCommon.functions;

                            functions.insertDynamicDataControlTags(controlValueContainingTag, dynamicData);
                            labelContainer =
                                functions.createSelectElement(controlValueContainingTag, questionId,
                                 "", "", dynamicSelectClassName).labelContainer;

                            // If there is already dynamic select element - remove it.
                            if (selectElementContainingTableCell.lastChild !== selectElementContainingTableCell.firstChild) {
                                selectElementContainingTableCell.
                                    removeChild(selectElementContainingTableCell.lastChild);
                            }

                            selectElementContainingTableCell.appendChild(labelContainer);

                        },
                        error: function (e) {
                            console.log(e);
                        }
                    });
                }

            return DropdownHttpClient;
        })(),

        XMLScaleRendererManager = (function () {
            var rendererManager, renderersGroup;
            function isScaleRenderer(displayType) {
                return displayType === 'scale';
            }

            function showScaleRowIfNotVisible(e) {
                // TODO: Implement method
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

            return rendererManager;
        })();

    return {
        Response: Response,
        Calendar: Calendar,
        DropdownHttpClient: DropdownHttpClient,
        XMLScaleRendererManager: XMLScaleRendererManager
    }
})()