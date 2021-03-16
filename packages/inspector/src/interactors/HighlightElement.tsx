import { useStore } from "effector-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { $target } from "../actions";

export function HighlightElement() {
  const target = useStore($target);

  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!target || !portalRef.current) return;

    const { top, left, width, height } = target.getBoundingClientRect();
    const portalStyle = portalRef.current.style;

    portalStyle.backgroundColor = "cornflowerblue";
    portalStyle.opacity = "0.6";
    portalStyle.position = "absolute";
    portalStyle.zIndex = "10000";
    portalStyle.top = `${top}px`;
    portalStyle.left = `${left}px`;
    portalStyle.width = `${width}px`;
    portalStyle.height = `${height}px`;
  }, [target]);

  return target ? createPortal(<div ref={portalRef} />, document.body) : null;
}
