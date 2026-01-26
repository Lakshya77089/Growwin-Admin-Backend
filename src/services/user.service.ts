export class UserService {
    async getUsers() {
        return [
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Doe" }
        ];
    }
}
