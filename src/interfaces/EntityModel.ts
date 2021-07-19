/**
 * Interface to represent entity model, i.e entity with useful links attached.
 *
 * @author kawaiifoxx
 */
export interface EntityModel<T> {
    content: T
    _links: Map<string, string>
}