"use client"

import { useMemo, useState, useEffect } from "react"
import { Download, FileSpreadsheet, ArrowLeft, RotateCcw, Share2, Printer, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { PipelineData } from "@/app/page"

type StepThreeProps = {
  pipelineData: PipelineData
  goToPrevStep: () => void
  goToStep: (step: number) => void
}

export function StepThree({ pipelineData, goToPrevStep, goToStep }: StepThreeProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isGenerating, setIsGenerating] = useState(true)

  // Simulate report generation with 3-5 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false)
    }, 3000 + Math.random() * 2000) // Random 3-5 seconds
    return () => clearTimeout(timer)
  }, [])

  // Label specifications mapping
  const getLabelSpec = (labelName: string) => {
    const specs: Record<string, { type: string; material: string; finish: string; frame: string; lock: string; notes: string }> = {
      "SD": { type: "鋼製片引きドア", material: "鋼製(S)1.6t", finish: "SOP", frame: "見付25/見込222", lock: "シリンダー/空錠", notes: "SUS HL" },
      "ASD": { type: "鋼製自動片引きドア", material: "鋼製(S)1.6t", finish: "SOP", frame: "見付25/見込222", lock: "自動", notes: "SUS HL" },
      "ASSD": { type: "ステンレス自動ドア", material: "ステンレス鋼板", finish: "HL", frame: "見付25/見込222", lock: "自動", notes: "SUS HL" },
      "ALSD": { type: "鋼製片引きドア", material: "鋼製(S)1.6t", finish: "SOP", frame: "見付25/見込222", lock: "シリンダー/空錠", notes: "SUS HL" },
      "LSD": { type: "鋼製片引きドア (LS)", material: "鋼製(LS)1.6t", finish: "SOP", frame: "見付25/見込222", lock: "シリンダー/空錠", notes: "SUS FB" },
      "PD": { type: "木製パネルドア", material: "木製(ｱﾙﾐﾌﾚｰﾑ)", finish: "塗装", frame: "見付30/見込55", lock: "シリンダー", notes: "高台排水" },
      "FS": { type: "スチール防火戸", material: "スチール(耐火)", finish: "DP", frame: "見付135/見込115", lock: "防火", notes: "鋼製" },
      "FSH": { type: "スチール防煙戸", material: "スチール(防煙)", finish: "DP", frame: "見付135/見込115", lock: "防煙", notes: "鋼製" },
      "LS": { type: "軽量シャッター", material: "軽量シャッター", finish: "塗装", frame: "-", lock: "-", notes: "鋼製" },
      "FC": { type: "高速シャッター", material: "高速シャッター", finish: "塗装", frame: "-", lock: "-", notes: "鋼製" },
      "TB": { type: "トイレブース", material: "ﾄｲﾚﾌﾞｰｽ", finish: "ﾒﾗﾐﾝ", frame: "見付40", lock: "-", notes: "なし" },
      "AW": { type: "アルミ窓", material: "アルミ(AL)", finish: "アルマイト", frame: "見付100/見込70", lock: "-", notes: "アルミ" },
      "AAD": { type: "アルミ自動ドア", material: "アルミ自動ドア", finish: "アルマイト", frame: "見付100/見込220", lock: "自動", notes: "アルミ" },
      "SF": { type: "鋼製フィックス", material: "鋼製(S)1.6t", finish: "SOP", frame: "見付25/見込220", lock: "-", notes: "SUS FB" },
      "SP": { type: "ガラスパーティション", material: "ｶﾞﾗｽﾊﾟｰﾃｨｼｮﾝ", finish: "強化ｶﾞﾗｽ", frame: "見付75/見込12", lock: "-", notes: "なし" },
    }
    const prefix = labelName.match(/^[A-Za-z]+/)?.[0]?.toUpperCase() || ""
    // Find matching prefix (longest match first)
    const sortedPrefixes = Object.keys(specs).sort((a, b) => b.length - a.length)
    for (const p of sortedPrefixes) {
      if (prefix.startsWith(p)) return specs[p]
    }
    return { type: "ドア", material: "N/A", finish: "N/A", frame: "N/A", lock: "N/A", notes: "N/A" }
  }

  // Group labels by name and count quantity
  const generatedStats = useMemo(() => {
    const groups: Record<string, { mark: string; count: number }> = {}
    
    pipelineData.labels.forEach(label => {
      if (!groups[label.label]) {
        groups[label.label] = { mark: label.label, count: 0 }
      }
      groups[label.label].count++
    })
    
    return Object.values(groups)
      .sort((a, b) => a.mark.localeCompare(b.mark))
      .map((group, index) => {
        const spec = getLabelSpec(group.mark)
        return {
          id: `stat-${index}`,
          mark: group.mark,
          type: spec.type,
          quantity: group.count,
          doorMaterial: spec.material,
          finish: spec.finish,
          frame: spec.frame,
          lock: spec.lock,
          notes: spec.notes,
        }
      })
  }, [pipelineData.labels])

  const filteredStats = useMemo(() => {
    return generatedStats.filter(
      (stat) =>
        stat.mark.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.doorMaterial.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [generatedStats, searchTerm])
  
  // Calculate total quantity
  const totalQuantity = useMemo(() => {
    return filteredStats.reduce((sum, stat) => sum + stat.quantity, 0)
  }, [filteredStats])

  const handleExport = () => {
    alert("Exporting data to Excel format (.xlsx)...")
  }

  const handleReset = () => {
    if (confirm("Reset the pipeline and start over?")) {
      window.location.reload()
    }
  }

  // Show loading state while generating report
  if (isGenerating) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-6">Generating Report...</h3>
          <p className="text-sm text-muted-foreground mt-2">Processing {pipelineData.labels.length} detected labels</p>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
        
        {/* Skeleton preview */}
        <Card className="border shadow-sm">
          <CardHeader className="bg-muted/30 border-b py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-9 w-48" />
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 border-primary/20 text-primary text-xs bg-primary/5">
            Generated Report
          </Badge>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>
            Door Statistics Schedule
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Steel Automatic Sliding Door Configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="h-9 bg-transparent" disabled={isGenerating}>
            <Download className="w-4 h-4 mr-2" /> Export Excel
          </Button>
          <Button variant="outline" size="sm" className="h-9 bg-transparent" disabled={isGenerating}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border shadow-sm">
          <CardHeader className="bg-muted/30 border-b py-4 px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold">Project Data</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {generatedStats.length} types / {pipelineData.labels.length} total units
                </CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by mark, type, material..."
                  className="pl-10 h-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto custom-scrollbar">
              <Table className="w-full">
                <TableHeader className="bg-muted/20">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px] font-semibold text-xs py-4 pl-6">Mark</TableHead>
                    <TableHead className="font-semibold text-xs">Type</TableHead>
                    <TableHead className="font-semibold text-xs text-center">Qty</TableHead>
                    <TableHead className="font-semibold text-xs">Material</TableHead>
                    <TableHead className="font-semibold text-xs">Finish</TableHead>
                    <TableHead className="font-semibold text-xs">Frame</TableHead>
                    <TableHead className="font-semibold text-xs">Lock</TableHead>
                    <TableHead className="font-semibold text-xs pr-6">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStats.length > 0 ? (
                    <>
                      {filteredStats.map((stat) => (
                        <TableRow key={stat.id} className="hover:bg-muted/30 h-12">
                          <TableCell className="pl-6 font-mono font-bold text-sm text-primary">{stat.mark}</TableCell>
                          <TableCell className="text-xs">{stat.type}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="font-bold text-sm bg-blue-100 text-blue-700">
                              {stat.quantity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{stat.doorMaterial}</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                              {stat.finish}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{stat.frame}</TableCell>
                          <TableCell className="text-xs">{stat.lock}</TableCell>
                          <TableCell className="text-xs text-muted-foreground pr-6">{stat.notes}</TableCell>
                        </TableRow>
                      ))}
                      {/* Total row */}
                      <TableRow className="bg-muted/30 font-semibold border-t-2">
                        <TableCell className="pl-6 text-sm">Total</TableCell>
                        <TableCell className="text-xs">{filteredStats.length} types</TableCell>
                        <TableCell className="text-center">
                          <Badge className="font-bold text-sm bg-primary text-white">
                            {totalQuantity}
                          </Badge>
                        </TableCell>
                        <TableCell colSpan={5} className="pr-6"></TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                        No results found matching "{searchTerm}"
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="ghost" onClick={goToPrevStep} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Mapping
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button variant="destructive" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reset Pipeline
          </Button>
        </div>
      </div>
    </div>
  )
}
