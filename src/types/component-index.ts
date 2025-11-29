export interface ComponentIndexData {
    name: string;
    id: string;
}

export class ComponentIndex {
    public name: string;
    public id: string;

    constructor(data: ComponentIndexData) {
        this.name = data.name;
        this.id = data.id;
    }

    static parse(data: string): ComponentIndex {
        const parsed = JSON.parse(data);
        return new this(parsed);
    }

    toString(): string {
        return JSON.stringify(this);
    }
}
