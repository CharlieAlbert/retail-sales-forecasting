import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-4xl font-bold text-gray-900">
        Sales Forecasting App
      </h1>
      <p className="text-gray-600 max-w-md text-center">
        Your modern React frontend is ready! This will connect to your Python backend.
      </p>
      <Button>Get Started</Button>
    </div>
  )
}

export default App