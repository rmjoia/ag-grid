import { RowBounds, BeanStub, Column, RowNode, NumberSequence } from "@ag-grid-community/core";
export declare class BlockUtils extends BeanStub {
    private gridOptionsWrapper;
    private valueService;
    private columnController;
    private rowHeight;
    private usingTreeData;
    private usingMasterDetail;
    private postConstruct;
    createRowNode(params: {
        group: boolean;
        leafGroup: boolean;
        level: number;
        parent: RowNode;
        field: string;
        rowGroupColumn: Column;
    }): RowNode;
    setDataIntoRowNode(rowNode: RowNode, data: any, defaultId: string): void;
    private setChildCountIntoRowNode;
    private setGroupDataIntoRowNode;
    clearDisplayIndex(rowNode: RowNode): void;
    setDisplayIndex(rowNode: RowNode, displayIndexSeq: NumberSequence, nextRowTop: {
        value: number;
    }): void;
    binarySearchForDisplayIndex(displayRowIndex: number, rowNodes: RowNode[]): RowNode | null;
    extractRowBounds(rowNode: RowNode, index: number): RowBounds | undefined;
    getIndexAtPixel(rowNode: RowNode, pixel: number): number | undefined;
    createNodeIdPrefix(parentRowNode: RowNode): string;
}
