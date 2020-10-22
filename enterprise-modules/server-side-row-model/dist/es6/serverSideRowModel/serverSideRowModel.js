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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { _, Autowired, Bean, BeanStub, Constants, Events, NumberSequence, PostConstruct, PreDestroy, Qualifier, RowNode } from "@ag-grid-community/core";
var ServerSideRowModel = /** @class */ (function (_super) {
    __extends(ServerSideRowModel, _super);
    function ServerSideRowModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // we don't implement as lazy row heights is not supported in this row model
    ServerSideRowModel.prototype.ensureRowHeightsValid = function () { return false; };
    ServerSideRowModel.prototype.start = function () {
        var datasource = this.gridOptionsWrapper.getServerSideDatasource();
        if (datasource) {
            this.setDatasource(datasource);
        }
    };
    ServerSideRowModel.prototype.destroyDatasource = function () {
        if (!this.datasource) {
            return;
        }
        if (this.datasource.destroy) {
            this.datasource.destroy();
        }
        this.rowRenderer.datasourceChanged();
        this.datasource = undefined;
    };
    ServerSideRowModel.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ServerSideRowModel');
    };
    ServerSideRowModel.prototype.addEventListeners = function () {
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnEverything.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_STORE_UPDATED, this.onStoreUpdated.bind(this));
        var resetListener = this.resetRootStore.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, resetListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, resetListener);
    };
    ServerSideRowModel.prototype.setDatasource = function (datasource) {
        this.destroyDatasource();
        this.datasource = datasource;
        this.resetRootStore();
    };
    ServerSideRowModel.prototype.isLastRowIndexKnown = function () {
        var cache = this.getRootStore();
        if (!cache) {
            return false;
        }
        return cache.isLastRowIndexKnown();
    };
    ServerSideRowModel.prototype.onColumnEverything = function () {
        // this is a hack for one customer only, so they can suppress the resetting of the columns.
        // The problem the customer had was they were api.setColumnDefs() after the data source came
        // back with data. So this stops the reload from the grid after the data comes back.
        // Once we have "AG-1591 Allow delta changes to columns" fixed, then this hack can be taken out.
        if (this.gridOptionsWrapper.isSuppressEnterpriseResetOnNewColumns()) {
            return;
        }
        // every other customer can continue as normal and have it working!!!
        // if first time, alwasy reset
        if (!this.storeParams) {
            this.resetRootStore();
            return;
        }
        // check if anything pertaining to fetching data has changed, and if it has, reset, but if
        // it has not, don't reset
        var rowGroupColumnVos = this.columnsToValueObjects(this.columnController.getRowGroupColumns());
        var valueColumnVos = this.columnsToValueObjects(this.columnController.getValueColumns());
        var pivotColumnVos = this.columnsToValueObjects(this.columnController.getPivotColumns());
        var sortModelDifferent = !_.jsonEquals(this.storeParams.sortModel, this.sortController.getSortModel());
        var rowGroupDifferent = !_.jsonEquals(this.storeParams.rowGroupCols, rowGroupColumnVos);
        var pivotDifferent = !_.jsonEquals(this.storeParams.pivotCols, pivotColumnVos);
        var valuesDifferent = !_.jsonEquals(this.storeParams.valueCols, valueColumnVos);
        var resetRequired = sortModelDifferent || rowGroupDifferent || pivotDifferent || valuesDifferent;
        if (resetRequired) {
            this.resetRootStore();
        }
    };
    ServerSideRowModel.prototype.destroyRootStore = function () {
        if (!this.rootNode || !this.rootNode.childrenCache) {
            return;
        }
        this.rootNode.childrenCache = this.destroyBean(this.rootNode.childrenCache);
        this.nodeManager.clear();
    };
    ServerSideRowModel.prototype.refreshAfterSort = function (params) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.refreshAfterSort(params);
        this.onStoreUpdated();
    };
    ServerSideRowModel.prototype.resetRootStore = function () {
        this.destroyRootStore();
        this.rootNode = new RowNode();
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.createBean(this.rootNode);
        if (this.datasource) {
            this.storeParams = this.createStoreParams();
            this.rootNode.childrenCache = this.createBean(this.storeFactory.createStore(this.storeParams, this.rootNode));
            this.updateRowIndexesAndBounds();
        }
        // this event: 1) clears selection 2) updates filters 3) shows/hides 'no rows' overlay
        var rowDataChangedEvent = {
            type: Events.EVENT_ROW_DATA_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(rowDataChangedEvent);
        // this gets the row to render rows (or remove the previously rendered rows, as it's blank to start).
        // important to NOT pass in an event with keepRenderedRows or animate, as we want the renderer
        // to treat the rows as new rows, as it's all new data
        this.dispatchModelUpdated(true);
    };
    ServerSideRowModel.prototype.columnsToValueObjects = function (columns) {
        var _this = this;
        return columns.map(function (col) { return ({
            id: col.getId(),
            aggFunc: col.getAggFunc(),
            displayName: _this.columnController.getDisplayNameForColumn(col, 'model'),
            field: col.getColDef().field
        }); });
    };
    ServerSideRowModel.prototype.createStoreParams = function () {
        var rowGroupColumnVos = this.columnsToValueObjects(this.columnController.getRowGroupColumns());
        var valueColumnVos = this.columnsToValueObjects(this.columnController.getValueColumns());
        var pivotColumnVos = this.columnsToValueObjects(this.columnController.getPivotColumns());
        var dynamicRowHeight = this.gridOptionsWrapper.isDynamicRowHeight();
        var params = {
            // the columns the user has grouped and aggregated by
            valueCols: valueColumnVos,
            rowGroupCols: rowGroupColumnVos,
            pivotCols: pivotColumnVos,
            pivotMode: this.columnController.isPivotMode(),
            // sort and filter model
            filterModel: this.filterManager.getFilterModel(),
            sortModel: this.sortListener.extractSortModel(),
            datasource: this.datasource,
            lastAccessedSequence: new NumberSequence(),
            // blockSize: blockSize == null ? 100 : blockSize,
            dynamicRowHeight: dynamicRowHeight
        };
        return params;
    };
    ServerSideRowModel.prototype.getParams = function () {
        return this.storeParams;
    };
    ServerSideRowModel.prototype.dispatchModelUpdated = function (reset) {
        if (reset === void 0) { reset = false; }
        var modelUpdatedEvent = {
            type: Events.EVENT_MODEL_UPDATED,
            api: this.gridApi,
            columnApi: this.columnApi,
            animate: !reset,
            keepRenderedRows: !reset,
            newPage: false,
            newData: false
        };
        this.eventService.dispatchEvent(modelUpdatedEvent);
    };
    ServerSideRowModel.prototype.onStoreUpdated = function () {
        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    };
    ServerSideRowModel.prototype.onRowHeightChanged = function () {
        this.updateRowIndexesAndBounds();
        this.dispatchModelUpdated();
    };
    ServerSideRowModel.prototype.updateRowIndexesAndBounds = function () {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.setDisplayIndexes(new NumberSequence(), { value: 0 });
    };
    ServerSideRowModel.prototype.getRow = function (index) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return null;
        }
        return rootStore.getRowUsingDisplayIndex(index);
    };
    ServerSideRowModel.prototype.updateSortModel = function (newSortModel) {
        if (this.storeParams) {
            this.storeParams.sortModel = newSortModel;
        }
    };
    ServerSideRowModel.prototype.refreshStoreAfterFilter = function (newFilterModel) {
        if (this.storeParams) {
            this.storeParams.filterModel = newFilterModel;
        }
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.refreshAfterFilter();
        this.onStoreUpdated();
    };
    ServerSideRowModel.prototype.getRootStore = function () {
        if (this.rootNode && this.rootNode.childrenCache) {
            return this.rootNode.childrenCache;
        }
    };
    ServerSideRowModel.prototype.getRowCount = function () {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return 1;
        }
        return rootStore.getDisplayIndexEnd();
    };
    ServerSideRowModel.prototype.getTopLevelRowCount = function () {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return 1;
        }
        return rootStore.getRowCount();
    };
    ServerSideRowModel.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return topLevelIndex;
        }
        return rootStore.getTopLevelRowDisplayedIndex(topLevelIndex);
    };
    ServerSideRowModel.prototype.getRowBounds = function (index) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            var rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
            return {
                rowTop: 0,
                rowHeight: rowHeight
            };
        }
        return rootStore.getRowBounds(index);
    };
    ServerSideRowModel.prototype.getRowIndexAtPixel = function (pixel) {
        var rootStore = this.getRootStore();
        if (pixel <= 0 || !rootStore) {
            return 0;
        }
        return rootStore.getRowIndexAtPixel(pixel);
    };
    ServerSideRowModel.prototype.isEmpty = function () {
        return false;
    };
    ServerSideRowModel.prototype.isRowsToRender = function () {
        return this.getRootStore() != null && this.getRowCount() > 0;
    };
    ServerSideRowModel.prototype.getType = function () {
        return Constants.ROW_MODEL_TYPE_SERVER_SIDE;
    };
    ServerSideRowModel.prototype.forEachNode = function (callback) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        rootStore.forEachNodeDeep(callback);
    };
    ServerSideRowModel.prototype.executeOnStore = function (route, callback) {
        var rootStore = this.getRootStore();
        if (!rootStore) {
            return;
        }
        var storeToExecuteOn = rootStore.getChildStore(route);
        if (storeToExecuteOn) {
            callback(storeToExecuteOn);
        }
    };
    ServerSideRowModel.prototype.purgeStore = function (route) {
        if (route === void 0) { route = []; }
        this.executeOnStore(route, function (cache) { return cache.purgeStore(); });
    };
    ServerSideRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        if (_.exists(lastInRange) && firstInRange.parent !== lastInRange.parent) {
            return [];
        }
        return firstInRange.parent.childrenCache.getRowNodesInRange(lastInRange, firstInRange);
    };
    ServerSideRowModel.prototype.getRowNode = function (id) {
        var result = null;
        this.forEachNode(function (rowNode) {
            if (rowNode.id === id) {
                result = rowNode;
            }
            if (rowNode.detailNode && rowNode.detailNode.id === id) {
                result = rowNode.detailNode;
            }
        });
        return result;
    };
    // always returns true - this is used by the
    ServerSideRowModel.prototype.isRowPresent = function (rowNode) {
        var foundRowNode = this.getRowNode(rowNode.id);
        return !!foundRowNode;
    };
    __decorate([
        Autowired('columnController')
    ], ServerSideRowModel.prototype, "columnController", void 0);
    __decorate([
        Autowired('filterManager')
    ], ServerSideRowModel.prototype, "filterManager", void 0);
    __decorate([
        Autowired('sortController')
    ], ServerSideRowModel.prototype, "sortController", void 0);
    __decorate([
        Autowired('gridApi')
    ], ServerSideRowModel.prototype, "gridApi", void 0);
    __decorate([
        Autowired('columnApi')
    ], ServerSideRowModel.prototype, "columnApi", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], ServerSideRowModel.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('ssrmSortService')
    ], ServerSideRowModel.prototype, "sortListener", void 0);
    __decorate([
        Autowired('ssrmNodeManager')
    ], ServerSideRowModel.prototype, "nodeManager", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], ServerSideRowModel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('ssrmStoreFactory')
    ], ServerSideRowModel.prototype, "storeFactory", void 0);
    __decorate([
        PreDestroy
    ], ServerSideRowModel.prototype, "destroyDatasource", null);
    __decorate([
        __param(0, Qualifier('loggerFactory'))
    ], ServerSideRowModel.prototype, "setBeans", null);
    __decorate([
        PostConstruct
    ], ServerSideRowModel.prototype, "addEventListeners", null);
    __decorate([
        PreDestroy
    ], ServerSideRowModel.prototype, "destroyRootStore", null);
    ServerSideRowModel = __decorate([
        Bean('rowModel')
    ], ServerSideRowModel);
    return ServerSideRowModel;
}(BeanStub));
export { ServerSideRowModel };
