console.log("Loading spa.js");

var spa = (function() {
    var init = function($container) {
        spa.shell.initModule($container);
    };

    return { init : init };
})();
