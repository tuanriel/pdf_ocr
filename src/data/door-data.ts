export type DoorLabel = {
  id: string
  x: number
  y: number
  label: string
}

export type DoorStatistics = {
  id: string
  mark: string
  type: string
  location: string
  quantity: number
  material: string
  finish: string
  frame: string
  lock: string
  handle: string
  notes: string
}

export const MOCK_DOORS: DoorLabel[] = [
  { id: "d1", x: 25.5, y: 30.2, label: "D01" },
  { id: "d2", x: 45.2, y: 30.2, label: "D02" },
  { id: "d3", x: 65.8, y: 60.5, label: "D03" },
  { id: "d4", x: 30.1, y: 70.8, label: "D04" },
  { id: "d5", x: 15.4, y: 45.3, label: "D05" },
  { id: "d6", x: 55.7, y: 15.9, label: "D06" },
  { id: "d7", x: 80.2, y: 40.1, label: "D07" },
  { id: "d8", x: 10.5, y: 85.4, label: "D08" },
  { id: "d9", x: 90.1, y: 20.3, label: "D09" },
  { id: "d10", x: 50.0, y: 50.0, label: "D10" },
]

export const getStatisticsForLabel = (label: DoorLabel): DoorStatistics => ({
  id: label.id,
  mark: label.label,
  type: "鋼製自動片引きドア (Steel Automatic Sliding Door)",
  location: `Floor 1, Zone B (X:${label.x}%, Y:${label.y}%)`,
  quantity: 1,
  material: "鋼製(LS)1.6t",
  finish: "SOP (Standard Oil Paint)",
  frame: "鋼製(S)1.6t 見付 25 / 見込 222",
  lock: "[外側] シルダー / [内側] 空錠",
  handle: "SUS HL (Stainless Steel Hairline)",
  notes: "Engine BOX, Garari included",
})
