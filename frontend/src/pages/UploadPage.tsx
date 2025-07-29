import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

      // Notify parent component that data has been configured
      onDataConfigured();
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

      onDataConfigured();
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        error: "Failed to reset dataset",
      }));
      console.error(error);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Upload & Configuration
        </CardTitle>
        <CardDescription>
          Upload your own CSV or Excel file to analyze sales data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uploadState.error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {uploadState.error}
            </AlertDescription>
          </Alert>
        )}

        {!uploadState.uploaded ? (
          // Upload Section
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
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

            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {uploadState.uploading
                    ? "Uploading..."
                    : "Drop your file here"}
                </p>
                <p className="text-sm text-gray-500">
                  Or click to select a file (CSV, XLS, XLSX - max 16MB)
                </p>
              </div>

              {uploadState.uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full animate-pulse"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ) : !uploadState.configured ? (
          // Configuration Section
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    File uploaded successfully!
                  </p>
                  <p className="text-sm text-green-700">
                    {uploadState.uploadData?.filename} (
                    {uploadState.uploadData?.row_count} rows)
                  </p>
                </div>
              </div>
              <Button onClick={handleReset} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Date Column
                </label>
                <select
                  value={selectedColumns.dateColumn}
                  onChange={(e) =>
                    setSelectedColumns((prev) => ({
                      ...prev,
                      dateColumn: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select date column</option>
                  {uploadState.uploadData?.date_columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Detected {uploadState.uploadData?.date_columns.length}{" "}
                  potential date columns
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="h-4 w-4" />
                  Sales Column
                </label>
                <select
                  value={selectedColumns.salesColumn}
                  onChange={(e) =>
                    setSelectedColumns((prev) => ({
                      ...prev,
                      salesColumn: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select sales column</option>
                  {uploadState.uploadData?.sales_columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Detected {uploadState.uploadData?.sales_columns.length}{" "}
                  potential sales columns
                </p>
              </div>
            </div>

            {uploadState.uploadData?.sample_data && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Sample Data Preview
                </label>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-40">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {uploadState.uploadData.columns.map((col) => (
                            <th
                              key={col}
                              className="px-3 py-2 text-left font-medium text-gray-900"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadState.uploadData.sample_data
                          .slice(0, 3)
                          .map((row, idx) => (
                            <tr key={idx} className="border-t">
                              {uploadState.uploadData!.columns.map((col) => (
                                <td
                                  key={col}
                                  className="px-3 py-2 text-gray-700"
                                >
                                  {String(row[col] || "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleConfigure}
              className="w-full"
              disabled={
                !selectedColumns.dateColumn ||
                !selectedColumns.salesColumn ||
                uploadState.uploading
              }
            >
              <Settings className="h-4 w-4 mr-2" />
              {uploadState.uploading ? "Configuring..." : "Configure Data"}
            </Button>
          </div>
        ) : (
          // Success Section
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    Data configured successfully!
                  </p>
                  <p className="text-sm text-green-700">
                    Using {uploadState.configureData?.date_column} for dates and{" "}
                    {uploadState.configureData?.sales_column} for sales
                  </p>
                </div>
              </div>
              <Button onClick={handleReset} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>

            {uploadState.configureData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {uploadState.configureData.processed_records}
                  </p>
                  <p className="text-sm text-gray-600">Records Processed</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {uploadState.configureData.date_range.start}
                  </p>
                  <p className="text-xs text-gray-600">Start Date</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {uploadState.configureData.date_range.end}
                  </p>
                  <p className="text-xs text-gray-600">End Date</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
