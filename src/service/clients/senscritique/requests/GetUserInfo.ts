import {gql} from "graphql-request";

export class GetUserInfo {
    
    public static readonly doc = gql`
    query Me {
        me {    
            id
            name
        }
    }
    `
    
}