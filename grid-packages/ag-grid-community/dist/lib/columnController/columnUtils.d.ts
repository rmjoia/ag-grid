import { ColumnGroupChild } from "../entities/columnGroupChild";
import { OriginalColumnGroupChild } from "../entities/originalColumnGroupChild";
import { OriginalColumnGroup } from "../entities/originalColumnGroup";
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare class ColumnUtils extends BeanStub {
    private gridOptionsWrapper;
    calculateColInitialWidth(colDef: any): number;
    getOriginalPathForColumn(column: Column, originalBalancedTree: OriginalColumnGroupChild[]): OriginalColumnGroup[] | null;
    depthFirstOriginalTreeSearch(parent: OriginalColumnGroup | null, tree: OriginalColumnGroupChild[], callback: (treeNode: OriginalColumnGroupChild, parent: OriginalColumnGroup | null) => void): void;
    depthFirstAllColumnTreeSearch(tree: ColumnGroupChild[] | null, callback: (treeNode: ColumnGroupChild) => void): void;
    depthFirstDisplayedColumnTreeSearch(tree: ColumnGroupChild[] | null, callback: (treeNode: ColumnGroupChild) => void): void;
}
