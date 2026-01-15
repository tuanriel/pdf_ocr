"use client"

import { Upload, MapPin, FileSpreadsheet, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PipelineData } from "@/app/page"

type StepIndicatorProps = {
  currentStep: number
  onStepClick: (step: number) => void
  pipelineData: PipelineData
}

const steps = [
  {
    number: 1,
    title: "Upload Drawing",
    subtitle: "Technical floor plan",
    icon: Upload,
  },
  {
    number: 2,
    title: "Map Coordinates",
    subtitle: "Auto-detect labels",
    icon: MapPin,
  },
  {
    number: 3,
    title: "View Statistics",
    subtitle: "Generated report",
    icon: FileSpreadsheet,
  },
]

export function StepIndicator({ currentStep, onStepClick, pipelineData }: StepIndicatorProps) {
  const canNavigateToStep = (stepNumber: number): boolean => {
    if (stepNumber === 1) return true
    if (stepNumber === 2) return !!pipelineData.imageUrl
    if (stepNumber === 3) return pipelineData.labels.length > 0
    return false
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-[1px] bg-border z-0" style={{ left: "5%", right: "5%" }} />
          <div
            className="absolute top-5 left-0 h-[1px] bg-primary z-0"
            style={{
              left: "5%",
              width: `${((currentStep - 1) / (steps.length - 1)) * 90}%`,
            }}
          />

          {steps.map((step) => {
            const isCompleted = step.number < currentStep
            const isCurrent = step.number === currentStep
            const isClickable = canNavigateToStep(step.number)
            const Icon = step.icon

            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center gap-3 z-10"
                onClick={() => isClickable && onStepClick(step.number)}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "bg-primary border-primary text-primary-foreground",
                    !isCompleted && !isCurrent && "bg-white border-border text-muted-foreground",
                    isClickable && "cursor-pointer hover:border-primary",
                    !isClickable && "cursor-not-allowed opacity-40",
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                <div className="text-center">
                  <div className={cn("text-sm font-semibold", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 hidden md:block">{step.subtitle}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
