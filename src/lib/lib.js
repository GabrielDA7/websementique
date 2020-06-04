export const extractIdFromWikidataUrl = (url) => {
    if (url === undefined)
        return url;
    return url.replace("http://www.wikidata.org/entity/", "");
};

export const mergeDuplicate = (tree) => {
    let mergedPerson = [];
    tree.forEach(person => {
        if (mergedPerson.filter(p => p.name === person.name).length > 0)
            return;
        let samePerson = tree.filter(p => p.name === person.name);
        samePerson[0].child = samePerson.map(p => p.child).filter(child => child !== undefined);
        mergedPerson.push(samePerson[0]);
    });
    return mergedPerson;
};


export const formatData = (people) => {
    let rootPerson = people.filter(person => person.depth === 0);
    rootPerson = rootPerson[0];
    getChildren(rootPerson, people);
    return rootPerson;
};

export const getChildren = (person, people) => {
    let children = people.filter(p => person.child.includes(p.id));
    children.forEach(child => getChildren(child, people));
    person.children = children;
};
