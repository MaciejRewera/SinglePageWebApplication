
console.log("Loading spa.util.js");

spa.util = (function () {
    var createError, setConfigMap;

    createError = function (name_text, msg_text, data) {
        var error = new Error();
        error.name = name_text;
        error.message = msg_text;

        if (data) { error.data = data; }

        return error;
    };

    setConfigMap = function (arg_map) {
        var
            input_map = arg_map.input_map,
            settable_map = arg_map.settable_map,
            config_map = arg_map.config_map,
            key_name, error
        ;

        for (key_name in input_map) {
            if (input_map.hasOwnProperty(key_name)) {
                if (settable_map.hasOwnProperty(key_name))
                    config_map[key_name] = input_map[key_name];
            }
            else {
                error = createError('Wrong input data',
                    'Configuration key |' + key_name + "| is not supported");
                throw error;
            }
        }
    };

    return {
        createError : createError,
        setConfigMap : setConfigMap
    };

})();