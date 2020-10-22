// Type definitions for @ag-grid-community/core v24.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IFloatingFilterComp, IFloatingFilterParams } from '../floatingFilter';
import { Component } from '../../../widgets/component';
export declare class ReadOnlyFloatingFilter extends Component implements IFloatingFilterComp {
    private eFloatingFilterText;
    private columnController;
    private params;
    constructor();
    destroy(): void;
    init(params: IFloatingFilterParams): void;
    onParentModelChanged(parentModel: any): void;
}
