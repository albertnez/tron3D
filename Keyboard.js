function KeyboardJS (debug, preventer) {
    this.keys = [];
    this.char = function(x) { return this.keys[x.charCodeAt(0)]; }
    this.debug = debug;
    var scope = this;
    document.addEventListener("keydown", function (evt) {
        scope.keys[evt.keyCode] = true;
        if (scope.debug) console.log('-- keyIsDown ASCII('+evt.keyCode+') CHAR('+String.fromCharCode(evt.keyCode)+')');
        if (preventer) preventer(evt);
    });
    document.addEventListener("keyup", function (evt) {
        scope.keys[evt.keyCode] = false;
        if (scope.debug) console.log('-- keyIsUp ASCII('+evt.keyCode+') CHAR('+String.fromCharCode(evt.keyCode)+')');
        if (preventer) preventer(evt);
    });
    if (scope.debug) console.log("keyboardJS inited", "keyboardJS");
}