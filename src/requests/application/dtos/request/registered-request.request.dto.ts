export class RegisteredRequestRequest {
    constructor(
        public readonly id: number,
        public readonly message: string,
        public readonly date: string,
        public readonly technicalId: number
    ) {}
}