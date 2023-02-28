/**
 * The entry point to the Schemcat model.
 *
 * When writing a new class, make sure it has a parameter-less constructor (it can have all parameters with a specified default value).
 * This is in order for each class to have a default instance to which we can assign a plain JS object.
 * That is done when deserializing the model from a source that creates plain JS objects.
 * Then, for all properties of a class type that are expected to be a class instance, an attribute specifying the type is required, otherwise it won't be deserializable.
 * Note that
 * - union types,
 * - explicit exclusion and inclusion,
 * - and inclusion of computed properties (including get accessors and function values)
 * are supported, among other things.
 * See the [`class-transformer` documentation](https://github.com/typestack/class-transformer#working-with-nested-objects).
 *
 * Furthermore, make sure that the class has a property [immerable] = true.
 * That is needed for `immer` to draft the class and preserve its prototype chain.
 *
 * Also, make sure the model has no internal references and no instance is directly referenced by more than one other instance (there is only an owner).
 * This can be achieved by using internal IDs instead of object references.
 * This is because in React we must consider everything immutable (like in pure functional programming).
 * Instead of mutating, a new object is created, but it doesn't mutate other referenced instances which leads to state inconsistency.
 *
 * To summarize, all restrictions on the model are:
 * 1. Each class has a parameter-less constructor.
 * 2. Each class has the property [immerable] = true.
 * 3. Each class has `@Type` annotations on properties that need it.
 * 4. The whole model should form an arborescence structure (a directed rooted tree where the underlying graph has no cycles).
 * @module
 */

export * from './DiagramModel'
