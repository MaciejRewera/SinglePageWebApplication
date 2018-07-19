
console.log("Loading spa.shell.js");

spa.shell = (function () {
    /** Module variables **/
    var
        configMap = {
            anchorSchemaMap : {
                chat : { opened : true, closed : true }
            },
            mainHtml : String() +
                '<div class="spa-shell-head">' +
                    '<div class="spa-shell-head-logo"></div>' +
                    '<div class="spa-shell-head-account"></div>' +
                    '<div class="spa-shell-head-search"></div>' +
                '</div>' +
                '<div class="spa-shell-main">' +
                    '<div class="spa-shell-main-nav"></div>' +
                    '<div class="spa-shell-main-content"></div>' +
                '</div>' +
                '<div class="spa-shell-foot"></div>' +
                '<div class="spa-shell-modal"></div>',
        },
        stateMap = { anchorMap : {} },
        jqueryMap = {},

        copyAnchorMap, changeAnchorPart,
        setJqueryMap, onHashChange,
        setChatAnchor, initModule;


    /** Toolkit methods **/
    copyAnchorMap = function() {
        return $.extend(true, {}, stateMap.anchorMap);
    };



    /** DOM methods **/
    setJqueryMap = function() {
        var $container = stateMap.$container;
        jqueryMap = { $container : $container };
    };

    changeAnchorPart = function(argMap) {
        var
            anchorMapRevise = copyAnchorMap(),
            returnBoolean = true,
            keyName, keyNameDependent;

        KEYVAL:
        for (keyName in argMap) {
            if (argMap.hasOwnProperty(keyName)) {
                // Jump over dependent keys
                if (keyName.indexOf('_') === 0) continue KEYVAL;

                // Updating key independent part
                anchorMapRevise[keyName] = argMap[keyName];

                // Updating dependent key
                keyNameDependent = '_' + keyName;
                if (argMap[keyNameDependent]) {
                    anchorMapRevise[keyNameDependent] = argMap[keyNameDependent];
                }
                else {
                    delete anchorMapRevise[keyNameDependent];
                    delete anchorMapRevise['_s' + keyNameDependent];
                }
            }
        }

        try {
            $.uriAnchor.setAnchor(anchorMapRevise);
        }
        catch(error) {
            $.uriAnchor.setAnchor(stateMap.anchorMap, null, true);
            returnBoolean = false;
        }

        return returnBoolean;
    };


    /** Event-handling methods **/
    onHashChange = function(event) {
        var
            anchorMapPrevious = copyAnchorMap(),
            isOk = true,
            anchorMapProposed,
            _s_chatPrevious, _s_chatProposed,
            s_chatProposed;

        try {
            anchorMapProposed = $.uriAnchor.makeAnchorMap();
        }
        catch(error) {
            $.uriAnchor.setAnchor(anchorMapPrevious, null, true);
            return false;
        }
        stateMap.anchorMap = anchorMapProposed;

        _s_chatPrevious = anchorMapPrevious._s_chat;
        _s_chatProposed = anchorMapProposed._s_chat;

        if ( !anchorMapPrevious || _s_chatPrevious !== _s_chatProposed ) {
            s_chatProposed = anchorMapProposed.chat;

            switch (s_chatProposed) {
                case 'opened':
                    isOk = spa.chat.setSliderPosition('opened');
                    break;
                case 'closed':
                    isOk = spa.chat.setSliderPosition('closed');
                    break;
                default:
                    toggleChat(false);
                    delete anchorMapProposed.chat;
                    $.uriAnchor.setAnchor(anchorMapProposed, null, true);
            }
        }

        // Restore the anchor if slider change was denied
        if ( !isOk ) {
            if (anchorMapPrevious) {
                $.uriAnchor.setAnchor(anchorMapPrevious, null, true);
                stateMap.anchorMap = anchorMapPrevious;
            }
            else {
                delete anchorMapProposed.chat;
                $.uriAnchor.setAnchor(anchorMapProposed, null, true);
            }
        }

        return false;
    };


    /** Callback methods **/
    setChatAnchor = function(position_type) {
        return changeAnchorPart({ chat : position_type });
    };


    /** Public methods **/
    initModule = function ($container) {
        stateMap.$container = $container;
        $container.html(configMap.mainHtml);
        setJqueryMap();

        $.uriAnchor.configModule({
            schema_map : configMap.anchorSchemaMap
        });

        spa.chat.configModule({
            set_chat_anchor : setChatAnchor,
            chat_model : spa.model.chat,
            people_model : spa.model.people
        });
        spa.chat.initModule(jqueryMap.$container);

        $(window)
            .bind('hashchange', onHashChange)
            .trigger('hashchange');
    };

    return { initModule : initModule };
})();
