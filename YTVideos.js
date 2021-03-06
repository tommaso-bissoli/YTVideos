var $q = $;

(function($){

  /*!
  /* YTVideos.js - https://github.com/tommaso-bissoli/YTVideos
  /* YTVideos is a jQuery plugin/wrapper for the YouTube Iframe API (YTIAPI from now on) to easy manage YouTube videos interaction in your web page.
  */

  window.YTVideos = function(options) {this.init(options);}

  // Resizeend (https://github.com/nielse63/jquery.resizeend)
  !function(a){var b=window.Chicago||{utils:{now:Date.now||function(){return(new Date).getTime()},uid:function(a){return(a||"id")+b.utils.now()+"RAND"+Math.ceil(1e5*Math.random())},is:{number:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},fn:function(a){return"function"==typeof a},object:function(a){return"[object Object]"===Object.prototype.toString.call(a)}},debounce:function(a,b,c){var d;return function(){var e=this,f=arguments,g=function(){d=null,c||a.apply(e,f)},h=c&&!d;d&&clearTimeout(d),d=setTimeout(g,b),h&&a.apply(e,f)}}},$:window.jQuery||null};if("function"==typeof define&&define.amd&&define("chicago",function(){return b.load=function(a,c,d,e){var f=a.split(","),g=[],h=(e.config&&e.config.chicago&&e.config.chicago.base?e.config.chicago.base:"").replace(/\/+$/g,"");if(!h)throw new Error("Please define base path to jQuery resize.end in the requirejs config.");for(var i=0;i<f.length;){var j=f[i].replace(/\./g,"/");g.push(h+"/"+j),i+=1}c(g,function(){d(b)})},b}),window&&window.jQuery)return a(b,window,window.document);if(!window.jQuery)throw new Error("jQuery resize.end requires jQuery")}(function(a,b,c){a.$win=a.$(b),a.$doc=a.$(c),a.events||(a.events={}),a.events.resizeend={defaults:{delay:250},setup:function(){var b,c=arguments,d={delay:a.$.event.special.resizeend.defaults.delay};a.utils.is.fn(c[0])?b=c[0]:a.utils.is.number(c[0])?d.delay=c[0]:a.utils.is.object(c[0])&&(d=a.$.extend({},d,c[0]));var e=a.utils.uid("resizeend"),f=a.$.extend({delay:a.$.event.special.resizeend.defaults.delay},d),g=f,h=function(b){g&&clearTimeout(g),g=setTimeout(function(){return g=null,b.type="resizeend.chicago.dom",a.$(b.target).trigger("resizeend",b)},f.delay)};return a.$(this).data("chicago.event.resizeend.uid",e),a.$(this).on("resize",a.utils.debounce(h,100)).data(e,h)},teardown:function(){var b=a.$(this).data("chicago.event.resizeend.uid");return a.$(this).off("resize",a.$(this).data(b)),a.$(this).removeData(b),a.$(this).removeData("chicago.event.resizeend.uid")}},function(){a.$.event.special.resizeend=a.events.resizeend,a.$.fn.resizeend=function(b,c){return this.each(function(){a.$(this).on("resizeend",b,c)})}}()});

  window.YTVideos.prototype = {

    // DEFAULT OPTIONS
    options: {
      hratio: 0.5625,
      instance: "ytInstance",
      resizeendDelay: 50,
      // placeholder mode
      placeholder: {
        ext: false,
        url: null,
        active: false
      },
      placeholderClass: "placeholder",
      // Google Analitics
      tracking: false,
      trackStates: ["playing"],
      // overlay mode
      overlay: false,
      // inject mode
      injeck: null,
      // classes
      videoWrapperClass: "videoWrapper",
      videoWrapperActiveClass: "on",
      // YouTube Iframe API events callbacks
      onYouTubeIframeAPIReady: Function(),
      onPlayerReady: Function(),
      onPlayerStateChange: Function(),
      onPlaceholderSet: Function()
    },

    // METHODS
    init: function(options){
      // console.log("init()");
      this.setOptions(options,function(){
        window[this.options.instance] = this;
        function start(){
          this.setWrapper(function(){
            if (this.options.placeholder.active) {
              this.setPlaceholder(function(){
                this.checkYouTubeIframeAPI();
              }.bind(this));
            }
            else this.checkYouTubeIframeAPI();
          }.bind(this));
        }
        if (this.options.hooks){
          this.injectHooks(function(){
            start.call(this);
          }.bind(this));
        }
        else start.call(this);
      }.bind(this));
    },
    run: function(){
      // console.log("run");
      this.injectIframes();
      if (window.dataLayer && this.options.tracking) this.setTracking();
    },
    checkYouTubeIframeAPI: function(){
      // console.log("checkYouTubeIframeAPI");
      this.setYouTubeIframeAPICallbacks();
      if (!window.yt) {
        (function() {
          var tag = document.createElement('script');
          tag.src = "https://www.YouTube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        })();
      }
      else this.run();
    },
    setOptions: function(options,callback){
      // console.log("setOptions");
      this.options = $.extend({},this.options,options);
      if (typeof callback == "function") callback();
    },
    setWrapper: function(callback){
      // console.log("setWrapper");
      $.each($('div.yt'),function(hID,hook){
        $(hook).wrap('<div class="'+this.options.videoWrapperClass+'"></div>');
      }.bind(this));
      if (typeof callback === "function") callback();
    },
    setPlaceholder: function(callback){
      // console.log("setPlaceholder");
      var placeholders_urls = [];
      var imgCounter = 0;
      // console.log("setPlaceholder");
      function fitPlaceholderH(placeholder,videoWrapper,callback){
        var h = placeholder.width()*this.options.hratio;
        placeholder.height(h);
        videoWrapper.css({
          'padding-top': h,
          position: 'relative'
        });
        this.triggerEvent('PlaceholderSet');
        if (callback === "function") callback();
      }
      function setPlaceholder(hook,placeholder){
        var videoWrapper = $(hook).parents('.'+this.options.videoWrapperClass);
        videoWrapper.css({
          overflow: 'hidden',
          height: 0
        });
        $(hook).append(placeholder);
        var placeholder = $(hook).find('.placeholder');
        placeholder.css({
          display: "block",
          width: "100%"
        });
        fitPlaceholderH.call(this,placeholder,videoWrapper,$(hook));
        $(hook).css({
          position: 'absolute',
          left: 0,
          top: 0,
          width: "100%",
          "z-index": 100
        });
        videoWrapper.css({
          overflow: 'visible',
          height: 'inherit'
        });
        $(placeholder).on('click',function(){
          this.createVideo(hook,this.getID(hook));
        }.bind(this));
        $(window).resizeend(this.options.resizeend,function(){fitPlaceholderH.call(this,placeholder,videoWrapper);}.bind(this));
      }
      function setPlaceholders(){
        $.each($('div.yt'),function(hID,hook){
          setPlaceholder.call(this,hook,$('<img src="'+placeholders_urls[hID]+'" class="'+this.options.placeholderClass+'">'));
        }.bind(this));
      }
      // One placeholder for all videos
      if (!this.options.placeholder.ext) {
        // console.log("unique placeholder");
        var placeholder = $('<img src="'+this.options.placeholder.url+'" class="'+this.options.placeholderClass+'" />');
        placeholder.on('load',function(){
          $.each($('div.yt'),function(hID,hook){
            setPlaceholder.call(this,hook,placeholder.clone());
          }.bind(this));
          placeholder.remove();
        }.bind(this));
      }
      // One placeholder per video
      else {
        // console.log("different placeholders");
        $.each($('div.yt'),function(hID,hook){
          var name = $(hook).attr('yt-name');
          placeholders_urls.push(this.options.placeholder.url+'_'+name+'.'+this.options.placeholder.ext);
        }.bind(this));
        $.each(placeholders_urls,function(id,url){
          var img = new Image();
          $(img).load(url, function(){
            imgCounter ++;
            if (imgCounter === placeholders_urls.length) setPlaceholders.call(this);
          }.bind(this));
        }.bind(this));
      }
      if (typeof callback === "function") callback();
    },
    setTracking: function(){
      // console.log("setTracking");
      this.dataLayerVideoModel = {
        'event': 'uaevent',
        'eventCategory': 'video',
        'eventAction': null,
        'eventLabel': null
      }
      this.tracking = true;
    },
    setYouTubeIframeAPICallbacks: function() {
      // console.log("setYouTubeIframeAPICallbacks");
      var instanceName = this.options.instance;
      window.onYouTubeIframeAPIReady = function(){
        // console.log("onYouTubeIframeAPIReady");
        window[instanceName].run();
        window[instanceName].triggerEvent('YouTubeIframeAPIReady');
      }
      window.onPlayerReady = function(event){
        // console.log("onPlayerReady of "+$(event.target.a).attr('yt-id'));
        if (window[instanceName].options.overlay) window[instanceName].setOverlay($(event.target.a).attr('yt-id'));
        window[instanceName].fitVideo($(event.target.a).attr('yt-id'));
        window[instanceName].triggerEvent('PlayerReady',event);
      }
      window.onPlayerStateChange = function(event){
        // console.log("onPlayerStateChange");
        window[instanceName].playerStateChange(event);
        window[instanceName].triggerEvent('PlayerStateChange',event);
      }
    },
    setOverlay: function(id){
      var iframe = $('iframe[yt-id="'+id+'"]');
      iframe.attr('style','position: relative; z-index: 0;');
      var wrapper = iframe.parent();
      wrapper.css('position','relative');
      $(wrapper).prepend('<div class="overlay"></div>');
      var overlay = $(wrapper).find('.overlay');
      overlay.css({
        position: "absolute",
        "z-index": 1,
        width: "100%",
        height: "100%",
        left: 0,
        top: 0
      });
      $(overlay).on('click',function(e){
        this.playPauseVideo(id,true);
      }.bind(this));
    },
    getPlayerVars: function(vars) {
      // console.log("getPlayerVars");
      if (vars != undefined) {
        var playerVars = {};
        var checkParam = function(array){
          if (
            array[0] != "color" &&
            array[0] != "hl" &&
            array[0] != "list" &&
            array[0] != "listType" &&
            array[0] != "origin" &&
            array[0] != "playlist"
          ) {
            array[1] = parseInt(array[1]);
          }
          return array[1];
        }
        if (vars.indexOf(',') > 0 ) {
          var varsObj = vars.split(",");
          $.each(varsObj,function(id,option){
            var optionArr = option.split("|");
            playerVars[optionArr[0]] = checkParam(optionArr);
          });
        }
        else {
          var option = vars.split("|");
          playerVars[option[0]] =checkParam(option);
        }
        return playerVars;
      }
      else return vars;
    },
    getID: function(hook){
      // console.log("getID");
      return $(hook).attr('yt-id');
    },
    triggerEvent: function(eventName,event){
      // console.log("triggerEvent");
      this.options['on'+eventName].call(this,event);
    },
    injectHooks: function(callback){
      // console.log("injectHooks");
      $.each(this.options.hooks,function(id,obj){
        $.each(obj.ids,function(vidID,vid){
          var hook = $('<div class="yt" id="'+vid+'" yt-id="'+vid+'" yt-w="100%"></div>');
          $.each(obj.options,function(attr,val){
            $(hook).attr('yt-'+attr,val);
          }.bind(this));
          $(obj.target).append(hook);
        }.bind(this));
      }.bind(this));
      if (typeof callback === "function") callback();
    },
    injectIframes: function(){
      window.ytvideos = {};
      // if placeholder but with autoplay
      if (this.options.placeholder.active) {
        $.each($('div.yt'),function(hID,hook){
          var playerVars = this.getPlayerVars($(hook).attr('yt-vars'));
          if (playerVars  && playerVars.autoplay) this.createVideo(hook,this.getID(hook));
        }.bind(this));
      }
      // without placeholder
      else {
        $.each($('div.yt'),function(hID,hook){
          this.createVideo(hook,this.getID(hook));
        }.bind(this));
      }
    },
    createVideo: function(video,id){
      var idSuffix = $(video).attr('yt-suffix');
      var finalID = idSuffix ? id+idSuffix : id;
      var playerOptions = {
        height: $(video).attr('yt-h'),
        width: $(video).attr('yt-w'),
        videoId: $(video).attr('yt-id'),
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      };
      var playerVars = this.getPlayerVars($(video).attr('yt-vars'));
      if (playerVars != "") playerOptions.playerVars = playerVars;
      $(video).parents('.'+this.options.videoWrapperClass).addClass(this.options.videoWrapperActiveClass);
      window.ytvideos[$(video).attr('yt-id')] = new YT.Player(finalID, playerOptions);
    },
    fitVideo: function(id){
      var video = $('iframe[yt-id="'+id+'"]');
      video.css({
        display: 'block',
        height: $(video).width()*this.options.hratio
      });
      video.parents('.'+this.options.videoWrapperClass).css({
        'padding-top': 0
      });
      $(window).resizeend(this.options.resizeendDelay,function(){
        this.fitVideo(this.getID(video));
      }.bind(this));
    },
    playerStateChange: function(event){
      // console.log("playerStateChange()");
      var id = $(event.target.a).attr('yt-id');
      switch (event.data) {
        // unstarted
        case -1:
          // console.log(id+" unstarted");
          break;
        // ended
        case 0:
          // console.log(id+" ended");
          break;
        // playing
        case 1:
          // console.log(id+" playing");
          this.playPauseVideo(id);
          break;
        // paused
        case 2:
          // console.log(id+" paused");
          this.playPauseVideo(id);
          break;
        // buffering
        case 3:
          // console.log(id+" buffering");
          break;
        // cued
        case 5:
          // console.log(id+" cued");
          break;
      }
      if (this.options.trackStates.indexOf(event.data) > -1) this.track(event,event.data);
    },
    playPauseVideo: function(currentID,overlay){
      // console.log("playPauseVideo() of "+currentID);
      $.each(window.ytvideos,function(vID,video){
        // manage play or pause on selected video
        if (currentID === vID) {
          switch (video.getPlayerState()) {
            // unstarted
            case -1:
              // console.log(currentID+' unstarted');
              if (this.hasOverlay(vID)) this.removeOverlay(vID);
              video.playVideo();
              break;
            // played
            case 1:
              // console.log(currentID+' unstarted');
              if (this.hasOverlay(vID)) this.removeOverlay(vID);
              video.playVideo();
              break;
            // paused
            case 2:
              // console.log(currentID+' paused');
              if (!this.hasOverlay(vID)) {
                this.setOverlay(vID);
                this.fitVideo(currentID);
              }
              if (overlay) {
                if (this.hasOverlay(vID)) this.removeOverlay(vID);
                video.playVideo();
              }
              break;
            // video is cued
            case 5:
              // console.log(currentID+' cued');
              if (this.hasOverlay(vID)) this.removeOverlay(vID);
              video.playVideo();
              break;
          }
        }
        // otherwise checks other video to stop them if playing
        else {
          if (video.getPlayerState() === 1 && window.ytvideos[currentID].getPlayerState() === 1) {
            // console.log(vID+' (not current) is playing while '+currentID+' (current) is playing');
            if (!this.hasOverlay(vID)) this.setOverlay(vID);
            this.fitVideo(vID);
            video.pauseVideo();
          }
        }
      }.bind(this));
    },
    track: function(eventObj,eventName){
      // console.log("track");
      var id = $(eventObj.target.a).data('yt-id');
      var track = $(eventObj.target.a).data('yt-track');
      var data = this.dataLayerVideoModel;
      var eventLabel = (track) ? track : id;
      data.eventAction = eventName;
      data.eventLabel = id + " | " + eventLabel;
      dataLayer.push(data);
    },
    hasOverlay: function(id){
      // console.log("hasOverlay is ");
      var presence = $('iframe[yt-id="'+id+'"]').siblings('.overlay').length > 0 ? true : false;
      return presence;
    },
    removeOverlay: function(id){
      // console.log("removeOverlay");
      $('iframe[yt-id="'+id+'"]').siblings('.overlay').remove();
    }

  }

})($q);
