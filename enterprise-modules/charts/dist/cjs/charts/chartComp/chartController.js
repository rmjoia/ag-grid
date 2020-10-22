"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var chartDataModel_1 = require("./chartDataModel");
var ag_charts_community_1 = require("ag-charts-community");
var ChartController = /** @class */ (function (_super) {
    __extends(ChartController, _super);
    function ChartController(model) {
        var _this = _super.call(this) || this;
        _this.model = model;
        return _this;
    }
    ChartController.prototype.init = function () {
        var _this = this;
        this.setChartRange();
        this.addManagedListener(this.eventService, core_1.Events.EVENT_RANGE_SELECTION_CHANGED, function (event) {
            if (event.id && event.id === _this.model.getChartId()) {
                _this.updateForRangeChange();
            }
        });
        if (this.model.isUnlinked()) {
            if (this.rangeController) {
                this.rangeController.setCellRanges([]);
            }
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_CELL_VALUE_CHANGED, this.updateForDataChange.bind(this));
    };
    ChartController.prototype.updateForGridChange = function () {
        if (this.model.isUnlinked()) {
            return;
        }
        this.model.updateCellRanges();
        this.setChartRange();
    };
    ChartController.prototype.updateForDataChange = function () {
        if (this.model.isUnlinked()) {
            return;
        }
        this.model.updateData();
        this.raiseChartUpdatedEvent();
    };
    ChartController.prototype.updateForRangeChange = function () {
        this.updateForGridChange();
        this.raiseChartRangeSelectionChangedEvent();
    };
    ChartController.prototype.updateForPanelChange = function (updatedCol) {
        this.model.updateCellRanges(updatedCol);
        this.setChartRange();
        this.raiseChartRangeSelectionChangedEvent();
    };
    ChartController.prototype.getChartModel = function () {
        var _this = this;
        var modelType = this.model.isPivotChart() ? 'pivot' : 'range';
        return {
            modelType: modelType,
            chartId: this.model.getChartId(),
            chartType: this.model.getChartType(),
            chartThemeName: this.getThemeName(),
            chartOptions: this.chartProxy.getChartOptions(),
            cellRange: this.model.getCellRangeParams(),
            chart: this.chartProxy.getChart(),
            getChartImageDataURL: function (params) {
                return _this.chartProxy.getChartImageDataURL(params.type);
            },
            suppressChartRanges: this.model.isSuppressChartRanges(),
            aggFunc: this.model.getAggFunc(),
            unlinkChart: this.model.isUnlinked(),
        };
    };
    ChartController.prototype.getChartType = function () {
        return this.model.getChartType();
    };
    ChartController.prototype.isPivotChart = function () {
        return this.model.isPivotChart();
    };
    ChartController.prototype.isGrouping = function () {
        return this.model.isGrouping();
    };
    ChartController.prototype.getThemeName = function () {
        return this.model.getChartThemeName();
    };
    ChartController.prototype.getThemes = function () {
        return this.gridOptionsWrapper.getChartThemes();
    };
    ChartController.prototype.getPalettes = function () {
        var _this = this;
        var customPalette = this.chartProxy.getCustomPalette();
        if (customPalette) {
            return [customPalette];
        }
        var themeNames = this.gridOptionsWrapper.getChartThemes();
        return themeNames.map(function (themeName) {
            var theme = _this.chartProxy.isStockTheme(themeName) ?
                themeName : _this.chartProxy.lookupCustomChartTheme(themeName);
            return ag_charts_community_1.getChartTheme(theme).palette;
        });
    };
    ChartController.prototype.setChartType = function (chartType) {
        this.model.setChartType(chartType);
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    };
    ChartController.prototype.setChartThemeName = function (chartThemeName) {
        this.model.setChartThemeName(chartThemeName);
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    };
    ChartController.prototype.getColStateForMenu = function () {
        return { dimensionCols: this.model.getDimensionColState(), valueCols: this.model.getValueColState() };
    };
    ChartController.prototype.isDefaultCategorySelected = function () {
        return this.model.getSelectedDimension().colId === chartDataModel_1.ChartDataModel.DEFAULT_CATEGORY;
    };
    ChartController.prototype.setChartRange = function (silent) {
        if (silent === void 0) { silent = false; }
        if (this.rangeController && !this.model.isSuppressChartRanges() && !this.model.isUnlinked()) {
            this.rangeController.setCellRanges(this.model.getCellRanges());
        }
        if (!silent) {
            this.raiseChartUpdatedEvent();
        }
    };
    ChartController.prototype.detachChartRange = function () {
        // when chart is detached it won't listen to changes from the grid
        this.model.toggleUnlinked();
        if (this.model.isUnlinked()) {
            // remove range from grid
            if (this.rangeController) {
                this.rangeController.setCellRanges([]);
            }
        }
        else {
            // update chart data may have changed
            this.updateForGridChange();
        }
    };
    ChartController.prototype.setChartProxy = function (chartProxy) {
        this.chartProxy = chartProxy;
    };
    ChartController.prototype.getChartProxy = function () {
        return this.chartProxy;
    };
    ChartController.prototype.isActiveXYChart = function () {
        return core_1._.includes([core_1.ChartType.Scatter, core_1.ChartType.Bubble], this.getChartType());
    };
    ChartController.prototype.isChartLinked = function () {
        return !this.model.isUnlinked();
    };
    ChartController.prototype.raiseChartUpdatedEvent = function () {
        var event = Object.freeze({
            type: ChartController.EVENT_CHART_UPDATED
        });
        this.dispatchEvent(event);
    };
    ChartController.prototype.raiseChartOptionsChangedEvent = function () {
        this.chartProxy.raiseChartOptionsChangedEvent();
    };
    ChartController.prototype.raiseChartRangeSelectionChangedEvent = function () {
        var event = Object.freeze({
            type: core_1.Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.getChartId(),
            chartId: this.model.getChartId(),
            cellRange: this.model.getCellRangeParams(),
            api: this.gridApi,
            columnApi: this.columnApi,
        });
        this.eventService.dispatchEvent(event);
    };
    ChartController.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.rangeController) {
            this.rangeController.setCellRanges([]);
        }
    };
    ChartController.EVENT_CHART_UPDATED = 'chartUpdated';
    __decorate([
        core_1.Autowired('rangeController')
    ], ChartController.prototype, "rangeController", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], ChartController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('gridApi')
    ], ChartController.prototype, "gridApi", void 0);
    __decorate([
        core_1.Autowired('columnApi')
    ], ChartController.prototype, "columnApi", void 0);
    __decorate([
        core_1.PostConstruct
    ], ChartController.prototype, "init", null);
    return ChartController;
}(core_1.BeanStub));
exports.ChartController = ChartController;
//# sourceMappingURL=chartController.js.map