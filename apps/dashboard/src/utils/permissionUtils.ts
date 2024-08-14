import { useUserStore } from "@sudosos/sudosos-frontend-common";


const userStore = useUserStore();


/**
 * Performs an access check for the given parameters.
 * This method can be used to verify if a user with the given role(s)
 * is permitted to perform the given action (eg. create, read, update, delete) on the given
 * properties of the given data entity, to which the user has the given relations.
 *
 * @param action - The action on the entity to check access for.
 *    Commonly used actions are 'create', 'get', 'update', and 'delete'.
 * @param relations - The ownership relations towards the object.
 *    The ownership relations describes the status of the user related to the object:
 *    the user can be the owner, organ, or not related at all.
 *    Commonly used ownership relations are 'own', 'organ' and 'all'.
 * @param entity - The entity type name of the object. Most often this is a
 *    database entity, but it could also be a computed entity such as 'balance'.
 * @param attributes - The list of attributes to access. The wildcard '*' can be
 *    used to verify that the user is allowed to access all properties.
 * @returns {boolean} - True if access is allowed, false otherwise.
 */
export function hasPermission(
    action: string,
    relations: string | string[],
    entity: string,
    attributes: string[]
) {

    // Convert relations to array if a single relation is given.
    let relationsArray: string[];
    if (typeof relations === 'string') {
        relationsArray = [relations];
    } else {
        relationsArray = relations;
    }
    // Add the relation "all" to the relations, because if you have permission to access "all",
    // it does not matter what the given relation is.
    if (relationsArray.indexOf('all') === -1) {
        relationsArray.push('all');
    }


    // For all found permission records, get a single list of all attributes the user is allowed to access
    const allPermissions = userStore.current.rolesWithPermissions.flatMap(r => r.permissions);
    const applicableAttributes = allPermissions
        .filter(p => p.entity == entity).flatMap(p => p.actions)
        .filter(a => a.action == action).flatMap(a => a.relations)
        .filter(r => relations.includes(r.relation)).flatMap(r => r.attributes);

    // If the user has a wildcard as attribute, they are allowed to access everything, so return true.
    const hasStar = applicableAttributes.some((a) => a === '*');
    if (hasStar) {
        return true;
    }

    // Find all attributes that the user should have, but the current set of permissions does not provide
    const disallowedAttributes = attributes.filter((a) => !applicableAttributes.includes(a));
    // Return whether the user is allowed to access all attributes
    return disallowedAttributes.length === 0;
}
