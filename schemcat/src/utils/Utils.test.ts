import { getEnumKeys } from "./Utils"

test("getEnumKeys returns all keys of an enum", () => {
    enum TestEnum {
        A = "AValue",
        B = "BValue",
        C = "CValue"
    }
    expect(getEnumKeys(TestEnum)).toEqual(["A", "B", "C"])
})