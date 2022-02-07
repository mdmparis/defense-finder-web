import { useEffect, useRef } from "react";
import { drawSystems } from "./visualization";

export const Visualization = ({
  contigData,
  systemData,
}: {
  contigData: object;
  systemData: object;
}) => {
  const contigBoxRef = useRef(null);
  const geneBoxRef = useRef(null);

  useEffect(() => {
    return drawSystems(
      contigBoxRef.current,
      geneBoxRef.current,
      contigData,
      systemData
    );
  }, [contigData, systemData]);

  return (
    <div
      className="border mb-6"
      style={{
        position: "relative",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "4fr 6fr",
      }}
    >
      <div
        ref={contigBoxRef}
        style={{
          background: "#000",
          overflowY: "scroll",
          overflowX: "hidden",
          height: "600px",
        }}
      ></div>
      <div ref={geneBoxRef} style={{ background: "#FBFCFC" }}></div>
    </div>
  );
};
