export const getEnumKeys = <T>(enumToDeconstruct: T): Array<keyof typeof enumToDeconstruct> => {
    return Object.keys(enumToDeconstruct as object) as Array<keyof typeof enumToDeconstruct>
}