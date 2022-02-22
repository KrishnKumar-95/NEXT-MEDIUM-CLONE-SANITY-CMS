// This is the definition file of the TypeScript
// There we can define the type Which we can use in interface
// Comment type is used in the Post at key -> comment
export interface Post{
    _id: string,
    _createdAt: string,
    title: string,
    author:{
        name: string,
        image: string,
    };
    comments: Comment[];
    description: string;
    mainImage: {
        assets:{
            url: string
        };
    };
    slug: {
        current: string;
    };
    body: [object]
}

export interface Comment{
    approved: boolean;
    comment: string;
    email: string;
    name: string;
    post:{
        _ref: string,
        _type: string
    };
    _createdAt: string;
    _id: string;
    _ref: string;
    _type: string;
    _updatedAt: string
}