/// <reference path="renderersConstants.js" />
var renderersCommon = renderersCommon || {}; // namespace declaration in different classes
renderersCommon.objects = (function () {

    var constants = renderersCommon.constants;

        Calendar = (function () {

        var Calendar = function (daySelect, monthSelect, yearSelect) {
            this.day,
            this.month,
            this.year;
            this.daySelect = daySelect;
            this.monthSelect = monthSelect;
            this.yearSelect = yearSelect;
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

            function isDevelopmentEnviroment() {
                return document.URL.indexOf('//localhost') >= 0;
            }

            function getTestAuthenticationToken() {
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

            DropdownHttpClient.prototype.getClassTypeUrl = function (displayDef, classType) {
                return this.baseUrl + "questions/CascadeDropDownClasses?displayDef=" +
                   displayDef + '&classType=' + classType;
            }

            DropdownHttpClient.prototype.getAuthenticationToken = function () {
                var token,
                    user;
                if (isDevelopmentEnviroment()) {
                    return getTestAuthenticationToken();
                } else {
                    token = localStorage.getItem('AuthorizationCookie');
                    return { Token: token };
                }
            }

            DropdownHttpClient.prototype.getDynamicCascadeDropdown =
                function (url, token, questionId) {
                   return $.ajax({
                        url: url,
                        type: 'get',
                        // 'async' is set to execute next 'change' event ONLY avter the current has returned.
                        async: false,
                        headers: {
                            'X-Token': token,
                            'Content-Type': 'application/json'
                        },
                        error: function (e) {
                            console.log(e);
                        }
                    });
                }

            return DropdownHttpClient;
        })(),
                
        XMLRenderer = (function () {
            var XMLRenderer = function (questionObject, XMLDoc, XMLRenderingFunc, dynamicScaleQuestionId) {
                this.question = questionObject;
                this.XMLDoc = XMLDoc;
                this.convertToHTML = XMLRenderingFunc;
                this.dynamicScaleQuestionId = dynamicScaleQuestionId;
            }

        // function is set to prototype and not copied to each object.
        XMLRenderer.prototype.convertToHTML = function () { };        

        return XMLRenderer;
        })(),

         // QuestionerDataStorage is constructor function
        QuestionerDataStorage = (function () {
        var count;
        return {
            get dataColumnCount() {
                return count || 4; // As is in original method.
            },
            set dataColumnCount(value) {
                count = value;
            }
        }
        })(),
        
        dynamicScaleManager = (function () {
            var currentScaleQuestionId,
                scaleModeOn = false,
                CurrentScaleQuestionId;

            function isScaleRednerer(displayType) {
                return displayType === constants.DISPLAY_TYPE_SCALE;
            }

            function isRadioRenderer(displayType){
                return displayType === constants.DISPLAY_TYPE_RADIO;
            }

            function turnScaleModeOn() {
                scaleModeOn = true;
            }

            function turnScaleModeOff() {
                scaleModeOn = false;
            }

            function isScaleModeOn() {
                return scaleModeOn;
            }

            return {
                isScaleRednerer: isScaleRednerer,
                turnScaleModeOn: turnScaleModeOn,
                turnScaleModeOff: turnScaleModeOff,
                isScaleModeOn: isScaleModeOn,
                isRadioRenderer:isRadioRenderer,
                get CurrentScaleQuestionId() {
                    return CurrentScaleQuestionId;
                },
                set CurrentScaleQuestionId(value) {
                    CurrentScaleQuestionId = value;
                }
            }
        })();

    return {
        Response: Response,
        Calendar: Calendar,
        DropdownHttpClient: DropdownHttpClient,        
        XMLRenderer: XMLRenderer,
        QuestionerDataStorage: QuestionerDataStorage,
        dynamicScaleManager: dynamicScaleManager
    }
})()