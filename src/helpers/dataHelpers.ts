import { createListCollection } from "@chakra-ui/react"

export const getChakraCollectionFromSimpleArray = (array: number[] | string[]) => {
  return createListCollection({
    items: array.map((item) => ({ value: item, label: item }))
  })
}
