import { ColumnApi } from "./columnController/columnApi";
import { GridPanel } from "./gridPanel/gridPanel";
import { ColDef, ColGroupDef, IAggFunc } from "./entities/colDef";
import { RowNode } from "./entities/rowNode";
import { Column } from "./entities/column";
import { GridCore } from "./gridCore";
import { IRowModel } from "./interfaces/iRowModel";
import { CellRange, CellRangeParams } from "./interfaces/iRangeController";
import { CellPosition } from "./entities/cellPosition";
import { IViewportDatasource } from "./interfaces/iViewportDatasource";
import { IFilterComp } from "./interfaces/iFilter";
import { CsvExportParams } from "./interfaces/exportParams";
import { ExcelExportParams } from "./interfaces/iExcelCreator";
import { IDatasource } from "./interfaces/iDatasource";
import { IServerSideDatasource } from "./interfaces/iServerSideDatasource";
import { AlignedGridsService } from "./alignedGridsService";
import { AgEvent, ColumnEventType } from "./events";
import { ICellRendererComp } from "./rendering/cellRenderers/iCellRenderer";
import { ICellEditorComp } from "./interfaces/iCellEditor";
import { HeaderRootComp } from "./headerRendering/headerRootComp";
import { RefreshStoreParams } from "./interfaces/iServerSideRowModel";
import { IStatusPanelComp } from "./interfaces/iStatusPanel";
import { SideBarDef } from "./entities/sideBar";
import { ChartModel } from "./interfaces/IChartService";
import { ChartRef, ProcessChartOptionsParams } from "./entities/gridOptions";
import { ChartOptions, ChartType } from "./interfaces/iChartOptions";
import { IToolPanel } from "./interfaces/iToolPanel";
import { RowNodeTransaction } from "./interfaces/rowNodeTransaction";
import { RowDataTransaction } from "./interfaces/rowDataTransaction";
import { RowDropZoneParams, RowDropZoneEvents } from "./gridPanel/rowDragFeature";
import { AgChartThemeOverrides } from "./interfaces/iAgChartOptions";
import { ServerSideTransaction, ServerSideTransactionResult } from "./interfaces/serverSideTransaction";
import { ServerSideStoreState } from "./interfaces/IServerSideStore";
export interface StartEditingCellParams {
    rowIndex: number;
    colKey: string | Column;
    rowPinned?: string;
    keyPress?: number;
    charPress?: string;
}
export interface GetCellsParams {
    rowNodes?: RowNode[];
    columns?: (string | Column)[];
}
export interface RefreshCellsParams extends GetCellsParams {
    force?: boolean;
    suppressFlash?: boolean;
}
export interface FlashCellsParams extends GetCellsParams {
    flashDelay?: number;
    fadeDelay?: number;
}
export interface GetCellRendererInstancesParams extends GetCellsParams {
}
export interface GetCellEditorInstancesParams extends GetCellsParams {
}
export interface RedrawRowsParams {
    rowNodes?: RowNode[];
}
export interface CreateRangeChartParams {
    cellRange: CellRangeParams;
    chartType: ChartType;
    chartThemeName?: string;
    chartContainer?: HTMLElement;
    suppressChartRanges?: boolean;
    aggFunc?: string | IAggFunc;
    chartThemeOverrides?: AgChartThemeOverrides;
    unlinkChart?: boolean;
    /** @deprecated since v24.0.0, use `chartThemeOverrides` instead */
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions<any>;
}
export interface CreatePivotChartParams {
    chartType: ChartType;
    chartThemeName?: string;
    chartContainer?: HTMLElement;
    chartThemeOverrides?: AgChartThemeOverrides;
    unlinkChart?: boolean;
    /** @deprecated since v24.0.0, use `chartThemeOverrides` instead */
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions<any>;
}
export interface CreateCrossFilterChartParams {
    cellRange: CellRangeParams;
    chartType: ChartType;
    chartThemeName?: string;
    chartContainer?: HTMLElement;
    suppressChartRanges?: boolean;
    aggFunc?: string | IAggFunc;
    chartThemeOverrides?: AgChartThemeOverrides;
    unlinkChart?: boolean;
}
export interface DetailGridInfo {
    api?: GridApi;
    columnApi?: ColumnApi;
    id: string;
}
export declare class GridApi {
    private immutableService;
    private csvCreator;
    private excelCreator;
    private rowRenderer;
    private filterManager;
    private columnController;
    private selectionController;
    private gridOptionsWrapper;
    private valueService;
    private alignedGridsService;
    private eventService;
    private pinnedRowModel;
    private context;
    private rowModel;
    private sortController;
    private paginationProxy;
    private focusController;
    private dragAndDropService;
    private rangeController;
    private clipboardService;
    private aggFuncService;
    private menuFactory;
    private contextMenuFactory;
    private valueCache;
    private animationFrameService;
    private statusBarService;
    private chartService;
    private undoRedoService;
    private gridPanel;
    private gridCore;
    private headerRootComp;
    private clientSideRowModel;
    private infiniteRowModel;
    private serverSideRowModel;
    private detailGridInfoMap;
    private destroyCalled;
    registerGridComp(gridPanel: GridPanel): void;
    registerGridCore(gridCore: GridCore): void;
    registerHeaderRootComp(headerRootComp: HeaderRootComp): void;
    private init;
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    __getAlignedGridService(): AlignedGridsService;
    addDetailGridInfo(id: string, gridInfo: DetailGridInfo): void;
    removeDetailGridInfo(id: string): void;
    getDetailGridInfo(id: string): DetailGridInfo;
    forEachDetailGridInfo(callback: (gridInfo: DetailGridInfo, index: number) => void): void;
    getDataAsCsv(params?: CsvExportParams): string;
    exportDataAsCsv(params?: CsvExportParams): void;
    getDataAsExcel(params?: ExcelExportParams): string;
    exportDataAsExcel(params?: ExcelExportParams): void;
    /** @deprecated */
    setEnterpriseDatasource(datasource: IServerSideDatasource): void;
    setGridAriaProperty(property: string, value: string | null): void;
    setServerSideDatasource(datasource: IServerSideDatasource): void;
    setDatasource(datasource: IDatasource): void;
    setViewportDatasource(viewportDatasource: IViewportDatasource): void;
    setRowData(rowData: any[]): void;
    /** @deprecated */
    setFloatingTopRowData(rows: any[]): void;
    /** @deprecated */
    setFloatingBottomRowData(rows: any[]): void;
    /** @deprecated */
    getFloatingTopRowCount(): number;
    /** @deprecated */
    getFloatingBottomRowCount(): number;
    /** @deprecated */
    getFloatingTopRow(index: number): RowNode;
    /** @deprecated */
    getFloatingBottomRow(index: number): RowNode;
    setPinnedTopRowData(rows: any[]): void;
    setPinnedBottomRowData(rows: any[]): void;
    getPinnedTopRowCount(): number;
    getPinnedBottomRowCount(): number;
    getPinnedTopRow(index: number): RowNode;
    getPinnedBottomRow(index: number): RowNode;
    setColumnDefs(colDefs: (ColDef | ColGroupDef)[], source?: ColumnEventType): void;
    setAutoGroupColumnDef(colDef: ColDef, source?: ColumnEventType): void;
    expireValueCache(): void;
    getVerticalPixelRange(): {
        top: number;
        bottom: number;
    };
    getHorizontalPixelRange(): {
        left: number;
        right: number;
    };
    setAlwaysShowVerticalScroll(show: boolean): void;
    refreshToolPanel(): void;
    refreshCells(params?: RefreshCellsParams): void;
    flashCells(params?: FlashCellsParams): void;
    redrawRows(params?: RedrawRowsParams): void;
    timeFullRedraw(count?: number): void;
    /** @deprecated */
    refreshView(): void;
    /** @deprecated */
    refreshRows(rowNodes: RowNode[]): void;
    /** @deprecated */
    rowDataChanged(rows: any): void;
    /** @deprecated */
    softRefreshView(): void;
    /** @deprecated */
    refreshGroupRows(): void;
    setFunctionsReadOnly(readOnly: boolean): void;
    refreshHeader(): void;
    isAnyFilterPresent(): boolean;
    /** @deprecated */
    isAdvancedFilterPresent(): boolean;
    isColumnFilterPresent(): boolean;
    isQuickFilterPresent(): boolean;
    getModel(): IRowModel;
    setRowNodeExpanded(rowNode: RowNode, expanded: boolean): void;
    onGroupExpandedOrCollapsed(deprecated_refreshFromIndex?: any): void;
    refreshInMemoryRowModel(step?: string): any;
    refreshClientSideRowModel(step?: string): any;
    isAnimationFrameQueueEmpty(): boolean;
    getRowNode(id: string): RowNode;
    getSizesForCurrentTheme(): {
        rowHeight: number;
        headerHeight: number;
    };
    expandAll(): void;
    collapseAll(): void;
    getToolPanelInstance(id: string): IToolPanel;
    addVirtualRowListener(eventName: string, rowIndex: number, callback: Function): void;
    addRenderedRowListener(eventName: string, rowIndex: number, callback: Function): void;
    setQuickFilter(newFilter: any): void;
    selectIndex(index: any, tryMulti: any, suppressEvents: any): void;
    deselectIndex(index: number, suppressEvents?: boolean): void;
    selectNode(node: RowNode, tryMulti?: boolean, suppressEvents?: boolean): void;
    deselectNode(node: RowNode, suppressEvents?: boolean): void;
    selectAll(): void;
    deselectAll(): void;
    selectAllFiltered(): void;
    deselectAllFiltered(): void;
    recomputeAggregates(): void;
    sizeColumnsToFit(): void;
    showLoadingOverlay(): void;
    showNoRowsOverlay(): void;
    hideOverlay(): void;
    isNodeSelected(node: any): any;
    getSelectedNodesById(): {
        [nodeId: number]: RowNode;
    };
    getSelectedNodes(): RowNode[];
    getSelectedRows(): any[];
    getBestCostNodeSelection(): any;
    getRenderedNodes(): RowNode[];
    ensureColIndexVisible(index: any): void;
    ensureColumnVisible(key: string | Column): void;
    ensureIndexVisible(index: any, position?: string | null): void;
    ensureNodeVisible(comparator: any, position?: string | null): void;
    forEachLeafNode(callback: (rowNode: RowNode) => void): void;
    forEachNode(callback: (rowNode: RowNode, index: number) => void): void;
    forEachNodeAfterFilter(callback: (rowNode: RowNode, index: number) => void): void;
    forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode, index: number) => void): void;
    getFilterApiForColDef(colDef: any): any;
    getFilterInstance(key: string | Column, callback?: (filter: IFilterComp) => void): IFilterComp;
    getFilterApi(key: string | Column): IFilterComp;
    destroyFilter(key: string | Column): void;
    getStatusPanel(key: string): IStatusPanelComp;
    getColumnDef(key: string | Column): ColDef;
    getColumnDefs(): (ColDef | ColGroupDef)[];
    onFilterChanged(): void;
    onSortChanged(): void;
    setSortModel(sortModel: any, source?: ColumnEventType): void;
    getSortModel(): {
        colId: string;
        sort: string;
    }[];
    setFilterModel(model: any): void;
    getFilterModel(): {
        [key: string]: any;
    };
    getFocusedCell(): CellPosition;
    clearFocusedCell(): void;
    setFocusedCell(rowIndex: number, colKey: string | Column, floating?: string): void;
    setSuppressRowDrag(value: boolean): void;
    setSuppressMoveWhenRowDragging(value: boolean): void;
    setSuppressRowClickSelection(value: boolean): void;
    addRowDropZone(params: RowDropZoneParams): void;
    removeRowDropZone(params: RowDropZoneParams): void;
    getRowDropZoneParams(events: RowDropZoneEvents): RowDropZoneParams;
    setHeaderHeight(headerHeight: number): void;
    setDomLayout(domLayout: string): void;
    setEnableCellTextSelection(selectable: boolean): void;
    setFillHandleDirection(direction: 'x' | 'y' | 'xy'): void;
    setGroupHeaderHeight(headerHeight: number): void;
    setFloatingFiltersHeight(headerHeight: number): void;
    setPivotGroupHeaderHeight(headerHeight: number): void;
    setPivotHeaderHeight(headerHeight: number): void;
    isSideBarVisible(): boolean;
    setSideBarVisible(show: boolean): void;
    setSideBarPosition(position: 'left' | 'right'): void;
    openToolPanel(key: string): void;
    closeToolPanel(): void;
    getOpenedToolPanel(): string;
    getSideBar(): SideBarDef;
    setSideBar(def: SideBarDef): void;
    setSuppressClipboardPaste(value: boolean): void;
    isToolPanelShowing(): boolean;
    doLayout(): void;
    resetRowHeights(): void;
    setGroupRemoveSingleChildren(value: boolean): void;
    setGroupRemoveLowestSingleChildren(value: boolean): void;
    onRowHeightChanged(): void;
    getValue(colKey: string | Column, rowNode: RowNode): any;
    addEventListener(eventType: string, listener: Function): void;
    addGlobalListener(listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    removeGlobalListener(listener: Function): void;
    dispatchEvent(event: AgEvent): void;
    destroy(): void;
    private cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid;
    private warnIfDestroyed;
    resetQuickFilter(): void;
    getRangeSelections(): any;
    getCellRanges(): CellRange[];
    camelCaseToHumanReadable(camelCase: string): string;
    addRangeSelection(deprecatedNoLongerUsed: any): void;
    addCellRange(params: CellRangeParams): void;
    clearRangeSelection(): void;
    undoCellEditing(): void;
    redoCellEditing(): void;
    getCurrentUndoSize(): number;
    getCurrentRedoSize(): number;
    getChartModels(): ChartModel[];
    createRangeChart(params: CreateRangeChartParams): ChartRef | undefined;
    createCrossFilterChart(params: CreateRangeChartParams): ChartRef | undefined;
    restoreChart(chartModel: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined;
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;
    copySelectedRowsToClipboard(includeHeader: boolean, columnKeys?: (string | Column)[]): void;
    copySelectedRangeToClipboard(includeHeader: boolean): void;
    copySelectedRangeDown(): void;
    showColumnMenuAfterButtonClick(colKey: string | Column, buttonElement: HTMLElement): void;
    showColumnMenuAfterMouseClick(colKey: string | Column, mouseEvent: MouseEvent | Touch): void;
    hidePopupMenu(): void;
    setPopupParent(ePopupParent: HTMLElement): void;
    tabToNextCell(): boolean;
    tabToPreviousCell(): boolean;
    getCellRendererInstances(params?: GetCellRendererInstancesParams): ICellRendererComp[];
    getCellEditorInstances(params?: GetCellEditorInstancesParams): ICellEditorComp[];
    getEditingCells(): CellPosition[];
    stopEditing(cancel?: boolean): void;
    startEditingCell(params: StartEditingCellParams): void;
    addAggFunc(key: string, aggFunc: IAggFunc): void;
    addAggFuncs(aggFuncs: {
        [key: string]: IAggFunc;
    }): void;
    clearAggFuncs(): void;
    applyServerSideTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined;
    applyServerSideTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void;
    retryServerSideLoads(): void;
    flushServerSideAsyncTransactions(): void;
    applyTransaction(rowDataTransaction: RowDataTransaction): RowNodeTransaction | null | undefined;
    /** @deprecated */
    updateRowData(rowDataTransaction: RowDataTransaction): RowNodeTransaction;
    applyTransactionAsync(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void;
    flushAsyncTransactions(): void;
    /** @deprecated */
    batchUpdateRowData(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void;
    insertItemsAtIndex(index: number, items: any[], skipRefresh?: boolean): void;
    removeItems(rowNodes: RowNode[], skipRefresh?: boolean): void;
    addItems(items: any[], skipRefresh?: boolean): void;
    refreshVirtualPageCache(): void;
    refreshInfinitePageCache(): void;
    refreshInfiniteCache(): void;
    purgeVirtualPageCache(): void;
    purgeInfinitePageCache(): void;
    purgeInfiniteCache(): void;
    /** @deprecated */
    purgeEnterpriseCache(route?: string[]): void;
    /** @deprecated */
    purgeServerSideCache(route?: string[]): void;
    refreshServerSideStore(params: RefreshStoreParams): void;
    getServerSideStoreState(): ServerSideStoreState[];
    getVirtualRowCount(): number | null | undefined;
    getInfiniteRowCount(): number | undefined;
    isMaxRowFound(): boolean | undefined;
    isLastRowIndexKnown(): boolean | undefined;
    setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void;
    setInfiniteRowCount(rowCount: number, maxRowFound?: boolean): void;
    getVirtualPageState(): any;
    getInfinitePageState(): any;
    getCacheBlockState(): any;
    checkGridSize(): void;
    getFirstRenderedRow(): number;
    getFirstDisplayedRow(): number;
    getLastRenderedRow(): number;
    getLastDisplayedRow(): number;
    getDisplayedRowAtIndex(index: number): RowNode;
    getDisplayedRowCount(): number;
    paginationIsLastPageFound(): boolean;
    paginationGetPageSize(): number;
    paginationSetPageSize(size: number): void;
    paginationGetCurrentPage(): number;
    paginationGetTotalPages(): number;
    paginationGetRowCount(): number;
    paginationGoToNextPage(): void;
    paginationGoToPreviousPage(): void;
    paginationGoToFirstPage(): void;
    paginationGoToLastPage(): void;
    paginationGoToPage(page: number): void;
}
