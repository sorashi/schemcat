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
  private subIds: Map<number, number[]> = new Map<number, number[]>()
  public getSubIds(id: number, count: number) {
    let subIds = this.subIds.get(id)
    if (!subIds) {
      subIds = []
      this.subIds.set(id, subIds)
    }
    for (let i = 0; i < count - subIds.length; i++) {
      subIds.push(this.nextId())
    }
    return subIds
  }
}

const globalIdGenerator = GlobalIdGenerator.Instance
export default globalIdGenerator
