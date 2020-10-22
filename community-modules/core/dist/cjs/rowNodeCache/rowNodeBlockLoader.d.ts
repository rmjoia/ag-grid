// Type definitions for @ag-grid-community/core v24.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNodeBlock } from "./rowNodeBlock";
import { BeanStub } from "../context/beanStub";
export declare class RowNodeBlockLoader extends BeanStub {
    static BLOCK_LOADER_FINISHED_EVENT: string;
    private gridOptionsWrapper;
    private maxConcurrentRequests;
    private checkBlockToLoadDebounce;
    private activeBlockLoadsCount;
    private blocks;
    private logger;
    private active;
    private postConstruct;
    private setBeans;
    addBlock(block: RowNodeBlock): void;
    removeBlock(block: RowNodeBlock): void;
    protected destroy(): void;
    private loadComplete;
    checkBlockToLoad(): void;
    private performCheckBlocksToLoad;
    getBlockState(): any;
    private printCacheStatus;
    isLoading(): boolean;
}
