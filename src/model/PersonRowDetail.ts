import type {RowState} from "./Constants.ts";

export interface PersonRowDetail {
    editable: boolean,
    state: RowState
}