'use strict';

System.register(['app/plugins/sdk', 'd3', 'lodash', 'app/core/time_series', './gauge'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, d3, _, TimeSeries, g, _createClass, panelDefaults, GaugeLinearCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_d) {
      d3 = _d.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_gauge) {
      g = _gauge.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      panelDefaults = {

        aggregation: 'Last',
        textColor: 'white',
        showValue: true,

        gauge: {
          mode: 'Vertical',
          bgColor: 'gray',
          borderColor: 'darkslategray',
          borderWidth: 0,
          pointerColor: 'green',
          pointerHeight: 20,
          inputLow: 0,
          inputHigh: 100,
          height: 0,
          width: 0,
          canvasWidth: 30,
          showLabels: false
        }
      };

      _export('GaugeLinearCtrl', GaugeLinearCtrl = function (_MetricsPanelCtrl) {
        _inherits(GaugeLinearCtrl, _MetricsPanelCtrl);

        function GaugeLinearCtrl($scope, $injector) {
          _classCallCheck(this, GaugeLinearCtrl);

          var _this = _possibleConstructorReturn(this, (GaugeLinearCtrl.__proto__ || Object.getPrototypeOf(GaugeLinearCtrl)).call(this, $scope, $injector));

          _.defaults(_this.panel, panelDefaults);

          _this.aggregations = ['Last', 'First', 'Max', 'Min', 'Avg', 'Delta'];

          _this.data = 0;
          // this.canvas;

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
          return _this;
        }

        _createClass(GaugeLinearCtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/afbiyik-linear_gauge-panel/editor.html', 2);
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            this.series = dataList.map(GaugeLinearCtrl.seriesHandler.bind(this));

            this.render();
          }
        }, {
          key: 'err',
          value: function err() {
            this.$panelContainer.find('.back').find('h2').remove('');
            this.$panelContainer.find('.back').append('<h2 style="position: absolute; color: red; ">No Data</h2>');
          }
        }, {
          key: 'onRender',
          value: function onRender() {

            if (!this.series) {
              return;
            }

            if (!this.series[0]) {
              this.err();
              return;
            }

            this.setElementSizes();

            var s = this.series[0];

            var value = void 0;
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

            if (!value) {
              this.err();
              return;
            }

            this.data = Math.round(value);

            this.$panelContainer.find('.back').find('h2').remove('');

            if (this.panel.showValue) {

              this.$panelContainer.find('.back').append('<h2 style="position: absolute; color:' + this.panel.textColor + '; "> ' + this.data + '</h2>');
            }

            if (this.data > this.panel.gauge.inputHigh || this.data < this.panel.gauge.inputLow) {
              this.$panelContainer.find('.back').find('h2').remove('');
              this.$panelContainer.find('.back').append('<h2 style="position: absolute; color: red; ">Out of range</h2>');
            } else {
              this.gauge.updatePointer(Math.round(value));
            }
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            this.$panelContainer = elem.find('.panel-container');
            this.$panelContoller = ctrl;

            this.$panelContainer.find('.back').css('width', this.panel.gauge.width);
            this.$panelContainer.find('.back').css('height', this.panel.gauge.height);

            this.$panelContainer.find('.back').css('background-color', this.panel.gauge.bgColor);
            this.$panelContainer.find('.back').css('border', this.panel.gauge.borderWidth + 'px solid ' + this.panel.gauge.borderColor);

            this.addCanvas();

            this.gauge = new LinearGauge.LinearGauge(this.$canvas, this.panel.gauge.inputLow, this.panel.gauge.inputHigh, this.panel.gauge.mode === 'Horizontal', this.panel.gauge.pointerColor, this.panel.gauge.pointerHeight, this.panel.gauge.width, this.panel.gauge.height, this.panel.gauge.borderWidth);
          }
        }, {
          key: 'addCanvas',
          value: function addCanvas() {

            var $back = this.$panelContainer.find('.back');

            this.canvas = d3.select($back[0]).insert('canvas', ':first-child').attr('width', this.panel.gauge.width).attr('height', this.panel.gauge.height);

            this.$canvas = this.canvas.node();
          }
        }, {
          key: 'setElementSizes',
          value: function setElementSizes() {

            var mode = this.panel.gauge.mode == 'Horizontal';

            var size = this.panel.gauge.canvasWidth;

            if (mode) {
              this.panel.gauge.width = this.$panelContainer.find('.container').width();
              this.$panelContainer.find('.container').css('flex-direction', 'column');
              this.panel.gauge.height = size;
              this.panel.gauge.pointerHeight = this.panel.gauge.height - 2 * this.panel.gauge.borderWidth;
            } else {
              this.$panelContainer.find('.container').css('flex-direction', 'row');
              this.panel.gauge.width = size;
              this.panel.gauge.height = this.height - 20;
              this.panel.gauge.pointerHeight = this.panel.gauge.width - 2 * this.panel.gauge.borderWidth;
            }

            var labelDiv = this.$panelContainer.find('.labels');

            if (this.panel.gauge.showLabels) {

              var allign = '';
              var noOfLabels = 0;
              var length = 0;
              var inputHigh = this.panel.gauge.inputHigh;
              var inputLow = this.panel.gauge.inputLow;
              var rate = 0;
              var beginNum = 0;

              labelDiv.empty();
              labelDiv.css('margin', '5px');

              if (mode) {
                labelDiv.css('width', this.panel.gauge.width + '');
                labelDiv.css('height', '30px');
                allign = 'bottom: 0; left: ';
                noOfLabels = Math.round(this.panel.gauge.width / 60) + 2;
                length = this.panel.gauge.width + 34;
                beginNum = inputLow;
              } else {
                labelDiv.css('width', '30px');
                labelDiv.css('height', '100%');
                allign = 'right: 0; top: ';
                noOfLabels = Math.round(this.panel.gauge.height / 60) + 2;
                length = this.panel.gauge.height + 41;
                beginNum = inputHigh;
              }

              if (noOfLabels > 1 && noOfLabels % 2 == 0) noOfLabels--;

              rate = (inputHigh - inputLow) / (noOfLabels - 1);

              if (mode) rate *= -1;

              for (var i = 0; i < noOfLabels; i++) {
                labelDiv.append('<h2 style="position:absolute;' + allign + i * (length / noOfLabels) + 'px; color:' + this.panel.textColor + ';">' + Math.round(beginNum - i * rate) + "</h2>");
              }
            } else {
              labelDiv.css('width', '0');
              labelDiv.css('height', '0');
              labelDiv.empty();
            }

            this.$panelContainer.find('.back').css('width', this.panel.gauge.width);
            this.$panelContainer.find('.back').css('height', this.panel.gauge.height);

            if (this.$canvas.width != this.panel.gauge.width) this.$canvas.width = this.panel.gauge.width;
            if (this.$canvas.height != this.panel.gauge.height) this.$canvas.height = this.panel.gauge.height;

            this.gauge.updateSize(this.panel.gauge.width - this.panel.gauge.borderWidth, this.panel.gauge.height - this.panel.gauge.borderWidth, this.panel.gauge.pointerHeight, this.panel.gauge.borderWidth);
          }
        }, {
          key: 'updateInit',
          value: function updateInit() {

            this.$panelContainer.find('.back').css('background-color', this.panel.gauge.bgColor);
            this.$panelContainer.find('.back').css('border', this.panel.gauge.borderWidth + 'px solid ' + this.panel.gauge.borderColor);

            this.gauge.updateInit(this.panel.gauge.inputLow, this.panel.gauge.inputHigh, this.panel.gauge.mode == 'Horizontal', this.panel.gauge.pointerColor, this.panel.gauge.pointerHeight);
            this.render();
          }
        }], [{
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {

            var series = new TimeSeries({
              datapoints: seriesData.datapoints,
              alias: seriesData.target
            });

            series.flotpairs = series.getFlotPairs("connected");

            return series;
          }
        }]);

        return GaugeLinearCtrl;
      }(MetricsPanelCtrl));

      _export('GaugeLinearCtrl', GaugeLinearCtrl);

      GaugeLinearCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=gauge_ctrl.js.map
