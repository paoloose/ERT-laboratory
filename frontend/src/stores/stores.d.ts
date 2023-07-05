// All tools classes will implement CanvasToolBase
interface CanvasToolBase {
  readonly name: string;
  readonly icon: string;
}

type ResistivityBrush = {
  name: string;
  value: number;
};
