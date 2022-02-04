import { useMemo } from "react";
import { Table } from "./Table";
import { useTable } from "react-table";
import { ParsedTSV } from "./types";
import JSZip from "jszip";
import Papa from "papaparse";
import { Result } from "./types";

const getZipFromBytes = (bytes: Blob): Promise<JSZip> => {
  let zip = new JSZip();
  return zip.loadAsync(bytes);
};

export const getResult = async (bytes: Blob): Promise<Result> => {
  const zip = await getZipFromBytes(bytes);
  const systems = await getSystems(zip);
  const error = await getError(zip);
  return [error, systems];
};

const getError = async (zip: JSZip) => {
  const errorZipObjects = zip.file(/error/);
  if (errorZipObjects.length === 0) {
    return undefined;
  }
  const errorZipObject = errorZipObjects[0];
  return errorZipObject.async("text");
};

const getSystems = async (zip: JSZip) => {
  const systemsZipObjects = zip.file(/system/);
  if (systemsZipObjects.length === 0) {
    return null;
  }
  const systemsZipObject = systemsZipObjects[0];
  const systemsFileRaw = await systemsZipObject.async("text");
  const systemsFile = Papa.parse(systemsFileRaw.trim(), {
    delimiter: "\t",
  }).data;
  return systemsFile;
};

const formatParsedTSV = (tsv: ParsedTSV) => {
  const [head, ...body] = tsv;
  if (!head) return { data: [], columns: [] };
  const data = body.map((l) => {
    const row = {};
    l.forEach((val, idx) => {
      const key = head[idx];
      (row as any)[key] = val;
    });
    return row;
  });
  const columns = head.map((h) => ({
    Header: h,
    accessor: h,
  }));
  return {
    data,
    columns,
  };
};

export const Systems = ({ systems }: { systems?: ParsedTSV }) => {
  const tableData = useMemo(() => formatParsedTSV(systems || []), [systems]);
  const tableInstance = useTable(tableData);
  if (!systems || systems.length < 2)
    return (
      <div className="border border-black p-2 bg-beige text-shrimp">
        No defense systems were found.
      </div>
    );
  return (
    <div style={{ overflowX: "scroll" }} className="pb-4">
      <Table tableInstance={tableInstance} />
    </div>
  );
};
