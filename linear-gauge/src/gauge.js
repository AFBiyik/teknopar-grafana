/*
Copyright (c) 2018 by Hyyan Abo Fakher (https://codepen.io/hyyan/pen/yXrMpb)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files 
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, 
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION 
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function (LinearGauge) {

    'use strict';

    LinearGauge.LinearGauge = LinearGauge.LinearGauge || {};

    // constructor
    LinearGauge.LinearGauge = function ( canvas, inputLow, inputHigh, horizontal, color, pointerHeight, width, height, borderwidth) {

        this.horizontal = horizontal;
        this.canvas = canvas;
        this.inputLow = inputLow;
        this.inputHigh = inputHigh;
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.pointerColor = color;
        this.pointerHeight = pointerHeight;
        this.borderwidth = borderwidth;

    }

    LinearGauge.LinearGauge.prototype = {

        constructor: LinearGauge.LinearGauge,

        updateInit( inputLow, inputHigh, horizontal, color ) {

            this.horizontal = horizontal;
            this.inputLow = inputLow;
            this.inputHigh = inputHigh;
            this.pointerColor = color;
        },
        updateSize(width, height, pointerHeight, borderwidth ){
            this.canvasWidth = width;
            this.canvasHeight = height;
            this.pointerHeight = pointerHeight;
            this.borderwidth = borderwidth;
        },
        translateRange: function (
            Input, inputHigh, inputLow, outputHigh, outputLow
        ) {

            inputHigh = inputHigh ? inputHigh : this.inputHigh;
            inputLow = inputLow ? inputLow : this.inputLow;

            outputHigh = outputHigh ? outputHigh : 1;
            outputLow = outputLow ? outputLow : 0;

            return ((Input - inputLow) / (inputHigh - inputLow)) *
                (outputHigh - outputLow) + outputLow;
        },
        updatePointer: function ( nextValue ) {

            var ctx = this.canvas.getContext("2d");
            var x1 = 0, x2 = 0, y1 = 0, y2 = 0;
            ctx.fillStyle = this.pointerColor;

            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);


            if (this.horizontal) {
                x1 = this.borderwidth;
                y1 = this.borderwidth;

                x2 = this.translateRange(
                    nextValue,
                    this.inputHigh,
                    this.inputLow,
                    this.canvasWidth - this.borderwidth,
                    0
                );
                y2 = this.pointerHeight;

            }
            else {
                x1 = this.borderwidth;
                y1 = this.translateRange(
                    nextValue,
                    this.inputHigh,
                    this.inputLow,
                    this.borderwidth,
                    this.canvasHeight
                );

                x2 = this.pointerHeight;
                y2 = this.canvasHeight - y1;

            }

            ctx.fillRect(x1,y1,x2,y2);

        }
    }
}(window.LinearGauge = window.LinearGauge || {}));

