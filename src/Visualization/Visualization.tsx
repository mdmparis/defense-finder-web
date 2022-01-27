import { useEffect, useRef } from "react";
import { drawSystems } from "./visualization";

export const Visualization = () => {
  const contigBoxRef = useRef(null);
  const geneBoxRef = useRef(null);

  useEffect(() => {
    return drawSystems(contigBoxRef.current, geneBoxRef.current);
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "700px",
        display: "grid",
        gridTemplateColumns: "4fr 6fr",
      }}
    >
      <div ref={contigBoxRef} className="bg-beige"></div>
      <div ref={geneBoxRef} style={{ background: "#FBFCFC" }}></div>
    </div>
  );
};
