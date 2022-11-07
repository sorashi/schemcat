class GlobalIdGenerator {
  private _id = 0
  private static _instance: GlobalIdGenerator
  private constructor() {}
  public nextId() {
    return ++this._id
  }
  public resetId() {
    this._id = 0
  }
  public set id(value: number) {
    this._id = value
  }
  public static get Instance() {
    return this._instance || (this._instance = new this())
  }
}

const globalIdGenerator = GlobalIdGenerator.Instance
export default globalIdGenerator
