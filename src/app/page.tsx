"use client"

import { useState } from "react"
import { StepIndicator } from "@/components/step-indicator"
import { StepOne } from "@/components/step-one"
import { StepTwo } from "@/components/step-two"
import { StepThree } from "@/components/step-three"

export type PipelineData = {
  uploadedFile: File | null
  imageUrl: string | null
  labels: Array<{ id: string; x: number; y: number; label: string }>
  statistics: Array<{
    id: string
    type: string
    location: string
    quantity: number
    material: string
    finish: string
    frame: string
    lock: string
    handle: string
    notes: string
  }>
}

export default function Page() {
  const [currentStep, setCurrentStep] = useState(1)
  const [pipelineData, setPipelineData] = useState<PipelineData>({
    uploadedFile: null,
    imageUrl: null,
    labels: [],
    statistics: [],
  })

  // Pipeline state handlers to share data across steps
  const updatePipelineData = (updates: Partial<PipelineData>) => {
    setPipelineData((prev) => ({ ...prev, ...updates }))
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header with branding */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Construction Pipeline</h1>
              <p className="text-sm text-muted-foreground mt-1">Automated floor plan analysis system</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">v1.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Step indicator navigation */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <StepIndicator currentStep={currentStep} onStepClick={goToStep} pipelineData={pipelineData} />
        </div>
      </div>

      {/* Dynamic step content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        {currentStep === 1 && (
          <StepOne
            pipelineData={pipelineData}
            updatePipelineData={updatePipelineData}
            goToNextStep={() => goToStep(2)}
          />
        )}
        {currentStep === 2 && (
          <StepTwo
            pipelineData={pipelineData}
            updatePipelineData={updatePipelineData}
            goToNextStep={() => goToStep(3)}
            goToPrevStep={() => goToStep(1)}
          />
        )}
        {currentStep === 3 && (
          <StepThree pipelineData={pipelineData} goToPrevStep={() => goToStep(2)} goToStep={goToStep} />
        )}
      </div>
    </main>
  )
}
