interface DialogFlowViewport {
  getViewport: () => { x: number; y: number; zoom: number };
  fitView: (options: {
    nodes: Array<{ id: string }>;
    duration: number;
    padding: number;
  }) => void | Promise<boolean>;
}

let flowInstance: DialogFlowViewport | null = null;
let focusNodeName: string | null = null;

export const setDialogFlowInstance = (instance: DialogFlowViewport | null) => {
  flowInstance = instance;
};

export const getDialogFlowInstance = () => flowInstance;

export const queueDialogNodeFocus = (nodeName: string) => {
  focusNodeName = nodeName;
};

export const peekQueuedDialogNodeFocus = () => focusNodeName;

export const clearQueuedDialogNodeFocus = () => {
  focusNodeName = null;
};
