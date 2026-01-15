"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileType, X, ArrowRight, CheckCircle2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { PipelineData } from "@/app/page"

type StepOneProps = {
  pipelineData: PipelineData
  updatePipelineData: (updates: Partial<PipelineData>) => void
  goToNextStep: () => void
}

export function StepOne({ pipelineData, updatePipelineData, goToNextStep }: StepOneProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.")
        return
      }

      setError(null)
      const url = URL.createObjectURL(file)
      updatePipelineData({ uploadedFile: file, imageUrl: url })
    },
    [updatePipelineData],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".svg"] },
    multiple: false,
  })

  const removeFile = () => {
    updatePipelineData({ uploadedFile: null, imageUrl: null })
    setError(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="border-b py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Upload Floor Plan</CardTitle>
              <CardDescription className="text-sm">Architectural drawing pipeline</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {!pipelineData.imageUrl ? (
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center h-80 rounded-lg border-2 border-dashed",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30",
                "cursor-pointer",
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {isDragActive ? "Release to upload" : "Select floor plan file"}
                  </p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, SVG up to 10MB</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative group rounded-lg overflow-hidden border aspect-video bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pipelineData.imageUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <Button variant="destructive" size="sm" onClick={removeFile} className="shadow">
                    <X className="w-4 h-4 mr-2" /> Remove File
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center">
                    <FileType className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{pipelineData.uploadedFile?.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {pipelineData.uploadedFile ? (pipelineData.uploadedFile.size / 1024 / 1024).toFixed(2) : 0} MB
                    </p>
                  </div>
                </div>
                <Button onClick={goToNextStep} className="h-10 px-6 font-semibold shadow">
                  Analyze Drawing <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-2 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileType className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">File Quality</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Use high-resolution images for accurate detection
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-2 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Supported Formats</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">JPG, PNG, and SVG files up to 10MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-2 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Privacy</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Files are processed locally in your browser
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
