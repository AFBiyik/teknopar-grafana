"use strict";

System.register([], function (_export, _context) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            (function (LinearGauge) {

                'use strict';

                LinearGauge.LinearGauge = LinearGauge.LinearGauge || {};

                // constructor
                LinearGauge.LinearGauge = function (canvas, inputLow, inputHigh, horizontal, color, pointerHeight, width, height, borderwidth) {

                    this.horizontal = horizontal;
                    this.canvas = canvas;
                    this.inputLow = inputLow;
                    this.inputHigh = inputHigh;
                    this.canvasWidth = width;
                    this.canvasHeight = height;
                    this.pointerColor = color;
                    this.pointerHeight = pointerHeight;
                    this.borderwidth = borderwidth;
                };

                LinearGauge.LinearGauge.prototype = {

                    constructor: LinearGauge.LinearGauge,

                    updateInit: function updateInit(inputLow, inputHigh, horizontal, color) {

                        this.horizontal = horizontal;
                        this.inputLow = inputLow;
                        this.inputHigh = inputHigh;
                        this.pointerColor = color;
                    },
                    updateSize: function updateSize(width, height, pointerHeight, borderwidth) {
                        this.canvasWidth = width;
                        this.canvasHeight = height;
                        this.pointerHeight = pointerHeight;
                        this.borderwidth = borderwidth;
                    },

                    translateRange: function translateRange(Input, inputHigh, inputLow, outputHigh, outputLow) {

                        inputHigh = inputHigh ? inputHigh : this.inputHigh;
                        inputLow = inputLow ? inputLow : this.inputLow;

                        outputHigh = outputHigh ? outputHigh : 1;
                        outputLow = outputLow ? outputLow : 0;

                        return (Input - inputLow) / (inputHigh - inputLow) * (outputHigh - outputLow) + outputLow;
                    },
                    updatePointer: function updatePointer(nextValue) {

                        var ctx = this.canvas.getContext("2d");
                        var x1 = 0,
                            x2 = 0,
                            y1 = 0,
                            y2 = 0;
                        ctx.fillStyle = this.pointerColor;

                        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                        if (this.horizontal) {
                            x1 = this.borderwidth;
                            y1 = this.borderwidth;

                            x2 = this.translateRange(nextValue, this.inputHigh, this.inputLow, this.canvasWidth - this.borderwidth, 0);
                            y2 = this.pointerHeight;
                        } else {
                            x1 = this.borderwidth;
                            y1 = this.translateRange(nextValue, this.inputHigh, this.inputLow, this.borderwidth, this.canvasHeight);

                            x2 = this.pointerHeight;
                            y2 = this.canvasHeight - y1;
                        }

                        ctx.fillRect(x1, y1, x2, y2);
                    }
                };
            })(window.LinearGauge = window.LinearGauge || {});
        }
    };
});
//# sourceMappingURL=gauge.js.map
