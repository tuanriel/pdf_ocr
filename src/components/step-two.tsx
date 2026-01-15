"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { ArrowLeft, Scan, Loader2, X, Upload, Eye, Lock, Crosshair, ArrowUpDown, ArrowUp, ArrowDown, ZoomIn, ZoomOut, RotateCcw, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useDropzone } from "react-dropzone"
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch"
import { cn } from "@/lib/utils"
import type { PipelineData } from "@/app/page"

type StepTwoProps = {
  pipelineData: PipelineData
  updatePipelineData: (updates: Partial<PipelineData>) => void
  goToNextStep: () => void
  goToPrevStep: () => void
}

type YOLOLabel = {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
  classId: number
  confidence: number
}

type SortMode = "default" | "name-asc" | "name-desc" | "position"

// Classes from classes.txt
const classes = [
  "SD5", "ALSD10", "ALSD2", "ASSD3", "ASSD1", "ALSD11", "SD8", "ASD1", "ALSD4", "PD2",
  "ALSD8", "SD12", "LS3", "FS4", "TB2", "TB1", "LSD10", "LSD2", "SD7", "LSD1",
  "LSD12", "ALSD3", "PD3", "ALSD12", "SD4", "SD3", "LSD4", "LSD20", "FSH2", "ALSD9",
  "ALSD5", "FS1", "FC8", "SD6", "LSD11", "SD11", "FS5", "ASD2", "AW3", "LSD7",
  "LSD8", "SF1", "FS2", "SD10", "FC9", "FSH1", "ALSD7", "PD1", "FC10", "FS3",
  "SD9", "FC4", "LS1", "LS2", "FC3", "FC2", "SD1", "FC1", "SP1", "AW2",
  "LSD14", "FC6", "FC5", "AAD3", "SD2", "AAD2", "LSD18", "LSD3", "LSD5", "LSD6",
  "LSD17", "LSD16", "FC7", "TB3", "TB4", "AAD1", "AW1", "LS19"
]

// YOLO data from page_001.txt
const yoloDataRaw = [
  "0 0.280818 0.187144 0.016329 0.023660",
  "1 0.399909 0.256129 0.016027 0.022520",
  "2 0.453432 0.198475 0.014011 0.018957",
  "3 0.444411 0.256343 0.013104 0.019812",
  "4 0.462806 0.255487 0.014212 0.018957",
  "5 0.435490 0.282568 0.016027 0.021807",
  "6 0.202651 0.258338 0.015220 0.022948",
  "7 0.500302 0.194555 0.014212 0.019669",
  "8 0.325673 0.287628 0.014313 0.020239",
  "8 0.344219 0.287486 0.013708 0.018814",
  "8 0.366697 0.287700 0.014313 0.019242",
  "8 0.339028 0.341933 0.013607 0.019384",
  "8 0.480647 0.367446 0.014011 0.019669",
  "8 0.537547 0.364952 0.013910 0.019242",
  "8 0.498992 0.284493 0.013607 0.020239",
  "8 0.278853 0.313640 0.013607 0.020667",
  "8 0.301482 0.337799 0.013910 0.019384",
  "8 0.304556 0.381414 0.013607 0.020239",
  "8 0.295787 0.425599 0.015019 0.021095",
  "8 0.328445 0.448404 0.014011 0.018814",
  "8 0.285707 0.449330 0.013003 0.019812",
  "9 0.269126 0.452680 0.014313 0.020239",
  "10 0.301431 0.283994 0.017236 0.023803",
  "11 0.520764 0.197050 0.014011 0.020097",
  "12 0.536891 0.198190 0.013809 0.019527",
  "13 0.527820 0.284920 0.015422 0.023090",
  "14 0.589558 0.194627 0.014111 0.020382",
  "15 0.607348 0.194627 0.014414 0.019812",
  "16 0.640157 0.231970 0.014111 0.019527",
  "17 0.640359 0.266035 0.013708 0.020667",
  "18 0.644491 0.288697 0.017942 0.024658",
  "19 0.677301 0.283709 0.014011 0.019527",
  "20 0.203256 0.472491 0.014011 0.020239",
  "8 0.350217 0.454247 0.014817 0.020239",
  "9 0.262222 0.530573 0.013809 0.019812",
  "21 0.228656 0.534493 0.013003 0.020239",
  "21 0.228404 0.610818 0.013104 0.019812",
  "21 0.322599 0.571907 0.014011 0.019812",
  "21 0.324312 0.534849 0.014011 0.020097",
  "22 0.231579 0.691633 0.014011 0.020097",
  "6 0.204818 0.722420 0.014515 0.021237",
  "8 0.231630 0.716719 0.014515 0.019527",
  "23 0.347142 0.717574 0.015926 0.022662",
  "7 0.227800 0.803022 0.014313 0.020525",
  "24 0.249168 0.803592 0.014313 0.020239",
  "25 0.363875 0.795396 0.015523 0.022662",
  "25 0.295888 0.794897 0.015220 0.022235",
  "26 0.312821 0.761759 0.015220 0.021237",
  "27 0.248916 0.760334 0.013809 0.021807",
  "28 0.397188 0.703535 0.017236 0.023660",
  "23 0.289638 0.718144 0.016027 0.022948",
  "29 0.414122 0.718572 0.015220 0.023233",
  "30 0.441437 0.752281 0.014212 0.020525",
  "31 0.285102 0.337942 0.016228 0.023375",
  "31 0.321087 0.339153 0.015422 0.024373",
  "4 0.322195 0.382839 0.013809 0.019099",
  "4 0.342455 0.311217 0.014011 0.018387",
  "4 0.432819 0.198475 0.013708 0.019812",
  "32 0.522074 0.222491 0.013809 0.019099",
  "33 0.538807 0.225627 0.015220 0.021950",
  "31 0.499849 0.366306 0.015926 0.023945",
  "34 0.578168 0.271308 0.013910 0.019812",
  "35 0.559167 0.271594 0.016228 0.023803",
  "36 0.623223 0.461730 0.018143 0.024373",
  "8 0.386050 0.384265 0.013305 0.020239",
  "8 0.418355 0.383552 0.013607 0.019669",
  "8 0.413970 0.439852 0.013910 0.020239",
  "8 0.439472 0.441491 0.014313 0.019812",
  "8 0.466183 0.441277 0.013708 0.019384",
  "2 0.316904 0.497363 0.013708 0.021237",
  "8 0.602207 0.541690 0.014615 0.019812",
  "8 0.520814 0.572477 0.014313 0.019812",
  "21 0.495767 0.610462 0.013607 0.020239",
  "21 0.472634 0.610462 0.014313 0.020239",
  "21 0.411854 0.610034 0.013708 0.020239",
  "30 0.474095 0.716861 0.014615 0.020667",
  "37 0.470719 0.198047 0.013708 0.019242",
  "38 0.623072 0.186716 0.014011 0.021665",
  "8 0.558663 0.332027 0.014011 0.019812",
  "39 0.627104 0.284279 0.013003 0.019812",
  "40 0.625643 0.258267 0.013910 0.019384",
  "41 0.599788 0.346280 0.013607 0.020667",
  "31 0.397087 0.448831 0.017236 0.025371",
  "9 0.408931 0.578250 0.013708 0.020239",
  "9 0.261365 0.607682 0.014313 0.019242",
  "42 0.491231 0.707241 0.015623 0.022520",
  "42 0.474902 0.747221 0.018849 0.025228",
  "8 0.510735 0.749074 0.014313 0.019812",
  "30 0.513658 0.706956 0.013708 0.020239",
  "43 0.517035 0.648161 0.017236 0.022948",
  "31 0.520966 0.598275 0.017236 0.024373",
  "8 0.603367 0.661060 0.013708 0.020239",
  "44 0.622568 0.559649 0.015019 0.019812",
  "44 0.622719 0.606970 0.013910 0.019812",
  "45 0.622417 0.582811 0.019151 0.024800",
  "45 0.622266 0.630701 0.018849 0.024800",
  "31 0.623223 0.663127 0.018143 0.024373",
  "46 0.599133 0.421893 0.014313 0.021095",
  "47 0.595202 0.704675 0.014313 0.020239",
  "48 0.620300 0.701254 0.013708 0.019669",
  "49 0.638293 0.702395 0.017236 0.024800",
  "50 0.614454 0.746579 0.014313 0.021095",
  "0 0.599486 0.798247 0.015019 0.019812",
  "29 0.482411 0.450613 0.016329 0.024373",
  "51 0.781574 0.716648 0.014313 0.019384",
  "52 0.845278 0.679376 0.013708 0.019242",
  "52 0.845630 0.605331 0.013607 0.020239",
  "52 0.845278 0.508623 0.014313 0.019812",
  "53 0.857625 0.408352 0.013607 0.018814",
  "54 0.816652 0.661488 0.013708 0.020239",
  "55 0.781272 0.604689 0.014313 0.019812",
  "55 0.781222 0.511616 0.015019 0.021237",
  "56 0.853593 0.475057 0.014011 0.019669",
  "57 0.817357 0.606756 0.016934 0.024800",
  "57 0.815996 0.512044 0.016228 0.022092",
  "16 0.808386 0.473204 0.014716 0.020810",
  "58 0.854047 0.231328 0.016934 0.023375",
  "59 0.865084 0.253207 0.015623 0.019242",
  "60 0.864832 0.277509 0.014313 0.020239",
  "61 0.814384 0.398090 0.013607 0.020239",
  "62 0.850318 0.386117 0.015926 0.020239",
  "63 0.862211 0.349059 0.013708 0.019669",
  "64 0.852938 0.435291 0.013305 0.019384",
  "65 0.793116 0.170182 0.015220 0.022520",
  "59 0.724826 0.186003 0.014716 0.020239",
  "66 0.714091 0.247933 0.015220 0.020667",
  "67 0.771142 0.283994 0.015623 0.022948",
  "68 0.758442 0.243515 0.016228 0.022948",
  "69 0.736670 0.257839 0.016228 0.024800",
  "70 0.795535 0.284920 0.016833 0.023090",
  "71 0.645298 0.382625 0.017539 0.023518",
  "72 0.648372 0.415051 0.014615 0.021095",
  "17 0.720895 0.334094 0.013305 0.019384",
  "73 0.671505 0.369798 0.013910 0.019812",
  "74 0.690354 0.371152 0.014716 0.018814",
  "31 0.361556 0.428663 0.015724 0.024088",
  "8 0.361909 0.407853 0.014011 0.018387",
  "43 0.399153 0.658139 0.017740 0.024658",
  "1 0.486141 0.259835 0.015724 0.022235",
  "75 0.836508 0.169684 0.015724 0.021522",
  "76 0.782582 0.186859 0.016732 0.021095",
  "77 0.623526 0.335091 0.013708 0.020239",
]

const parseYOLOData = (): YOLOLabel[] => {
  return yoloDataRaw.map((line, index) => {
    const parts = line.trim().split(/\s+/)
    const classId = parseInt(parts[0], 10)
    const x = parseFloat(parts[1])
    const y = parseFloat(parts[2])
    const w = parseFloat(parts[3])
    const h = parseFloat(parts[4])
    const label = classes[classId] || `Unknown${classId}`
    const confidence = 0.85 + Math.random() * 0.15
    return { id: `label-${index}`, x, y, w, h, label, classId, confidence }
  })
}

export function StepTwo({ pipelineData, updatePipelineData, goToNextStep, goToPrevStep }: StepTwoProps) {
  const [currentScale, setCurrentScale] = useState(0.1)
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>("default")
  const [detailsLabel, setDetailsLabel] = useState<YOLOLabel | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  
  const [filterMaterial, setFilterMaterial] = useState("")
  const [filterFinish, setFilterFinish] = useState("")
  const [filterFrame, setFilterFrame] = useState("")
  
  const [referenceDocs, setReferenceDocs] = useState<Array<{ id: string; file: File; previewUrl: string }>>([])
  const [processingDocs, setProcessingDocs] = useState<Set<string>>(new Set()) // Track documents being processed

  const prefixToDocumentMap: Record<string, string> = {
    "ASD": "page_002.png", "ASSD": "page_002.png", "SD": "page_002.png",
    "PD": "page_003.png", "ALSD": "page_003.png",
    "LSD": "page_004.png",
    "FS": "page_005.png", "FSH": "page_005.png", "LS": "page_005.png", "FC": "page_005.png",
  }

  const getRequiredDocument = useCallback((labelName: string): string | null => {
    const prefix = labelName.match(/^[A-Za-z]+/)?.[0]?.toUpperCase() || ""
    const sortedPrefixes = Object.keys(prefixToDocumentMap).sort((a, b) => b.length - a.length)
    for (const p of sortedPrefixes) {
      if (prefix.startsWith(p)) return prefixToDocumentMap[p]
    }
    return null
  }, [])

  const isDocumentUploaded = useCallback((labelName: string): boolean => {
    const requiredDoc = getRequiredDocument(labelName)
    if (!requiredDoc) return false
    const doc = referenceDocs.find(d => d.file.name.toLowerCase() === requiredDoc.toLowerCase())
    // Return true only if document exists AND is not being processed
    return doc ? !processingDocs.has(doc.id) : false
  }, [getRequiredDocument, referenceDocs, processingDocs])
  
  // Check if a document is currently processing
  const isDocumentProcessing = useCallback((labelName: string): boolean => {
    const requiredDoc = getRequiredDocument(labelName)
    if (!requiredDoc) return false
    const doc = referenceDocs.find(d => d.file.name.toLowerCase() === requiredDoc.toLowerCase())
    return doc ? processingDocs.has(doc.id) : false
  }, [getRequiredDocument, referenceDocs, processingDocs])

  const transformRef = useRef<ReactZoomPanPinchRef>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const labelsContainerRef = useRef<HTMLDivElement>(null)

  const yoloData = useMemo(() => parseYOLOData(), [])

  useEffect(() => {
    if (pipelineData.labels.length > 0) { setIsProcessing(false); return }
    const timer = setTimeout(() => {
      const detectedLabels = yoloData.map(label => ({ id: label.id, x: label.x, y: label.y, label: label.label }))
      updatePipelineData({ labels: detectedLabels })
      setIsProcessing(false)
    }, 3000 + Math.random() * 2000)
    return () => clearTimeout(timer)
  }, [updatePipelineData, pipelineData.labels.length, yoloData])

  const getLabelPrefix = useCallback((labelName: string): string => {
    const match = labelName.match(/^[A-Za-z]+/)
    return match ? match[0].toUpperCase() : ""
  }, [])

  const prefixColorMap: Record<string, { bg: string; border: string; text: string }> = {
    "SD": { bg: "rgba(59, 130, 246, 0.15)", border: "rgb(59, 130, 246)", text: "rgb(59, 130, 246)" },
    "ASD": { bg: "rgba(16, 185, 129, 0.15)", border: "rgb(16, 185, 129)", text: "rgb(16, 185, 129)" },
    "ASSD": { bg: "rgba(139, 92, 246, 0.15)", border: "rgb(139, 92, 246)", text: "rgb(139, 92, 246)" },
    "PD": { bg: "rgba(236, 72, 153, 0.15)", border: "rgb(236, 72, 153)", text: "rgb(236, 72, 153)" },
    "ALSD": { bg: "rgba(245, 158, 11, 0.15)", border: "rgb(245, 158, 11)", text: "rgb(245, 158, 11)" },
    "LSD": { bg: "rgba(34, 197, 94, 0.15)", border: "rgb(34, 197, 94)", text: "rgb(34, 197, 94)" },
    "FS": { bg: "rgba(239, 68, 68, 0.15)", border: "rgb(239, 68, 68)", text: "rgb(239, 68, 68)" },
    "FSH": { bg: "rgba(168, 85, 247, 0.15)", border: "rgb(168, 85, 247)", text: "rgb(168, 85, 247)" },
    "LS": { bg: "rgba(6, 182, 212, 0.15)", border: "rgb(6, 182, 212)", text: "rgb(6, 182, 212)" },
    "FC": { bg: "rgba(251, 146, 60, 0.15)", border: "rgb(251, 146, 60)", text: "rgb(251, 146, 60)" },
    "TB": { bg: "rgba(99, 102, 241, 0.15)", border: "rgb(99, 102, 241)", text: "rgb(99, 102, 241)" },
    "SF": { bg: "rgba(20, 184, 166, 0.15)", border: "rgb(20, 184, 166)", text: "rgb(20, 184, 166)" },
    "SP": { bg: "rgba(249, 115, 22, 0.15)", border: "rgb(249, 115, 22)", text: "rgb(249, 115, 22)" },
    "AW": { bg: "rgba(147, 51, 234, 0.15)", border: "rgb(147, 51, 234)", text: "rgb(147, 51, 234)" },
    "AAD": { bg: "rgba(14, 165, 233, 0.15)", border: "rgb(14, 165, 233)", text: "rgb(14, 165, 233)" },
  }

  const getLabelSpec = useCallback((labelName: string) => {
    const defaultSpec = { material: "N/A", finish: "N/A", mitsuke: 0, mikomi: 0, kutsuzuri: "N/A" }
    const labelSpecs: Record<string, { material: string; finish: string; mitsuke: number; mikomi: number; kutsuzuri: string }> = {
      "ASD1": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "ASD2": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "ASSD1": { material: "ステンレス鋼板自動ドア", finish: "HL", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "ASSD3": { material: "ステンレス鋼板自動ドア", finish: "HL", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "SD1": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS HL" },
      "SD2": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS HL" },
      "SD3": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS HL" },
      "SD4": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS HL" },
      "SD5": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS HL" },
      "SD6": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS HL" },
      "SD7": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS HL" },
      "SD8": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS HL" },
      "SD9": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS HL" },
      "SD10": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS HL" },
      "SD11": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS HL" },
      "SD12": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS HL" },
      "PD1": { material: "木製(ｱﾙﾐﾌﾚｰﾑ)", finish: "塗装", mitsuke: 30, mikomi: 55, kutsuzuri: "高台排水" },
      "PD2": { material: "木製(ｱﾙﾐﾌﾚｰﾑ)", finish: "塗装", mitsuke: 30, mikomi: 55, kutsuzuri: "高台排水" },
      "PD3": { material: "木製(ｱﾙﾐﾌﾚｰﾑ)", finish: "塗装", mitsuke: 30, mikomi: 55, kutsuzuri: "高台排水" },
      "ALSD2": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "ALSD3": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "ALSD4": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "ALSD5": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "ALSD7": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "ALSD8": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "ALSD9": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "ALSD10": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "ALSD11": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "ALSD12": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS HL" },
      "LSD1": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD2": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD3": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD4": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD5": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD6": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD7": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD8": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD10": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 254, kutsuzuri: "SUS FB" },
      "LSD11": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 254, kutsuzuri: "SUS FB" },
      "LSD12": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD14": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD16": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD17": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD18": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "LSD20": { material: "鋼製(LS)1.6t", finish: "SOP", mitsuke: 25, mikomi: 222, kutsuzuri: "SUS FB" },
      "FS1": { material: "スチール(耐火)", finish: "DP", mitsuke: 135, mikomi: 115, kutsuzuri: "鋼製" },
      "FS2": { material: "スチール(耐火)", finish: "DP", mitsuke: 135, mikomi: 115, kutsuzuri: "鋼製" },
      "FS3": { material: "スチール(耐火)", finish: "DP", mitsuke: 135, mikomi: 115, kutsuzuri: "鋼製" },
      "FS4": { material: "スチール(耐火)", finish: "DP", mitsuke: 135, mikomi: 115, kutsuzuri: "鋼製" },
      "FS5": { material: "スチール(耐火)", finish: "DP", mitsuke: 135, mikomi: 115, kutsuzuri: "鋼製" },
      "FSH1": { material: "スチール(防煙)", finish: "DP", mitsuke: 135, mikomi: 115, kutsuzuri: "鋼製" },
      "FSH2": { material: "スチール(防煙)", finish: "DP", mitsuke: 135, mikomi: 115, kutsuzuri: "鋼製" },
      "LS1": { material: "軽量シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "LS2": { material: "軽量シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "LS3": { material: "軽量シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "LS19": { material: "軽量シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "FC1": { material: "軽量シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "FC2": { material: "軽量シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "FC3": { material: "軽量シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "FC4": { material: "高速シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "FC5": { material: "高速シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "FC6": { material: "高速シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "FC7": { material: "高速シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "FC8": { material: "高速シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "FC9": { material: "高速シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "FC10": { material: "高速シャッター", finish: "塗装", mitsuke: 0, mikomi: 0, kutsuzuri: "鋼製" },
      "TB1": { material: "ﾄｲﾚﾌﾞｰｽ", finish: "ﾒﾗﾐﾝ", mitsuke: 40, mikomi: 0, kutsuzuri: "なし" },
      "TB2": { material: "ﾄｲﾚﾌﾞｰｽ", finish: "ﾒﾗﾐﾝ", mitsuke: 40, mikomi: 0, kutsuzuri: "なし" },
      "TB3": { material: "ﾄｲﾚﾌﾞｰｽ", finish: "ﾒﾗﾐﾝ", mitsuke: 40, mikomi: 0, kutsuzuri: "なし" },
      "TB4": { material: "ﾄｲﾚﾌﾞｰｽ", finish: "ﾒﾗﾐﾝ", mitsuke: 40, mikomi: 0, kutsuzuri: "なし" },
      "SF1": { material: "鋼製(S)1.6t", finish: "SOP", mitsuke: 25, mikomi: 220, kutsuzuri: "SUS FB" },
      "SP1": { material: "ｶﾞﾗｽﾊﾟｰﾃｨｼｮﾝ", finish: "強化ｶﾞﾗｽ", mitsuke: 75, mikomi: 12, kutsuzuri: "なし" },
      "AW1": { material: "アルミ(AL)", finish: "アルマイト", mitsuke: 100, mikomi: 70, kutsuzuri: "アルミ" },
      "AW2": { material: "アルミ(AL)", finish: "アルマイト", mitsuke: 100, mikomi: 70, kutsuzuri: "アルミ" },
      "AW3": { material: "アルミ(AL)", finish: "アルマイト", mitsuke: 100, mikomi: 70, kutsuzuri: "アルミ" },
      "AAD1": { material: "アルミ自動ドア", finish: "アルマイト", mitsuke: 100, mikomi: 220, kutsuzuri: "アルミ" },
      "AAD2": { material: "アルミ自動ドア", finish: "アルマイト", mitsuke: 100, mikomi: 220, kutsuzuri: "アルミ" },
      "AAD3": { material: "アルミ自動ドア", finish: "アルマイト", mitsuke: 100, mikomi: 220, kutsuzuri: "アルミ" },
    }
    return labelSpecs[labelName] || defaultSpec
  }, [])

  const filteredLabels = useMemo(() => {
    return yoloData.filter(label => {
      const spec = getLabelSpec(label.label)
      const materialMatch = !filterMaterial || spec.material.toLowerCase().includes(filterMaterial.toLowerCase())
      const finishMatch = !filterFinish || spec.finish.toLowerCase().includes(filterFinish.toLowerCase())
      const frameMatch = !filterFrame || spec.mitsuke.toString().includes(filterFrame)
      return materialMatch && finishMatch && frameMatch
    })
  }, [yoloData, filterMaterial, filterFinish, filterFrame, getLabelSpec])

  // Group labels by name and count
  const groupedLabels = useMemo(() => {
    const groups: Record<string, { label: string; count: number; items: YOLOLabel[]; firstItem: YOLOLabel }> = {}
    
    filteredLabels.forEach(item => {
      if (!groups[item.label]) {
        groups[item.label] = { label: item.label, count: 0, items: [], firstItem: item }
      }
      groups[item.label].count++
      groups[item.label].items.push(item)
    })
    
    return Object.values(groups)
  }, [filteredLabels])

  const sortedGroups = useMemo(() => {
    const groups = [...groupedLabels]
    groups.sort((a, b) => {
      switch (sortMode) {
        case "name-asc": return a.label.localeCompare(b.label)
        case "name-desc": return b.label.localeCompare(a.label)
        case "position": return a.firstItem.y !== b.firstItem.y ? a.firstItem.y - b.firstItem.y : a.firstItem.x - b.firstItem.x
        default: return a.label.localeCompare(b.label)
      }
    })
    return groups
  }, [groupedLabels, sortMode])

  const scrollToLabel = useCallback((labelName: string, labelId?: string) => {
    // Set selected to the specific label id if provided, otherwise find the first item of the group
    if (labelId) {
      setSelectedLabelId(labelId)
    } else {
      const group = groupedLabels.find(g => g.label === labelName)
      if (group) setSelectedLabelId(group.firstItem.id)
    }
    if (labelsContainerRef.current) {
      const el = labelsContainerRef.current.querySelector(`[data-label-name="${labelName}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [groupedLabels])

  const zoomToLabel = useCallback((label: YOLOLabel) => {
    if (!transformRef.current || !imageContainerRef.current) return
    const targetScale = 0.3
    const img = imageContainerRef.current.querySelector('img')
    if (!img) return
    
    // Get the wrapper dimensions (the visible area)
    const wrapperWidth = 550 // match the height we set
    const wrapperHeight = 550
    
    // Calculate bbox center position in image coordinates
    const bboxCenterX = label.x * img.naturalWidth
    const bboxCenterY = label.y * img.naturalHeight
    
    // Calculate the position to center the bbox
    const targetX = (wrapperWidth / 2) - (bboxCenterX * targetScale)
    const targetY = (wrapperHeight / 2) - (bboxCenterY * targetScale)
    
    transformRef.current.setTransform(targetX, targetY, targetScale)
    scrollToLabel(label.label, label.id)
  }, [scrollToLabel])

  // Custom zoom functions for ±10%
  const handleZoomIn = useCallback(() => {
    if (!transformRef.current) return
    // Use zoomIn with step of 0.1 (10%)
    transformRef.current.zoomIn(0.1, 200)
  }, [])

  const handleZoomOut = useCallback(() => {
    if (!transformRef.current) return
    // Use zoomOut with step of 0.1 (10%)
    transformRef.current.zoomOut(0.1, 200)
  }, [])

  const openDetails = useCallback((label: YOLOLabel, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDocumentUploaded(label.label)) {
      alert(`Please upload "${getRequiredDocument(label.label)}" to view details`)
      return
    }
    setDetailsLabel(label)
  }, [isDocumentUploaded, getRequiredDocument])

  const onDropReference = useCallback((acceptedFiles: File[]) => {
    const newDocs = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    
    // Add new docs to state
    setReferenceDocs(prev => [...prev, ...newDocs])
    
    // Mark all new docs as processing
    const newDocIds = newDocs.map(d => d.id)
    setProcessingDocs(prev => new Set([...prev, ...newDocIds]))
    
    // Simulate processing delay (3-5 seconds) for each document
    newDocs.forEach(doc => {
      const delay = 3000 + Math.random() * 2000
      setTimeout(() => {
        setProcessingDocs(prev => {
          const next = new Set(prev)
          next.delete(doc.id)
          return next
        })
      }, delay)
    })
  }, [])

  const removeReferenceDoc = useCallback((id: string) => {
    setReferenceDocs(prev => {
      const doc = prev.find(d => d.id === id)
      if (doc) URL.revokeObjectURL(doc.previewUrl)
      return prev.filter(d => d.id !== id)
    })
    // Also remove from processing state if it was being processed
    setProcessingDocs(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropReference,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".svg", ".webp"] },
    multiple: true,
    maxSize: 10 * 1024 * 1024,
  })

  const renderedLabels = useMemo(() => {
    return yoloData.map((label) => {
      const prefix = getLabelPrefix(label.label)
      const color = prefixColorMap[prefix] || { bg: "rgba(100, 100, 100, 0.15)", border: "rgb(100, 100, 100)", text: "rgb(100, 100, 100)" }
      const isSelected = selectedLabelId === label.id
      return (
        <div
          key={label.id}
          onClick={() => { scrollToLabel(label.label, label.id) }}
          style={{
            position: 'absolute',
            left: `${(label.x - label.w / 2) * 100}%`,
            top: `${(label.y - label.h / 2) * 100}%`,
            width: `${label.w * 100}%`,
            height: `${label.h * 100}%`,
            border: `2px solid ${color.border}`,
            backgroundColor: color.bg,
            cursor: 'pointer',
            zIndex: isSelected ? 10 : 1,
            boxShadow: isSelected ? `0 0 0 2px white, 0 0 8px ${color.border}` : 'none',
          }}
          className="transition-all"
        >
          <div style={{ position: 'absolute', top: '-18px', left: '0', backgroundColor: color.border, color: 'white', padding: '1px 4px', fontSize: '9px', fontWeight: 'bold', borderRadius: '2px', whiteSpace: 'nowrap' }}>
            {label.label} {(label.confidence * 100).toFixed(0)}%
          </div>
          <div style={{ position: 'absolute', top: '-3px', left: '-3px', width: '6px', height: '6px', backgroundColor: color.border, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '6px', height: '6px', backgroundColor: color.border, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-3px', left: '-3px', width: '6px', height: '6px', backgroundColor: color.border, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '6px', height: '6px', backgroundColor: color.border, borderRadius: '50%' }} />
        </div>
      )
    })
  }, [yoloData, getLabelPrefix, prefixColorMap, selectedLabelId, zoomToLabel, scrollToLabel])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left Panel - AI Label Recognition */}
      <div className="lg:col-span-8">
        <Card className="overflow-hidden border shadow-sm">
          {/* Header */}
          <CardHeader className="border-b py-3 px-4 flex flex-row items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={goToPrevStep} className="text-xs px-2">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded border border-primary/20">
                <Scan className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Label Recognition</CardTitle>
                  <p className="text-xs text-muted-foreground">Automatic coordinate extraction</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{(currentScale * 100).toFixed(0)}%</span>
              <div className="flex items-center border rounded">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={handleZoomIn}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none border-x" onClick={handleZoomOut}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => transformRef.current?.resetTransform()}>
                  <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              </div>
            </div>
          </CardHeader>

          {/* Image Content */}
          <CardContent className="p-0 relative bg-muted/20 overflow-hidden" style={{ height: '550px' }}>
            {isProcessing && (
              <div className="absolute inset-0 z-50 bg-background/95 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-sm font-semibold text-primary">Analyzing plan...</p>
                <p className="text-xs text-muted-foreground mt-2">Locating door labels</p>
              </div>
            )}

            <TransformWrapper
              ref={transformRef}
              initialScale={0.1}
              minScale={0.1}
              maxScale={5}
              centerOnInit={true}
              limitToBounds={false}
              wheel={{ step: 0.2, smoothStep: 0.001 }}
              panning={{ velocityDisabled: true }}
              doubleClick={{ mode: "reset" }}
              onTransformed={(_, state: { scale: number }) => setCurrentScale(state.scale)}
            >
              <TransformComponent wrapperStyle={{ width: '100%', height: '550px' }} contentStyle={{ width: '100%', height: '100%' }}>
                <div ref={imageContainerRef} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pipelineData.imageUrl || "/placeholder.svg"} alt="Floor Plan" className="max-w-none select-none" draggable={false} />
                  {!isProcessing && renderedLabels}
                  </div>
              </TransformComponent>
            </TransformWrapper>

            {/* Bottom info bar */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded border text-xs text-muted-foreground z-10">
              <Scan className="w-3.5 h-3.5" />
              Scroll to zoom, drag to pan
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Detected Labels + Reference Docs */}
      <div className="lg:col-span-4 flex flex-col gap-3">
        {/* Detected Labels */}
        <Card className="border shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-card space-y-3">
            {/* Title row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Detected Labels</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-primary/5 text-primary border-primary/20">
                {sortedGroups.length} types / {yoloData.length} total
              </Badge>
            </div>
            
            {/* Sort buttons */}
            <div className="flex items-center gap-2">
              <Button variant={sortMode === "default" ? "default" : "outline"} size="sm" className="h-7 text-xs px-3 rounded-md" onClick={() => setSortMode("default")}>All</Button>
              <Button variant={sortMode.startsWith("name") ? "default" : "outline"} size="sm" className="h-7 text-xs px-3 rounded-md" onClick={() => setSortMode(sortMode === "name-asc" ? "name-desc" : "name-asc")}>Name</Button>
              <Button variant={sortMode === "position" ? "default" : "outline"} size="sm" className="h-7 text-xs px-3 rounded-md" onClick={() => setSortMode("position")}>Pos</Button>
            </div>
            
            {/* Filter inputs with labels */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground whitespace-nowrap">材質:</span>
                <Input placeholder="銅製..." value={filterMaterial} onChange={(e) => setFilterMaterial(e.target.value)} className="h-7 w-20 text-xs px-2" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground whitespace-nowrap">仕上:</span>
                <Input placeholder="SOP..." value={filterFinish} onChange={(e) => setFilterFinish(e.target.value)} className="h-7 w-20 text-xs px-2" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground whitespace-nowrap">見付:</span>
                <Input placeholder="25..." value={filterFrame} onChange={(e) => setFilterFrame(e.target.value)} className="h-7 w-16 text-xs px-2" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 overflow-hidden">
            <div ref={labelsContainerRef} className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar p-3">
              {isProcessing ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
              ) : sortedGroups.length > 0 ? (
                sortedGroups.map((group) => {
                  const spec = getLabelSpec(group.label)
                  const prefix = getLabelPrefix(group.label)
                  const color = prefixColorMap[prefix] || { bg: "rgba(100,100,100,0.15)", border: "rgb(100,100,100)", text: "rgb(100,100,100)" }
                  // Check if any item in this group is selected
                  const isSelected = group.items.some(item => item.id === selectedLabelId)
                  const docUploaded = isDocumentUploaded(group.label)
                  const docProcessing = isDocumentProcessing(group.label)

                  return (
                    <div
                      key={group.label}
                      data-label-name={group.label}
                      className={cn(
                        "flex rounded-xl border-l-4 bg-white border border-gray-200 cursor-pointer transition-all shadow-sm overflow-hidden",
                        isSelected ? "ring-2 ring-blue-400 bg-blue-50 border-blue-200" : "hover:bg-gray-50 hover:shadow-md"
                      )}
                      style={{ borderLeftColor: color.border }}
                      onClick={() => { zoomToLabel(group.firstItem) }}
                    >
                      {/* Left content */}
                      <div className="flex-1 px-3 py-3">
                        {/* Row 1: Label badge + count + crosshair */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span 
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm"
                            style={{ backgroundColor: color.border, color: 'white' }}
                          >
                            {group.label}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className="text-[10px] h-5 px-2 font-semibold bg-gray-100 text-gray-600"
                          >
                            x{group.count}
                          </Badge>
                          {isSelected && <Crosshair className="w-3.5 h-3.5 text-blue-500 animate-pulse" />}
                        </div>
                        
                        {/* Row 2 & 3 - specs (show loading when processing, specs when uploaded) */}
                        {docProcessing ? (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-[11px] text-gray-400">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Processing document...</span>
                            </div>
                          </div>
                        ) : docUploaded ? (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-[11px] text-gray-600">
                              <span className="text-gray-400">建具:</span>{" "}
                              <span className="font-medium text-gray-700">{spec.material}</span>
                              <span className="ml-3 text-gray-400">仕上:</span>{" "}
                              <span className="font-medium text-blue-600">{spec.finish}</span>
                            </div>
                            <div className="mt-1 text-[11px] text-gray-500">
                              <span>見付: <span className="font-medium text-gray-700">{spec.mitsuke}</span></span>
                              <span className="ml-3">見込: <span className="font-medium text-gray-700">{spec.mikomi}</span></span>
                              <span className="ml-3">沓摺: <span className="font-medium text-gray-700">{spec.kutsuzuri}</span></span>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Right column - Eye/Lock button */}
                      <button
                        className={cn(
                          "flex items-center justify-center w-10 border-l transition-all",
                          docProcessing
                            ? "bg-blue-50 text-blue-400 border-blue-100 cursor-wait"
                            : docUploaded 
                              ? "bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 border-gray-200" 
                              : "bg-gray-50 text-gray-300 cursor-not-allowed border-gray-100"
                        )}
                        onClick={(e) => !docProcessing && openDetails(group.firstItem, e)}
                        title={docProcessing ? "Processing..." : docUploaded ? "View Details" : "Upload reference document to unlock"}
                      >
                        {docProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : docUploaded ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">No labels found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generate Report Button */}
              <Button onClick={goToNextStep} className="w-full h-10 font-semibold shadow" disabled={isProcessing}>
                Generate Report
              </Button>

        {/* Reference Documents - at bottom */}
        <Card className="border shadow-sm bg-gradient-to-b from-white to-gray-50">
          <CardHeader className="py-3 px-4 border-b bg-white flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Upload className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Reference Documents</CardTitle>
                <p className="text-[11px] text-gray-500">Upload images for comparison</p>
              </div>
            </div>
            {referenceDocs.length > 0 && (
              <Badge variant="outline" className="text-xs font-semibold bg-blue-50 text-blue-600 border-blue-200">
                {referenceDocs.length}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-4">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all",
                isDragActive 
                  ? "border-blue-400 bg-blue-50" 
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Click or drag images</p>
              <p className="text-[11px] text-gray-400 mt-1">Multiple files allowed, max 10MB each</p>
            </div>
            
            {/* Uploaded Files */}
            {referenceDocs.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Uploaded Files</span>
                  <button 
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => {
                      referenceDocs.forEach(doc => URL.revokeObjectURL(doc.previewUrl))
                      setReferenceDocs([])
                      setProcessingDocs(new Set())
                    }}
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {referenceDocs.map((doc) => {
                    const isProcessingDoc = processingDocs.has(doc.id)
                    return (
                      <div 
                        key={doc.id} 
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg border group transition-all",
                          isProcessingDoc 
                            ? "bg-blue-50 border-blue-200" 
                            : "bg-white border-gray-200"
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={doc.previewUrl} alt={doc.file.name} className="w-full h-full object-cover" />
                          {isProcessingDoc && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">{doc.file.name}</p>
                          <p className={cn(
                            "text-[10px]",
                            isProcessingDoc ? "text-blue-500" : "text-gray-400"
                          )}>
                            {isProcessingDoc ? "Processing..." : `${(doc.file.size / 1024 / 1024).toFixed(2)} MB`}
                          </p>
                        </div>
                        {!isProcessingDoc && (
                          <button
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => removeReferenceDoc(doc.id)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {isProcessingDoc && (
                          <div className="p-1">
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!detailsLabel} onOpenChange={(open) => !open && setDetailsLabel(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{detailsLabel?.label}</DialogTitle>
          </DialogHeader>
          {detailsLabel && (
            <div className="flex items-center justify-center mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/dataset/image/${detailsLabel.label}.png`}
                alt={detailsLabel.label}
                className="max-w-full max-h-[75vh] object-contain"
                onError={(e) => { e.currentTarget.src = "/placeholder.svg" }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
