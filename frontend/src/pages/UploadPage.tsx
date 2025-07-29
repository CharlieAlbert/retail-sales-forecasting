import type React from "react";
import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  X,
  Settings,
  Database,
  Calendar,
  DollarSign,
  FileText,
  BarChart3,
  Loader2,
} from "lucide-react";

interface UploadResponse {
  message: string;
  filename: string;
  columns: string[];
  date_columns: string[];
  sales_columns: string[];
  row_count: number;
  sample_data: Record<string, unknown>[];
}

interface ConfigureResponse {
  message: string;
  date_column: string;
  sales_column: string;
  processed_records: number;
  date_range: {
    start: string;
    end: string;
  };
}

interface FileUploadProps {
  onDataConfigured: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataConfigured }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<{
    uploading: boolean;
    uploaded: boolean;
    configured: boolean;
    error: string | null;
    uploadData: UploadResponse | null;
    configureData: ConfigureResponse | null;
  }>({
    uploading: false,
    uploaded: false,
    configured: false,
    error: null,
    uploadData: null,
    configureData: null,
  });
  const [selectedColumns, setSelectedColumns] = useState<{
    dateColumn: string;
    salesColumn: string;
  }>({
    dateColumn: "",
    salesColumn: "",
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const allowedExtensions = [".csv", ".xls", ".xlsx"];
    const isValidType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      setUploadState((prev) => ({
        ...prev,
        error: "Please upload a CSV, XLS, or XLSX file.",
      }));
      return;
    }

    // Validate file size (16MB limit)
    if (file.size > 16 * 1024 * 1024) {
      setUploadState((prev) => ({
        ...prev,
        error: "File size must be less than 16MB.",
      }));
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      uploading: true,
      error: null,
      uploaded: false,
      configured: false,
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data: UploadResponse = await response.json();

      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        uploaded: true,
        uploadData: data,
      }));

      // Auto-select columns if there's only one option
      if (data.date_columns.length === 1 && data.sales_columns.length === 1) {
        setSelectedColumns({
          dateColumn: data.date_columns[0],
          salesColumn: data.sales_columns[0],
        });
      }
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }));
    }
  };

  const handleConfigure = async () => {
    if (!selectedColumns.dateColumn || !selectedColumns.salesColumn) {
      setUploadState((prev) => ({
        ...prev,
        error: "Please select both date and sales columns.",
      }));
      return;
    }

    setUploadState((prev) => ({ ...prev, uploading: true, error: null }));

    try {
      const response = await fetch("http://localhost:5000/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date_column: selectedColumns.dateColumn,
          sales_column: selectedColumns.salesColumn,
        }),
      });

      if (!response.ok) {
        throw new Error(`Configuration failed: ${response.statusText}`);
      }

      const data: ConfigureResponse = await response.json();

      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        configured: true,
        configureData: data,
      }));

      try {
        if (onDataConfigured && typeof onDataConfigured === "function") {
          console.log("Calling onDataConfigured callback...");
          onDataConfigured();
        } else {
          console.warn(
            "onDataConfigured is not a function or is undefined:",
            onDataConfigured
          );
        }
      } catch (callbackError) {
        console.error("Error calling onDataConfigured:", callbackError);
        setUploadState((prev) => ({
          ...prev,
          error:
            "Data configured successfully, but failed to refresh dashboard. Please refresh manually.",
        }));
      }
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : "Configuration failed",
      }));
    }
  };

  const handleReset = async () => {
    try {
      await fetch("http://localhost:5000/dataset/reset", { method: "POST" });
      setUploadState({
        uploading: false,
        uploaded: false,
        configured: false,
        error: null,
        uploadData: null,
        configureData: null,
      });
      setSelectedColumns({
        dateColumn: "",
        salesColumn: "",
      });

      // Call the callback after reset as well
      try {
        if (onDataConfigured && typeof onDataConfigured === "function") {
          console.log("Calling onDataConfigured callback after reset...");
          onDataConfigured();
        }
      } catch (callbackError) {
        console.error(
          "Error calling onDataConfigured after reset:",
          callbackError
        );
      }
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        error: "Failed to reset dataset",
      }));
      console.error(error);
    }
  };

  // Rest of your component remains the same...
  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className="flex items-center space-x-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              uploadState.uploaded || uploadState.configured
                ? "bg-green-100 text-green-600"
                : uploadState.uploading
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {uploadState.uploaded || uploadState.configured ? (
              <CheckCircle className="w-4 h-4" />
            ) : uploadState.uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </div>
          <span className="text-sm font-medium">Upload</span>
        </div>
        <div className="w-12 h-px bg-gray-300"></div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              uploadState.configured
                ? "bg-green-100 text-green-600"
                : uploadState.uploaded
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {uploadState.configured ? (
              <CheckCircle className="w-4 h-4" />
            ) : uploadState.uploaded ? (
              <Settings className="w-4 h-4" />
            ) : (
              <Settings className="w-4 h-4" />
            )}
          </div>
          <span className="text-sm font-medium">Configure</span>
        </div>
        <div className="w-12 h-px bg-gray-300"></div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              uploadState.configured
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Analyze</span>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            Data Upload & Configuration
          </CardTitle>
          <CardDescription className="text-base">
            Upload your sales data files for comprehensive analysis and
            forecasting
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {uploadState.error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 font-medium">
                {uploadState.error}
              </AlertDescription>
            </Alert>
          )}

          {!uploadState.uploaded ? (
            // Upload Section
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                dragActive
                  ? "border-blue-400 bg-blue-50 scale-105"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadState.uploading}
              />
              <div className="space-y-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  {uploadState.uploading ? (
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {uploadState.uploading
                      ? "Processing your file..."
                      : "Drop your file here"}
                  </h3>
                  <p className="text-gray-600">
                    Or click to browse and select a file from your computer
                  </p>
                  <div className="flex items-center justify-center space-x-4 mt-4">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      CSV
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      <File className="w-3 h-3 mr-1" />
                      Excel
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700"
                    >
                      Max 16MB
                    </Badge>
                  </div>
                </div>
                {uploadState.uploading && (
                  <div className="w-full max-w-xs mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full animate-pulse"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Analyzing your data...
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : !uploadState.configured ? (
            // Configuration Section
            <div className="space-y-8">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 text-lg">
                      File uploaded successfully!
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-green-700">
                        <span className="font-medium">
                          {uploadState.uploadData?.filename}
                        </span>
                      </p>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        {uploadState.uploadData?.row_count.toLocaleString()}{" "}
                        rows
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        {uploadState.uploadData?.columns.length} columns
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="border-green-300 bg-transparent"
                >
                  <X className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-2 border-blue-100">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <Calendar className="h-5 w-5" />
                      Date Column Selection
                    </CardTitle>
                    <CardDescription>
                      Choose the column containing your date information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <select
                      value={selectedColumns.dateColumn}
                      onChange={(e) =>
                        setSelectedColumns((prev) => ({
                          ...prev,
                          dateColumn: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select date column</option>
                      {uploadState.uploadData?.date_columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Found {uploadState.uploadData?.date_columns.length}{" "}
                      potential date column
                      {uploadState.uploadData?.date_columns.length !== 1
                        ? "s"
                        : ""}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-100">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="flex items-center gap-2 text-green-900">
                      <DollarSign className="h-5 w-5" />
                      Sales Column Selection
                    </CardTitle>
                    <CardDescription>
                      Choose the column containing your sales data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <select
                      value={selectedColumns.salesColumn}
                      onChange={(e) =>
                        setSelectedColumns((prev) => ({
                          ...prev,
                          salesColumn: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="">Select sales column</option>
                      {uploadState.uploadData?.sales_columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Found {uploadState.uploadData?.sales_columns.length}{" "}
                      potential sales column
                      {uploadState.uploadData?.sales_columns.length !== 1
                        ? "s"
                        : ""}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {uploadState.uploadData?.sample_data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Data Preview
                    </CardTitle>
                    <CardDescription>
                      Sample of your uploaded data (first 3 rows)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              {uploadState.uploadData.columns.map((col) => (
                                <th
                                  key={col}
                                  className={`px-4 py-3 text-left font-semibold text-gray-900 ${
                                    selectedColumns.dateColumn === col
                                      ? "bg-blue-100 text-blue-900"
                                      : selectedColumns.salesColumn === col
                                      ? "bg-green-100 text-green-900"
                                      : ""
                                  }`}
                                >
                                  {col}
                                  {selectedColumns.dateColumn === col && (
                                    <Badge className="ml-2 bg-blue-600">
                                      Date
                                    </Badge>
                                  )}
                                  {selectedColumns.salesColumn === col && (
                                    <Badge className="ml-2 bg-green-600">
                                      Sales
                                    </Badge>
                                  )}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {uploadState.uploadData.sample_data
                              .slice(0, 3)
                              .map((row, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b hover:bg-gray-50"
                                >
                                  {uploadState.uploadData!.columns.map(
                                    (col) => (
                                      <td
                                        key={col}
                                        className={`px-4 py-3 text-gray-700 ${
                                          selectedColumns.dateColumn === col
                                            ? "bg-blue-50 font-medium"
                                            : selectedColumns.salesColumn ===
                                              col
                                            ? "bg-green-50 font-medium"
                                            : ""
                                        }`}
                                      >
                                        {String(row[col] || "")}
                                      </td>
                                    )
                                  )}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleConfigure}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={
                  !selectedColumns.dateColumn ||
                  !selectedColumns.salesColumn ||
                  uploadState.uploading
                }
              >
                {uploadState.uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Configuring Data...
                  </>
                ) : (
                  <>
                    <Settings className="h-5 w-5 mr-2" />
                    Configure Data & Start Analysis
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Success Section
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 text-xl">
                      Data configured successfully!
                    </h3>
                    <p className="text-green-700 mt-1">
                      Using{" "}
                      <Badge className="bg-blue-600 mx-1">
                        {uploadState.configureData?.date_column}
                      </Badge>{" "}
                      for dates and{" "}
                      <Badge className="bg-green-600 mx-1">
                        {uploadState.configureData?.sales_column}
                      </Badge>{" "}
                      for sales
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="border-green-300 bg-transparent"
                >
                  <X className="h-4 w-4 mr-2" />
                  Upload New File
                </Button>
              </div>

              {uploadState.configureData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="text-center border-2 border-blue-100">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {uploadState.configureData.processed_records.toLocaleString()}
                      </div>
                      <p className="text-gray-600 font-medium">
                        Records Processed
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Successfully imported
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="text-center border-2 border-green-100">
                    <CardContent className="p-6">
                      <div className="text-lg font-bold text-green-600 mb-2">
                        {uploadState.configureData.date_range.start}
                      </div>
                      <p className="text-gray-600 font-medium">Start Date</p>
                      <p className="text-xs text-gray-500 mt-1">Data begins</p>
                    </CardContent>
                  </Card>
                  <Card className="text-center border-2 border-purple-100">
                    <CardContent className="p-6">
                      <div className="text-lg font-bold text-purple-600 mb-2">
                        {uploadState.configureData.date_range.end}
                      </div>
                      <p className="text-gray-600 font-medium">End Date</p>
                      <p className="text-xs text-gray-500 mt-1">Data ends</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Alert className="border-blue-200 bg-blue-50">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Ready for analysis!</strong> Your data has been
                  processed and is now available across all dashboard sections.
                  Navigate to Overview, Insights, or Reports to explore your
                  data.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;
