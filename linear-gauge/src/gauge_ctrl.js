import {MetricsPanelCtrl} from 'app/plugins/sdk';
import d3 from 'd3';
import _ from 'lodash';
import TimeSeries from 'app/core/time_series';
import g from './gauge';
//import './css/gauge_ctrl.css!';

const panelDefaults = {

  aggregation: 'Last',
  textColor:'white',
  showValue: true,

  gauge : {
    mode: 'Vertical',
    bgColor: 'gray',
    borderColor: 'darkslategray',
    borderWidth: 0,
    pointerColor: 'green',
    pointerHeight: 20,
    inputLow: 0,
    inputHigh: 100,
    height:0,
    width:0,
    canvasWidth: 30,
    showLabels: false
  }
};

export class GaugeLinearCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector ) {
    super($scope, $injector);

    _.defaults(this.panel, panelDefaults);

    this.aggregations = ['Last', 'First', 'Max', 'Min', 'Avg', 'Delta'];

    this.data = 0;
    // this.canvas;

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('render', this.onRender.bind(this));
		this.events.on('data-received', this.onDataReceived.bind(this));
		this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/afbiyik-linear_gauge-panel/editor.html', 2);
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

  err(){
    this.$panelContainer.find('.back').find('h2').remove('');
    this.$panelContainer.find('.back').append('<h2 style="position: absolute; color: red; ">No Data</h2>');
  }
  
  onRender(){

    if (!this.series){
      return;
    }

    if (!this.series[0] ){
      this.err();
      return;
    }

    this.setElementSizes();

    let s = this.series[0];

    let value;
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

    if ( !value){
      this.err();
      return;
    }

    this.data = Math.round(value);

    this.$panelContainer.find('.back').find('h2').remove('');

    if ( this.panel.showValue ){

      this.$panelContainer.find( '.back').append('<h2 style="position: absolute; color:' + this.panel.textColor + '; "> ' + this.data + '</h2>');
    }

    if ( this.data > this.panel.gauge.inputHigh || this.data < this.panel.gauge.inputLow ){
      this.$panelContainer.find('.back').find('h2').remove('');
      this.$panelContainer.find( '.back').append('<h2 style="position: absolute; color: red; ">Out of range</h2>');
    }
    else{
      this.gauge.updatePointer( Math.round(value) );
    }

  }

  link(scope, elem, attrs, ctrl) {
    this.$panelContainer = elem.find('.panel-container');
    this.$panelContoller = ctrl;

    this.$panelContainer.find('.back').css( 'width', this.panel.gauge.width);
    this.$panelContainer.find('.back').css('height', this.panel.gauge.height);

    this.$panelContainer.find('.back').css( 'background-color', this.panel.gauge.bgColor );
    this.$panelContainer.find('.back').css( 'border', this.panel.gauge.borderWidth + 'px solid ' + this.panel.gauge.borderColor );


    this.addCanvas();

    this.gauge = new LinearGauge.LinearGauge( this.$canvas, this.panel.gauge.inputLow, this.panel.gauge.inputHigh, this.panel.gauge.mode === 'Horizontal', this.panel.gauge.pointerColor, this.panel.gauge.pointerHeight, this.panel.gauge.width, this.panel.gauge.height, this.panel.gauge.borderWidth);

  }

  addCanvas(){

    var $back = this.$panelContainer.find('.back');

    this.canvas = d3.select( $back[0] )
      .insert('canvas', ':first-child')
      .attr('width', this.panel.gauge.width)
      .attr('height', this.panel.gauge.height);

    this.$canvas = this.canvas.node();

  }

  setElementSizes(){

    let mode = this.panel.gauge.mode == 'Horizontal';

    var size = this.panel.gauge.canvasWidth;

    if (mode){
      this.panel.gauge.width = this.$panelContainer.find('.container').width();
      this.$panelContainer.find('.container').css( 'flex-direction', 'column' );
      this.panel.gauge.height = size;
      this.panel.gauge.pointerHeight = this.panel.gauge.height - 2 * this.panel.gauge.borderWidth;
    }
    else{
      this.$panelContainer.find('.container').css( 'flex-direction', 'row' );
      this.panel.gauge.width = size;
      this.panel.gauge.height = this.height-20;
      this.panel.gauge.pointerHeight = this.panel.gauge.width - 2 * this.panel.gauge.borderWidth;
    }

    let labelDiv = this.$panelContainer.find('.labels');

    if ( this.panel.gauge.showLabels ){

      let allign = '';
      var noOfLabels = 0;
      var length = 0;
      var inputHigh =  this.panel.gauge.inputHigh;
      var inputLow =  this.panel.gauge.inputLow;
      var rate = 0;
      var beginNum = 0;

      labelDiv.empty();
      labelDiv.css('margin', '5px');

      if ( mode ){
        labelDiv.css('width', this.panel.gauge.width +'' );
        labelDiv.css( 'height', '30px');
        allign = 'bottom: 0; left: ';
        noOfLabels = Math.round( this.panel.gauge.width / 60) + 2 ;
        length = this.panel.gauge.width + 34;
        beginNum = inputLow;

      }else{
        labelDiv.css('width', '30px' );
        labelDiv.css( 'height','100%');
        allign = 'right: 0; top: ';
        noOfLabels = Math.round( this.panel.gauge.height / 60) + 2 ;
        length = this.panel.gauge.height + 41;
        beginNum = inputHigh;
      }

      if ( noOfLabels > 1 && noOfLabels % 2 == 0) noOfLabels --;

      rate = ( inputHigh - inputLow) / (noOfLabels -1);

      if (mode) rate*=-1;

      for ( var i = 0; i < noOfLabels; i++ ){
        labelDiv.append( '<h2 style="position:absolute;' + allign + (i*( length / (noOfLabels )) ) + 'px; color:'+ this.panel.textColor + ';">' + 
        Math.round( beginNum - i*rate  ) + "</h2>" );
      }

    }
    else{
      labelDiv.css('width','0');
      labelDiv.css('height','0');
      labelDiv.empty();
    }

    this.$panelContainer.find('.back').css( 'width', this.panel.gauge.width);
    this.$panelContainer.find('.back').css('height', this.panel.gauge.height);

    if ( this.$canvas.width != this.panel.gauge.width)
      this.$canvas.width = this.panel.gauge.width;
    if (this.$canvas.height != this.panel.gauge.height)
      this.$canvas.height = this.panel.gauge.height;

    this.gauge.updateSize( this.panel.gauge.width-this.panel.gauge.borderWidth , this.panel.gauge.height-this.panel.gauge.borderWidth, this.panel.gauge.pointerHeight, this.panel.gauge.borderWidth);
  }

  updateInit(){

    this.$panelContainer.find('.back').css( 'background-color', this.panel.gauge.bgColor );
    this.$panelContainer.find('.back').css( 'border', this.panel.gauge.borderWidth + 'px solid ' + this.panel.gauge.borderColor );

    this.gauge.updateInit( this.panel.gauge.inputLow, this.panel.gauge.inputHigh, this.panel.gauge.mode == 'Horizontal', this.panel.gauge.pointerColor, this.panel.gauge.pointerHeight );
    this.render();
  }

}


GaugeLinearCtrl.templateUrl = 'module.html';