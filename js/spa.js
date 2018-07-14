console.log("Loading spa.js");

var spa = (function() {
    var init = function($container) {
        spa.shell.initShell($container);
    };

    return { init: init};
})();
