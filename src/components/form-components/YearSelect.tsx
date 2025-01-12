import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "../ui/select"
import { getChakraCollectionFromSimpleArray } from "../../helpers/dataHelpers"
import { useMemo } from "react"

function YearSelect({
  years,
  onYearChange
}: {
  years: number[],
  onYearChange: (year: number) => void
  }) {
  const yearsCollection = useMemo(
    () => getChakraCollectionFromSimpleArray(years),
    [years])

  return (
    <SelectRoot
      collection={yearsCollection}
      width={200}
      onValueChange={(year) => onYearChange(Number(year.value))}
    >
      <SelectTrigger clearable>
        <SelectValueText placeholder="Select a year" />
      </SelectTrigger>
      <SelectContent>
        {yearsCollection.items.map((year) => (
          <SelectItem key={year.value} item={year}>
            {year.value}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}

export default YearSelect
