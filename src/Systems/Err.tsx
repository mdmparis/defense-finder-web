export const Err = ({ error }: { error: string }) => {
  return (
    <div className="border p-4">
      <div className="text-lg text-shrimp mb-2">Something went wrong</div>
      <div className="mb-2">
        DefenseFinder couldn't handle your file. This generally occurs when
        MacSyFinder can't handle the uploaded file. Please take the following
        error message in account and if ever the problem persists, feel free to{" "}
        <a
          className="text-shrimp"
          href="https://github.com/mdmparis/defense-finder-web/issues"
        >
          open an issue
        </a>
        .
      </div>
      <div className="border bg-gray-100">{error}</div>
    </div>
  );
};
