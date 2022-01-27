import { useEffect, useState } from "react";
import { Systems, getResult } from "../Results/Systems";
import { Err } from "../Results/Err";
import IframeResizer from "iframe-resizer-react";
import { Visualization } from "../Visualization/Visualization";

const taskId = "4aad3b99-1908-42b3-a1cd-4788f058fe45"; // TODO

const getDfOutput = (outputs: any) => {
  return outputs[taskId][0];
};

export function ProteinForm() {
  const [systems, setSystems] = useState();
  const [error, setError] = useState<string | undefined>();

  const resetResults = () => {
    setSystems(undefined);
    setError(undefined);
  };

  const loadSystems = async (url: string) => {
    const response = await fetch(url);
    const bytes = await response.blob();
    const [error, systems] = await getResult(bytes);
    if (systems) {
      console.log("systems", systems);
      setSystems(systems as any);
    } else {
      setError(error);
    }
  };

  useEffect(() => {
    const listener = (event: any) => {
      if (typeof event.data !== "object" || !event.data) return;
      if (event.data.emitter === "exomodule") {
        console.log("event", event);
        const message = event.data.message;
        if (message.type === "RUN_OUTPUTS") {
          const dfOutput = getDfOutput(message.outputs);
          loadSystems(dfOutput.url);
        } else if (message.type === "NAV_TO_NEW_RUN") {
          resetResults();
        }
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  return (
    <div className="container mx-auto relative">
      <IframeResizer
        title="exomodule-defense-finder"
        src="http://localhost:3000/ws/11dc47e2-2156-4fab-bf35-90b75d49acce"
        style={{ height: "100%", minHeight: "100%", width: "100%" }}
        className="mb-8"
      />

      <Visualization />
      <div className="p-1">
        {systems ? (
          <Systems systems={systems} />
        ) : error ? (
          <Err error={error!} />
        ) : null}
      </div>
    </div>
  );
}
