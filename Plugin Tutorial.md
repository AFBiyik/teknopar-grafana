## Introduction

In this tutorial I will show you how to develop Grafana panel plugins with using datasources by developing basic linear gauge plugin.

If you want to see finished version of linear gauge check [github](linear-gauge).

1. [gauge.js](#gaugejs)
2. [module.html](#modulehtml)
3. [module.js](#modulejs)
4. [gauge_ctrl.js](#gauge_ctrljs)
	1. [Imports](#imports)
	2. [Panel Defaults](#panel-defaults)
	3. [Class](#class)
	4. [Constructor](#constructor)
	5. [Link](#link)
	6. [Add Canvas](#add-canvas)
	7. [Data Recieved](#data-recieved)
	8. [Render](#render)
	9. [Set Element Sizes](#set-element-sizes)
	10. [Finished](#finished)
5. [Making Panel Useful](#making-panel-useful)
	1. [Update Init](#update-init)
	2. [editor.html](#editorhtml)
6. [More Features: Aggregations](#more-features-aggregations)
7. [Conclusion](#conclusion)
	
	


## Before Stating
I assume you already read [part 1](https://grafana.com/blog/2016/04/08/timing-is-everything.-writing-the-clock-panel-plugin-for-grafana-3.0/) and [part 2](https://grafana.com/blog/2016/04/15/timing-is-everything.-editor-mode-in-grafana-3.0-for-the-clock-panel-plugin/) of plugin development tutorial and you know how to compile and run Grafana plugins. 

## Getting Started
**Some advice:** Before begin to develop Grafana plugin, know what you want to do. 
If you want to use JavaScript functions to generate graphs or stats, begin development with these functions. 
You can modify these functions later. It’s hard to start plugin development without knowing how to use data. 

Therefore I begin with gauge.js which prints a rectangle on canvas object.

### gauge.js
I took [linear gauge JavaScript](https://medium.com/hyyanaf/building-html-5-javascript-linear-gauge-fabcc1f480bc) from [Hyyan Abo Fakher](https://medium.com/hyyanaf) and changed to use in Grafana. 
Added “updateInit” and “updateSize” functions to change properties of gauge like color and size. 
I separated “updateSize” function since I don’t want to set every property when only panel size is changed. 
I also renamed “drawPointer” to “updatePointer” since I only want one pointer extend to handle vertical or horizontal gauge.

```javascript
(function (LinearGauge) {

    'use strict';

    LinearGauge.LinearGauge = LinearGauge.LinearGauge || {};

    // constructor
    LinearGauge.LinearGauge = function ( canvas, inputLow, inputHigh, horizontal, 
                                         color, pointerHeight, width, height) {

        this.horizontal = horizontal;
        this.canvas = canvas;
        this.inputLow = inputLow;
        this.inputHigh = inputHigh;
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.pointerColor = color;
        this.pointerHeight = pointerHeight;

    }

    LinearGauge.LinearGauge.prototype = {

        constructor: LinearGauge.LinearGauge,

        updateInit( inputLow, inputHigh, horizontal, color ) {

            this.horizontal = horizontal;
            this.inputLow = inputLow;
            this.inputHigh = inputHigh;
            this.pointerColor = color;
        },
        updateSize(width, height, pointerHeight ){
            this.canvasWidth = width;
            this.canvasHeight = height;
            this.pointerHeight = pointerHeight;
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
                x1 = 0;
                y1 = 0;

                x2 = this.translateRange(
                    nextValue,
                    this.inputHigh,
                    this.inputLow,
                    this.canvasWidth,
                    0
                );
                y2 = this.pointerHeight;

            }
            else {
                x1 = 0;
                y1 = this.translateRange(
                    nextValue,
                    this.inputHigh,
                    this.inputLow,
                    0,
                    this.canvasHeight
                );

                x2 = this.pointerHeight;
                y2 = this.canvasHeight - y1;

            }

            ctx.fillRect(x1,y1,x2,y2);

        }
    }
}(window.LinearGauge = window.LinearGauge || {}));
```

### module.html
I wrote only container div and back div. Back div is simple background of gauge. Canvas will be added to back div in controller javascript.

```html
<div class="container">
    <div class="back"></div>
</div>
```
We can add css files seperately or directly in module.html.
```html
<style>
    .container{
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .back{
        display: flex;
        align-items: center;
        justify-content: center;

    }
</style>
```

### module.js
We need to import our controller and export as PanelCtrl.

```javascript
import { GaugeLinearCtrl } from './gauge_Ctrl';

export { GaugeLinearCtrl as PanelCtrl };
```

### gauge_ctrl.js
This javascript file controls our panel and also links other files.

#### Imports
```javascript
import {MetricsPanelCtrl} from 'app/plugins/sdk';
import d3 from 'd3';
import _ from 'lodash';
import TimeSeries from 'app/core/time_series';
import g from './gauge';
```
* MerticsPanelCtrl is class to get data from datasource. 
* d3 is used for adding canvas to module.html.
* lodash is used to set defaults.
* TimeSeries is used to map data we get from datasorce.
* gauge is our linear gauge javascript.

#### Panel Defaults
We need panel defaults to set properties of our panel like color, width, height, mode, etc. 
I wrote properties of our gauge in gauge object.

```javascript
const panelDefaults = {

  gauge : {
    mode: 'Vertical',
    bgColor: 'gray',
    pointerColor: 'green',
    pointerHeight: 20,
    inputLow: 0,
    inputHigh: 100,
    height:0,
    width:0,
    canvasWidth: 30
  }
};
```

#### Class
It has a name "GaugeLinearCtrl" and it has to extent “MetricsPanelCtrl” since we want to use data source. 

```javascript
export class GaugeLinearCtrl extends MetricsPanelCtrl {
...
}
```

#### Constructor
We need to have constructor which calls super constructor, set defaults and set events basically.

```javascript
export class GaugeLinearCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector ) {
    super($scope, $injector);

    _.defaults(this.panel, panelDefaults);
    
    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
}
```
Events are essential to handle data. "render" renders our panel whenever something changes like size.
"data-received" handle data when it is received. "data-snapshot-load" handles snapshot data which uses data-received.
More information about [events](http://docs.grafana.org/plugins/developing/development/#grafana-events).

#### Link
This function links our controller to modeule.html. We set $panelContainer and $panelCtrl objects. These objects are JQuery objects and we can use JQuery functions.

```javascript
    link(scope, elem, attrs, ctrl) {
        this.$panelContainer = elem.find('.panel-container');
        this.$panelContoller = ctrl;

        ...
```
Then I set width and height of back div.

```javascript
    link(scope, elem, attrs, ctrl) {
        this.$panelContainer = elem.find('.panel-container');
        this.$panelContoller = ctrl;

        this.$panelContainer.find('.back').css( 'width', this.panel.gauge.width);
        this.$panelContainer.find('.back').css('height', this.panel.gauge.height);
        this.$panelContainer.find('.back').css( 'background-color', this.panel.gauge.bgColor );

        ...
```
We need a canvas to create gauge so I call addCanvas function to create canvas and after that I initialize gauge object.

```javascript
    link(scope, elem, attrs, ctrl) {
        this.$panelContainer = elem.find('.panel-container');
        this.$panelContoller = ctrl;

        this.$panelContainer.find('.back').css( 'width', this.panel.gauge.width);
        this.$panelContainer.find('.back').css('height', this.panel.gauge.height);
        this.$panelContainer.find('.back').css( 'background-color', this.panel.gauge.bgColor );

        this.addCanvas();

        this.gauge = new LinearGauge.LinearGauge( this.$canvas, this.panel.gauge.inputLow, this.panel.gauge.inputHigh, 
                                                  this.panel.gauge.mode === 'Horizontal', this.panel.gauge.pointerColor, 
                                                  this.panel.gauge.pointerHeight, this.panel.gauge.width, 
                                                  this.panel.gauge.height);

    }
```
#### Add Canvas
We create our canvas in here using d3.

```javascript
 addCanvas(){
 
    var $back = this.$panelContainer.find('.back');

    this.canvas = d3.select( $back[0] )
      .insert('canvas', ':first-child')
      .attr('width', this.panel.gauge.width)
      .attr('height', this.panel.gauge.height);

    this.$canvas = this.canvas.node();

  }
```

#### Data Recieved
I use series handler which maps series data. If you also want to handle table data, you should write table handler. You can check data type by datalist\[\# of data].type === 'table'. After seriesHandler sets our data, I call render.

```javascript
    onDataReceived(dataList) {
     this.series = dataList.map( GaugeLinearCtrl.seriesHandler.bind(this));

     this.render();
    }
  
```
It creates time series and returns that object.

```javascript
    static seriesHandler(seriesData) {

        var series = new TimeSeries({
            datapoints: seriesData.datapoints,
            alias: seriesData.target
        });

        series.flotpairs = series.getFlotPairs("connected");

        return series;
    }
```

#### Render
This function is called when panel needs to be rendered again. (e.g. size of panel is changed) 
First I set dimensions of elements. Then I checked series.
It’s important to check series initialized or not because it can cause crash the panel. 
I use only one series so we only look at series\[0] but if you want to use multiple series, you can use \_.each function(see [lodash](https://lodash.com/docs/)).Then I take last data. To do that I write "s.datapoints\[s.datapoints.length - 1]\[0];" and also time of this data in “s.datapoints[s.datapoints.length - 1][1];“ but I don’t need time for this plugin. Now we have data. I just pass it to gauge.js

```javascript
 onRender(){
 
    this.setElementSizes();

    if (!this.series){
      return;
    }

    if (!this.series[0] ){
      return;
    }

    var s = this.series[0];
    var value = s.datapoints[s.datapoints.length - 1][0];

    this.gauge.updatePointer( Math.round(value) );

  }
```

#### Set Element Sizes
This function sets elements dimensions.

```Javascript
  setElementSizes(){

    var mode = this.panel.gauge.mode == 'Horizontal'; 

    var size = this.panel.gauge.canvasWidth;
    
    ...
```
There are two possibilities for this gauge. It's either horizontal or vertical. I handle these cases, and set width and height of gauge defaults.

```javascript
  setElementSizes(){

    var mode = this.panel.gauge.mode == 'Horizontal'; 

    var size = this.panel.gauge.canvasWidth;
    
    if (mode){
      this.panel.gauge.width = this.$panelContainer.find('.container').width();
      this.panel.gauge.height = size;
      this.panel.gauge.pointerHeight = this.panel.gauge.height;
    }
    else{
      this.panel.gauge.width = size;
      this.panel.gauge.height = this.height-20; // bottom gap
      this.panel.gauge.pointerHeight = this.panel.gauge.width;
    }
    
    ...
```
After that, I check canvas dimensions and if they're changed, I set canvas' new dimensions. Then I set background dimensions and finally call updateSize funtion of gauge object to set new dimensions.

```javascript
  setElementSizes(){

    var mode = this.panel.gauge.mode == 'Horizontal'; 

    var size = this.panel.gauge.canvasWidth;
    
    if (mode){
      this.panel.gauge.width = this.$panelContainer.find('.container').width();
      this.panel.gauge.height = size;
      this.panel.gauge.pointerHeight = this.panel.gauge.height;
    }
    else{
      this.panel.gauge.width = size;
      this.panel.gauge.height = this.height-20; // bottom gap
      this.panel.gauge.pointerHeight = this.panel.gauge.width;
    }
   
    if ( this.$canvas.width != this.panel.gauge.width)
      this.$canvas.width = this.panel.gauge.width;
    if (this.$canvas.height != this.panel.gauge.height)
      this.$canvas.height = this.panel.gauge.height;
      
    this.$panelContainer.find('.back').css( 'width', this.panel.gauge.width);
    this.$panelContainer.find('.back').css('height', this.panel.gauge.height);

    this.gauge.updateSize( this.panel.gauge.width , this.panel.gauge.height, this.panel.gauge.pointerHeight);
  }
```

#### Finished
We have only these function for now. We can extend code later but this code is enough to give us a working linear gauge. Now close the class and don't forget to set template url. After you combine the code gauge_ctrl.js should look like this:
```javascript
import {MetricsPanelCtrl} from 'app/plugins/sdk';
import d3 from 'd3';
import _ from 'lodash';
import TimeSeries from 'app/core/time_series';
import g from './gauge';

const panelDefaults = {

  gauge : {
    mode: 'Vertical',
    bgColor: 'gray',
    pointerColor: 'green',
    pointerHeight: 20,
    inputLow: 0,
    inputHigh: 100,
    height:0,
    width:0,
    canvasWidth: 30
  }
};

export class GaugeLinearCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector ) {
    super($scope, $injector);

    _.defaults(this.panel, panelDefaults);

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
  }
  
  link(scope, elem, attrs, ctrl) {
    this.$panelContainer = elem.find('.panel-container');
    this.$panelContoller = ctrl;

    this.$panelContainer.find('.back').css( 'width', this.panel.gauge.width);
    this.$panelContainer.find('.back').css('height', this.panel.gauge.height);
    this.$panelContainer.find('.back').css( 'background-color', this.panel.gauge.bgColor );

    this.addCanvas();

    this.gauge = new LinearGauge.LinearGauge( this.$canvas, this.panel.gauge.inputLow, this.panel.gauge.inputHigh, 
                                              this.panel.gauge.mode === 'Horizontal', this.panel.gauge.pointerColor, 
                                              this.panel.gauge.pointerHeight, this.panel.gauge.width, 
                                              this.panel.gauge.height);

  }
  
  addCanvas(){
 
    var $back = this.$panelContainer.find('.back');

    this.canvas = d3.select( $back[0] )
      .insert('canvas', ':first-child')
      .attr('width', this.panel.gauge.width)
      .attr('height', this.panel.gauge.height);

    this.$canvas = this.canvas.node();

  }
  
  onDataReceived(dataList) {
     this.series = dataList.map( GaugeLinearCtrl.seriesHandler.bind(this));

     this.render();
  }
  
  static seriesHandler(seriesData) {

        var series = new TimeSeries({
            datapoints: seriesData.datapoints,
            alias: seriesData.target
        });

        series.flotpairs = series.getFlotPairs("connected");

        return series;
  }
  
  onRender(){
 
    this.setElementSizes();

    if (!this.series){
      return;
    }

    if (!this.series[0] ){
      return;
    }

    var s = this.series[0];
    var value = s.datapoints[s.datapoints.length - 1][0];

    this.gauge.updatePointer( Math.round(value) );

  }
  
  setElementSizes(){

    var mode = this.panel.gauge.mode == 'Horizontal'; 

    var size = this.panel.gauge.canvasWidth;
    
    if (mode){
      this.panel.gauge.width = this.$panelContainer.find('.container').width();
      this.panel.gauge.height = size;
      this.panel.gauge.pointerHeight = this.panel.gauge.height;
    }
    else{
      this.panel.gauge.width = size;
      this.panel.gauge.height = this.height-20; // bottom gap
      this.panel.gauge.pointerHeight = this.panel.gauge.width;
    }
   
    if ( this.$canvas.width != this.panel.gauge.width)
      this.$canvas.width = this.panel.gauge.width;
    if (this.$canvas.height != this.panel.gauge.height)
      this.$canvas.height = this.panel.gauge.height;
      
    this.$panelContainer.find('.back').css( 'width', this.panel.gauge.width);
    this.$panelContainer.find('.back').css('height', this.panel.gauge.height);

    this.gauge.updateSize( this.panel.gauge.width , this.panel.gauge.height, this.panel.gauge.pointerHeight);
  }
  
}

GaugeLinearCtrl.templateUrl = 'module.html';
```

## Making Panel Useful
To make panel useful we can change color, range, mode, width of gauge, etc. Therefore, we need to add edit options. You can read more about editor in [here](http://docs.grafana.org/plugins/developing/defaults-and-editor-mode/). To do this we need to add edit event to constructor:
```javascript
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
```
And onInitEditMode funtion which binds editor html:
```javascript
  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/grafana-gauge-panel/editor.html', 2);
  }
```
Also we need a funtion to call when we change a property. I added updateInit function for this.

#### Update Init
This function re-initialize our gauge and background. Then call render.

```javascript
  updateInit(){
    this.$panelContainer.find('.back').css( 'background-color', this.panel.gauge.bgColor );

    this.gauge.updateInit( this.panel.gauge.inputLow, this.panel.gauge.inputHigh, this.panel.gauge.mode == 'Horizontal', 
                           this.panel.gauge.pointerColor, this.panel.gauge.pointerHeight );
    this.render();
  }
```

#### editor.html
It's options tab in edit mode. "editor-row" is includes whole tab. "section gf-form-group" is column. "section-heading" is column heading. "gf-form" is option. We can select options (selects from an array), color picker (spectrum picker) or input (We can set type of input like number or text).
```html
<div class="editor-row">
        <div class="section gf-form-group">
                <h5 class="section-heading">Panel Options</h5>
                <div class="gf-form">
                        <label class="gf-form-label width-9">Gauge Mode</label>
                        <div class="gf-form-select-wrapper max-width-10">
                                <select class="input-medium gf-form-input" ng-model="ctrl.panel.gauge.mode" ng-options="t for t in ['Horizontal', 'Vertical']" ng-change="ctrl.updateInit()"></select>
                        </div>
                 </div>
        </div>
        <div class="section gf-form-group">
                <h5 class="section-heading">Color Options</h5>
                <div class="gf-form">
                        <label class="gf-form-label width-9">Background Color</label>
                        <span class="max-width-10">
                                <spectrum-picker class="gf-form-input" ng-model="ctrl.panel.gauge.bgColor" ng-change="ctrl.updateInit()" ></spectrum-picker>
                        </span>
                </div>
                <div class="gf-form">
                        <label class="gf-form-label width-9">Pointer Color</label>
                        <span class="max-width-10">
                                <spectrum-picker class="gf-form-input" ng-model="ctrl.panel.gauge.pointerColor" ng-change="ctrl.updateInit()" ></spectrum-picker>
                        </span>
                </div>
        </div>
        <div class="section gf-form-group">
                <h5 class="section-heading">Size Options</h5>
                <div class="gf-form">
                        <label class="gf-form-label width-9">Gauge Size</label>
                        <input type="number" class="input-small gf-form-input width-10" ng-model="ctrl.panel.gauge.canvasWidth" ng-change="ctrl.updateInit()" ng-model-onblur />
                </div>
                <div class="gf-form">
                        <div class="gf-form">
                                <label class="gf-form-label width-5">Low</label>
                                <input type="number" class="input-small gf-form-input width-4" ng-model="ctrl.panel.gauge.inputLow" ng-change="ctrl.updateInit()" ng-model-onblur />
                        </div>
                        <div class="gf-form">
                                <label class="gf-form-label width-5">High</label>
                                <input type="number" class="input-small gf-form-input width-5" ng-model="ctrl.panel.gauge.inputHigh" ng-change="ctrl.updateInit()" ng-model-onblur />
                        </div>
                </div>
        </div>
</div>
```

## More Features: Aggregations
We can show different data such as max, min, last, etc.

First we add aggregations property to class.
```javascript
  constructor($scope, $injector ) {
    ...
    this.aggregations = ['Last', 'First', 'Max', 'Min', 'Avg', 'Delta'];
    ...
  }
```
Then we add default aggregation to panel defaults
```javascript
const panelDefaults = {
  aggregation: 'Last',
  ...
};
```
To decide which aggregation we show, we add switch case to onRender function.
```javascript
 onRender(){
 
    ...

    var s = this.series[0];
    var value = 0;
    
    switch (this.panel.aggregation) {
      case 'Max':
        value = s.stats.max;
        break;
      case 'Min':
        value = s.stats.min;
        break;
      case 'Avg':
        value = s.stats.avg;
        break;
      case 'First':
        value = s.datapoints[0][0];
        break;
      case 'Delta':
        value = s.stats.diff;
      break;
      default:
        value = s.datapoints[s.datapoints.length - 1][0];
    }
    
    value = Math.round(value);
    
    this.$panelContainer.find('.back').find('h2').remove('');

    // check range
    if ( value > this.panel.gauge.inputHigh || value < this.panel.gauge.inputLow ){
      this.$panelContainer.find( '.back').append('<h2 style="position: absolute; color: red; ">Out of range</h2>');
    }
    else{
      this.gauge.updatePointer( value );
    }

  }
```
I also added check range statement. If value is higher or lower than range it prints "Out of range" on panel. You can print value on panel with same method. 

Lastly we add aggregation option to editor.html. It is select option.
```html
<div class="editor-row">
        <div class="section gf-form-group">
                <h5 class="section-heading">Panel Options</h5>
                <div class="gf-form">
                                <label class="gf-form-label width-9">Aggregation</label>
                                <div class="gf-form-select-wrapper max-width-10">
                                        <select class="input-medium gf-form-input" ng-model="ctrl.panel.aggregation" ng-options="t for t in {{ctrl.aggregations}}" ng-change="ctrl.updateInit()"></select>
                                </div>
                </div>
                <div class="gf-form">
                        <label class="gf-form-label width-9">Gauge Mode</label>
			...
```

Now we can choose aggregation to show.

## Conclusion
This tutorial shows how to use datasources while developing Grafana plugin. We created a basic linear gauge. Now you can add more features like labels or units, and make it look beautiful. 
If you want to see finished version of linear gauge check [github](linear-gauge).




