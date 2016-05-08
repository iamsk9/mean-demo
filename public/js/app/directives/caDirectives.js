Caweb.directive('pdf', function() {
    var containerId = "pdf-" + Math.floor(Math.random() * 100000000);
    return {
        restrict : 'E',
        template : '<div class = "overlay"></div><div class = "gallery-container" ><span class = "close" ng-click = "close()"><md-icon md-font-icon="fa-times" class = "fa fa-2x"></md-icon></span><div id= "' + containerId +'" class = "pdf"></div>',
        link : function(scope, element, attrs) {
            if(attrs.onclose != undefined) {
                scope.close = function(){
                    scope.$eval(attrs.onclose)();
                }
            }
            if(attrs.url != undefined && attrs.url != "") {    
                var success = new PDFObject({
                    url : attrs.url,
                    pdfOpenParams: {
                        navpanes: 0,
                        toolbar: 0,
                        statusbar: 0,
                        view: "FitV"
                    }
                }).embed(containerId);
            }
        }
    }
});

Caweb.directive('galleryImage', function() {
    var containerId = "image-" + Math.floor(Math.random() * 100000000);
    return {
        retrict : 'E',
        template : '<div class = "overlay"></div><div class = "gallery-container"><span class = "close" ng-click = "close()"><md-icon md-font-icon="fa-times" class = "fa fa-2x"></md-icon></span><div class = "image-wrapper"><img ng-src = "[[url]]"/></div></div>',
        link : function(scope, element, attrs) {
            if(attrs.onclose != undefined) {
                scope.close = function(){
                    scope.$eval(attrs.onclose)();
                }
            }
            if(attrs.url != undefined && attrs.url != "") {
                scope.url = attrs.url;
            }
        }
    }
});

Caweb.directive('dateFix', function() {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ngModel) {
            var toView = function(val) {
                return val;
            };

            var toModel = function(val) {
                var offset = moment(val).utcOffset();
                var date = new Date(moment(val).add(offset, 'm'));
                return date;
            };

            ngModel.$formatters.unshift(toView);
            ngModel.$parsers.unshift(toModel);
        }
    };
});