// Type definitions for @ag-grid-community/core v24.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ICellRenderer, ICellRendererFunc } from "./cellRenderers/iCellRenderer";
export declare class CellRendererFactory {
    static ANIMATE_SLIDE: string;
    static ANIMATE_SHOW_CHANGE: string;
    static GROUP: string;
    private cellRendererMap;
    private init;
    addCellRenderer(key: string, cellRenderer: {
        new (): ICellRenderer;
    } | ICellRendererFunc): void;
    getCellRenderer(key: string): {
        new (): ICellRenderer;
    } | ICellRendererFunc | null;
}
