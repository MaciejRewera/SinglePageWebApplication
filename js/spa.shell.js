
console.log("Loading spa.shell.js");

spa.shell = (function () {
    /** Module variables **/
    var
        configMap = {
            anchorSchemaMap : {
                chat : { open : true, closed : true }
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
                '<div class="spa-shell-chat"></div>' +
                '<div class="spa-shell-modal"></div>',

            chatExtendTime : 400,
            chatExtendHeight : 450,
            chatExtendedTitle : 'Click to hide',
            chatRetractTime : 300,
            chatRetractHeight : 15,
            chatRetractedTitle : 'Click to show'

        },
        stateMap = {
            $container : null,
            anchorMap : {},
            isChatRetracted : true
        },
        jqueryMap = {},

        copyAnchorMap, changeAnchorPart,
        setJqueryMap, toggleChat,
        onHashChange, onClickChat,
        initModule;


    /** Toolkit methods **/
    copyAnchorMap = function() {
        return $.extend(true, {}, stateMap.anchorMap);
    };



    /** DOM methods **/
    setJqueryMap = function() {
        var $container = stateMap.$container;
        jqueryMap = {
            $container : $container,
            $chat : $container.find('.spa-shell-chat')
        };
    };

    toggleChat = function(doExtend, callback) {
        var
            currentChatHeight = jqueryMap.$chat.height(),
            isOpened = currentChatHeight === configMap.chatExtendHeight,
            isClosed = currentChatHeight === configMap.chatRetractHeight,
            isSliding = !isOpened && !isClosed;

        if (isSliding) return false;

        if (doExtend) {
            jqueryMap.$chat.animate(
                { height : configMap.chatExtendHeight },
                configMap.chatExtendTime,
                function() {
                    jqueryMap.$chat.attr('title', configMap.chatExtendedTitle);
                    stateMap.isChatRetracted = false;
                    if (callback) callback(jqueryMap.$chat);
                }
            );
            return true;
        }
        else {
            jqueryMap.$chat.animate(
                { height : configMap.chatRetractHeight },
                configMap.chatRetractTime,
                function() {
                    jqueryMap.$chat.attr('title', configMap.chatRetractedTitle);
                    stateMap.isChatRetracted = true;
                    if (callback) callback(jqueryMap.$chat);
                }
            );
            return true;
        }
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
                case 'open':
                    toggleChat(true);
                    break;
                case 'closed':
                    toggleChat(false);
                    break;
                default:
                    toggleChat(false);
                    delete anchorMapProposed.chat;
                    $.uriAnchor.setAnchor(anchorMapProposed, null, true);
            }
        }

        return false;
    };

    onClickChat = function(event) {
        changeAnchorPart({
            chat : (stateMap.isChatRetracted ? 'open' : 'closed')
        });
        return false;
    };


    /** Public methods **/
    initModule = function ($container) {
        stateMap.$container = $container;
        $container.html(configMap.mainHtml);
        setJqueryMap();

        jqueryMap.$chat.attr('title', configMap.chatRetractedTitle);
        jqueryMap.$chat.click(onClickChat);

        $.uriAnchor.configModule({
            schema_map : configMap.anchorSchemaMap
        });

        spa.chat.configModule( {} );
        spa.chat.initModule(jqueryMap.$chat);

        $(window)
            .bind('hashchange', onHashChange)
            .trigger('hashchange');
    };

    return { initModule : initModule };
})();
