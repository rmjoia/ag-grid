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
var SortListener = /** @class */ (function (_super) {
    __extends(SortListener, _super);
    function SortListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) {
            return;
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    };
    SortListener.prototype.extractSortModel = function () {
        var sortModel = this.sortController.getSortModel();
        // when using tree data we just return the sort model with the 'ag-Grid-AutoColumn' as is, i.e not broken out
        // into it's constitute group columns as they are not defined up front and can vary per node.
        if (this.gridOptionsWrapper.isTreeData()) {
            return sortModel;
        }
        // it autoCol is active, we don't want to send this to the server. instead we want to
        // send the
        this.replaceAutoGroupColumnWithActualRowGroupColumns(sortModel);
        this.removeMultiColumnPrefixOnColumnIds(sortModel);
        return sortModel;
    };
    SortListener.prototype.removeMultiColumnPrefixOnColumnIds = function (sortModel) {
        if (this.gridOptionsWrapper.isGroupMultiAutoColumn()) {
            var multiColumnPrefix = core_1.Constants.GROUP_AUTO_COLUMN_ID + "-";
            for (var i = 0; i < sortModel.length; ++i) {
                if (sortModel[i].colId.indexOf(multiColumnPrefix) > -1) {
                    sortModel[i].colId = sortModel[i].colId.substr(multiColumnPrefix.length);
                }
            }
        }
    };
    SortListener.prototype.replaceAutoGroupColumnWithActualRowGroupColumns = function (sortModel) {
        // find index of auto group column in sort model
        var autoGroupSortModel = sortModel.find(function (sm) { return sm.colId == core_1.Constants.GROUP_AUTO_COLUMN_ID; });
        // replace auto column with individual group columns
        if (autoGroupSortModel) {
            // remove auto group column
            var autoGroupIndex = sortModel.indexOf(autoGroupSortModel);
            core_1._.removeFromArray(sortModel, autoGroupSortModel);
            var isNotInSortModel = function (col) { return sortModel.filter(function (sm) { return sm.colId === col.getColId(); }).length == 0; };
            var mapColumnToSortModel = function (col) { return ({ colId: col.getId(), sort: autoGroupSortModel.sort }); };
            var newModels = this.columnController.getRowGroupColumns()
                .filter(isNotInSortModel)
                .map(mapColumnToSortModel);
            core_1._.insertArrayIntoArray(sortModel, newModels, autoGroupIndex);
        }
    };
    SortListener.prototype.onSortChanged = function () {
        var storeParams = this.serverSideRowModel.getParams();
        var newSortModel = this.extractSortModel();
        var oldSortModel = storeParams.sortModel;
        this.serverSideRowModel.updateSortModel(newSortModel);
        var changedColumnsInSort = this.findChangedColumnsInSort(newSortModel, oldSortModel);
        var valueColSortChanged = this.isSortingWithValueColumn(changedColumnsInSort);
        var secondaryColSortChanged = this.isSortingWithSecondaryColumn(changedColumnsInSort);
        var sortAlwaysResets = this.gridOptionsWrapper.isServerSideSortingAlwaysResets();
        var params = {
            oldSortModel: oldSortModel,
            newSortModel: newSortModel,
            valueColSortChanged: valueColSortChanged,
            secondaryColSortChanged: secondaryColSortChanged,
            sortAlwaysResets: sortAlwaysResets,
            changedColumnsInSort: changedColumnsInSort
        };
        this.serverSideRowModel.refreshAfterSort(params);
    };
    SortListener.prototype.isSortingWithValueColumn = function (changedColumnsInSort) {
        var valueColIds = this.columnController.getValueColumns().map(function (col) { return col.getColId(); });
        for (var i = 0; i < changedColumnsInSort.length; i++) {
            if (valueColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }
        return false;
    };
    SortListener.prototype.isSortingWithSecondaryColumn = function (changedColumnsInSort) {
        if (!this.columnController.getSecondaryColumns()) {
            return false;
        }
        var secondaryColIds = this.columnController.getSecondaryColumns().map(function (col) { return col.getColId(); });
        for (var i = 0; i < changedColumnsInSort.length; i++) {
            if (secondaryColIds.indexOf(changedColumnsInSort[i]) > -1) {
                return true;
            }
        }
        return false;
    };
    // returns back all the cols that were effected by the sorting. eg if we were sorting by col A,
    // and now we are sorting by col B, the list of impacted cols should be A and B. so if a cache
    // is impacted by sorting on A or B then it needs to be refreshed. this includes where the cache
    // was previously sorted by A and then the A sort now needs to be cleared.
    SortListener.prototype.findChangedColumnsInSort = function (newSortModel, oldSortModel) {
        var allColsInBothSorts = [];
        [newSortModel, oldSortModel].forEach(function (sortModel) {
            if (sortModel) {
                var ids = sortModel.map(function (sm) { return sm.colId; });
                allColsInBothSorts = allColsInBothSorts.concat(ids);
            }
        });
        var differentSorts = function (oldSortItem, newSortItem) {
            var oldSort = oldSortItem ? oldSortItem.sort : null;
            var newSort = newSortItem ? newSortItem.sort : null;
            return oldSort !== newSort;
        };
        var differentIndexes = function (oldSortItem, newSortItem) {
            var oldIndex = oldSortModel.indexOf(oldSortItem);
            var newIndex = newSortModel.indexOf(newSortItem);
            return oldIndex !== newIndex;
        };
        return allColsInBothSorts.filter(function (colId) {
            var oldSortItem = core_1._.find(oldSortModel, function (sm) { return sm.colId === colId; });
            var newSortItem = core_1._.find(newSortModel, function (sm) { return sm.colId === colId; });
            return differentSorts(oldSortItem, newSortItem) || differentIndexes(oldSortItem, newSortItem);
        });
    };
    __decorate([
        core_1.Autowired('sortController')
    ], SortListener.prototype, "sortController", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], SortListener.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('columnController')
    ], SortListener.prototype, "columnController", void 0);
    __decorate([
        core_1.Autowired('rowModel')
    ], SortListener.prototype, "serverSideRowModel", void 0);
    __decorate([
        core_1.PostConstruct
    ], SortListener.prototype, "postConstruct", null);
    SortListener = __decorate([
        core_1.Bean('ssrmSortService')
    ], SortListener);
    return SortListener;
}(core_1.BeanStub));
exports.SortListener = SortListener;
//# sourceMappingURL=sortListener.js.map