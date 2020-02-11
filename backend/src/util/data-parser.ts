import isEmpty from 'lodash/isEmpty'
import { readFile, utils as xlsxUtils, WorkBook } from 'xlsx'

export function parseExcelData (dataPath: string) {
  const xlsxData: WorkBook = readFile(dataPath)
  const arrJson: Object[] = xlsxUtils.sheet_to_json(xlsxData.Sheets[xlsxData.SheetNames[0]], { range: 1 })
  const typeDef: Object = arrJson[0]
  const usageDef: Object = arrJson[1]
  arrJson.splice(0, 2)

  const resData: any[] = []
  for (const row of arrJson) {
    const obj: any = {}
    const listObj: any = {}
    for (const [key, value] of Object.entries(row)) {
      if (!usageDef[key] || usageDef[key].toLowerCase() === 'none') {
        continue
      }
      const convertedValue = adjustType(typeDef, key, value)
      if (undefined === convertedValue) {
        continue
      }
      if (isArrayType(typeDef, key)) {
        listObj[key] = convertedValue
      } else {
        obj[key] = convertedValue
      }
    }
    if (obj.id && !isEmpty(obj) && resData.findIndex(data => data.id === obj.id) < 0) {
      resData.push(obj)
    }
    if (!isEmpty(listObj)) {
      const lastObj = resData[resData.length - 1]
      if (lastObj.list === undefined) {
        lastObj.list = []
      }
      lastObj.list.push(listObj)
    }
  }

  return { usageDef, json: resData }
}

function isArrayType (typeDef: object, key: string): boolean {
  return typeDef[key].toLowerCase().search(/^array./) >= 0
}

function adjustType (typeDef: object, key: string, value: any): any {
  if (!typeDef[key]) {
    return undefined
  }
  let type = typeDef[key].toLowerCase()
  if (isArrayType(typeDef, key)) {
    type = type.slice(6)
  }
  switch (type) {
    case 'int':
    case 'double':
      return Number(value)
    case 'bool':
      return Boolean(value)
    case 'string':
      return String(value)
    default:
      return undefined
  }
}
